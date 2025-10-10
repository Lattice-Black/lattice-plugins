import Stripe from 'stripe';

// Initialize Stripe client
const stripeSecretKey = process.env['STRIPE_SECRET_KEY'];

if (!stripeSecretKey) {
  console.warn('STRIPE_SECRET_KEY not set - Stripe features will be disabled');
}

export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2025-09-30.clover',
      typescript: true,
    })
  : null;

// Price IDs for different subscription tiers
export const PRICE_IDS = {
  basic: process.env['STRIPE_PRICE_ID_BASIC'] || '',
  pro: process.env['STRIPE_PRICE_ID_PRO'] || '',
  enterprise: process.env['STRIPE_PRICE_ID_ENTERPRISE'] || '',
};

// Webhook secret for verifying Stripe webhook signatures
export const WEBHOOK_SECRET = process.env['STRIPE_WEBHOOK_SECRET'] || '';
