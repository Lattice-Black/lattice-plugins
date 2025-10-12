import { stripe, PRICE_IDS } from '../lib/stripe';
import { pool } from '../lib/db';
import { SubscriptionTier } from '../lib/tiers';

type PaidTier = 'basic' | 'pro' | 'enterprise';

/**
 * Payment service for managing subscriptions
 */
export class PaymentService {
  /**
   * Create a Stripe checkout session for a new subscription
   */
  async createCheckoutSession(
    userId: string,
    tier: PaidTier,
    successUrl: string,
    cancelUrl: string
  ): Promise<string> {
    if (!stripe) {
      throw new Error('Stripe is not configured');
    }

    const priceId = PRICE_IDS[tier as keyof typeof PRICE_IDS];
    if (!priceId) {
      throw new Error(`Price ID not configured for tier: ${tier}`);
    }

    // Get or create Stripe customer
    const customer = await this.getOrCreateCustomer(userId);

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        tier,
      },
    });

    if (!session.url) {
      throw new Error('Failed to create checkout session');
    }

    return session.url;
  }

  /**
   * Create a Stripe billing portal session
   */
  async createBillingPortalSession(
    userId: string,
    returnUrl: string
  ): Promise<string> {
    if (!stripe) {
      throw new Error('Stripe is not configured');
    }

    const customer = await this.getOrCreateCustomer(userId);

    const session = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: returnUrl,
    });

    return session.url;
  }

  /**
   * Get or create a Stripe customer for a user
   */
  private async getOrCreateCustomer(userId: string): Promise<{ id: string }> {
    if (!stripe) {
      throw new Error('Stripe is not configured');
    }

    // Check if user already has a Stripe customer
    const result = await pool.query(
      'SELECT stripe_customer_id FROM subscriptions WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length > 0 && result.rows[0].stripe_customer_id) {
      return { id: result.rows[0].stripe_customer_id };
    }

    // Get user email for Stripe customer
    const userResult = await pool.query(
      'SELECT email FROM profiles WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      throw new Error('User not found');
    }

    const email = userResult.rows[0].email;

    // Create new Stripe customer
    const customer = await stripe.customers.create({
      email,
      metadata: {
        userId,
      },
    });

    // Store customer ID in database
    await pool.query(
      `INSERT INTO subscriptions (user_id, stripe_customer_id, status, plan, tier)
       VALUES ($1, $2, 'inactive', 'free', 'free')
       ON CONFLICT (user_id)
       DO UPDATE SET stripe_customer_id = $2`,
      [userId, customer.id]
    );

    return { id: customer.id };
  }

  /**
   * Get subscription status for a user
   */
  async getSubscriptionStatus(userId: string): Promise<{
    status: string;
    plan: string;
    currentPeriodEnd: Date | null;
    trialEnd: Date | null;
  } | null> {
    const result = await pool.query(
      `SELECT status, plan, current_period_end, trial_end
       FROM subscriptions
       WHERE user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return {
      status: result.rows[0].status,
      plan: result.rows[0].plan,
      currentPeriodEnd: result.rows[0].current_period_end,
      trialEnd: result.rows[0].trial_end,
    };
  }

  /**
   * Map Stripe price ID to tier
   */
  private getTierFromPriceId(priceId: string): SubscriptionTier {
    const priceIds = {
      [PRICE_IDS.basic]: 'basic' as const,
      [PRICE_IDS.pro]: 'pro' as const,
      [PRICE_IDS.enterprise]: 'enterprise' as const,
    };

    return priceIds[priceId] || 'free';
  }

  /**
   * Update subscription from Stripe webhook event
   */
  async updateSubscriptionFromWebhook(
    stripeSubscription: any,
    userId: string
  ): Promise<void> {
    const status = stripeSubscription.status;
    const plan =
      stripeSubscription.items.data[0]?.price?.lookup_key || 'unknown';
    const priceId = stripeSubscription.items.data[0]?.price?.id;
    const tier = priceId ? this.getTierFromPriceId(priceId) : 'free';
    const currentPeriodEnd = new Date(
      stripeSubscription.current_period_end * 1000
    );
    const trialEnd = stripeSubscription.trial_end
      ? new Date(stripeSubscription.trial_end * 1000)
      : null;

    await pool.query(
      `INSERT INTO subscriptions
       (user_id, stripe_subscription_id, status, plan, tier, current_period_end, trial_end)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (user_id)
       DO UPDATE SET
         stripe_subscription_id = $2,
         status = $3,
         plan = $4,
         tier = $5,
         current_period_end = $6,
         trial_end = $7,
         updated_at = NOW()`,
      [userId, stripeSubscription.id, status, plan, tier, currentPeriodEnd, trialEnd]
    );
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(userId: string): Promise<void> {
    if (!stripe) {
      throw new Error('Stripe is not configured');
    }

    const result = await pool.query(
      'SELECT stripe_subscription_id FROM subscriptions WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0 || !result.rows[0].stripe_subscription_id) {
      throw new Error('No active subscription found');
    }

    const subscriptionId = result.rows[0].stripe_subscription_id;

    // Cancel at period end
    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    await pool.query(
      `UPDATE subscriptions
       SET status = 'canceling', updated_at = NOW()
       WHERE user_id = $1`,
      [userId]
    );
  }
}
