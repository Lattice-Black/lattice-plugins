import { pool } from '../lib/db';
import { SubscriptionTier, getTierLimits, canAddServices } from '../lib/tiers';

/**
 * Subscription information
 */
export interface UserSubscription {
  tier: SubscriptionTier;
  status: string;
  currentPeriodEnd: Date | null;
  trialEnd: Date | null;
}

/**
 * Service for checking subscription tiers and limits
 */
export class SubscriptionService {
  /**
   * Get user's subscription tier
   * Returns 'free' if no subscription found
   */
  async getUserTier(userId: string): Promise<SubscriptionTier> {
    const result = await pool.query(
      'SELECT tier FROM subscriptions WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return 'free';
    }

    return result.rows[0].tier as SubscriptionTier;
  }

  /**
   * Get user's full subscription information
   */
  async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    const result = await pool.query(
      `SELECT tier, status, current_period_end, trial_end
       FROM subscriptions
       WHERE user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return {
        tier: 'free',
        status: 'inactive',
        currentPeriodEnd: null,
        trialEnd: null,
      };
    }

    return {
      tier: result.rows[0].tier,
      status: result.rows[0].status,
      currentPeriodEnd: result.rows[0].current_period_end,
      trialEnd: result.rows[0].trial_end,
    };
  }

  /**
   * Get user's current service count
   */
  async getUserServiceCount(userId: string): Promise<number> {
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM services WHERE user_id = $1',
      [userId]
    );

    return parseInt(result.rows[0].count, 10);
  }

  /**
   * Check if user can add more services based on their tier
   */
  async canUserAddServices(
    userId: string,
    servicesToAdd: number = 1
  ): Promise<{ allowed: boolean; reason?: string; currentCount?: number; maxAllowed?: number }> {
    const tier = await this.getUserTier(userId);
    const currentCount = await this.getUserServiceCount(userId);
    const limits = getTierLimits(tier);

    const allowed = canAddServices(tier, currentCount, servicesToAdd);

    if (!allowed) {
      return {
        allowed: false,
        reason: `Service limit exceeded. Your ${tier} plan allows ${limits.maxServices} service${limits.maxServices === 1 ? '' : 's'}, you currently have ${currentCount}.`,
        currentCount,
        maxAllowed: limits.maxServices,
      };
    }

    return { allowed: true, currentCount, maxAllowed: limits.maxServices };
  }

  /**
   * Check if user has access to a specific feature
   */
  async userHasFeature(
    userId: string,
    feature: 'advancedMetrics' | 'realTimeMonitoring' | 'customIntegrations' | 'advancedAnalytics'
  ): Promise<boolean> {
    const tier = await this.getUserTier(userId);
    const limits = getTierLimits(tier);
    return limits[feature];
  }

  /**
   * Update user's tier
   */
  async updateUserTier(userId: string, tier: SubscriptionTier): Promise<void> {
    await pool.query(
      `INSERT INTO subscriptions (user_id, tier, status, plan)
       VALUES ($1, $2, 'active', $2)
       ON CONFLICT (user_id)
       DO UPDATE SET tier = $2, updated_at = NOW()`,
      [userId, tier]
    );
  }
}
