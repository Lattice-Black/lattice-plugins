# Production Setup Guide

This guide walks you through setting up Lattice for production with Stripe payments.

## ✅ Prerequisites

- [ ] Stripe account created
- [ ] Railway account for API deployment
- [ ] Vercel account for Web deployment (or use Railway)
- [ ] Domain name (optional but recommended)

## 📋 Step-by-Step Setup

### 1. Stripe Configuration

#### 1.1 Create Products in Stripe Dashboard

Go to https://dashboard.stripe.com/test/products and create 3 products:

**Basic Plan:**
- Name: Basic Plan
- Pricing: $10/month (or your desired price)
- Billing period: Monthly
- Copy the Price ID (starts with `price_`)

**Pro Plan:**
- Name: Pro Plan
- Pricing: $25/month
- Billing period: Monthly
- Copy the Price ID

**Enterprise Plan:**
- Name: Enterprise Plan
- Pricing: $99/month
- Billing period: Monthly
- Copy the Price ID

#### 1.2 Get API Keys

1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy **Secret key** (starts with `sk_test_`)
3. For production, switch to Live mode and copy `sk_live_` key

#### 1.3 Test Locally First

```bash
# In packages/api/.env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_ID_BASIC=price_...
STRIPE_PRICE_ID_PRO=price_...
STRIPE_PRICE_ID_ENTERPRISE=price_...

# Start Stripe webhook forwarding
stripe listen --forward-to localhost:3000/api/v1/webhooks/stripe
# Copy the webhook secret (whsec_...)
STRIPE_WEBHOOK_SECRET=whsec_...
```

Test a payment flow:
1. Visit http://localhost:3010/pricing
2. Click "Subscribe" on any plan
3. Use test card: `4242 4242 4242 4242`, any future date, any CVC
4. Verify webhook is received

### 2. Supabase Setup

Your Supabase project is already configured at:
`https://hgruvuhrtznijhsqvagn.supabase.co`

#### 2.1 Verify Database Tables

In Supabase Dashboard → SQL Editor, run:

```sql
-- Check if subscriptions table exists
SELECT * FROM subscriptions LIMIT 1;
```

If table doesn't exist, create it:

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT NOT NULL,
  plan TEXT NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own subscription
CREATE POLICY "Users can view own subscription"
  ON subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Service role can manage all subscriptions
CREATE POLICY "Service role can manage subscriptions"
  ON subscriptions
  FOR ALL
  USING (auth.role() = 'service_role');
```

#### 2.2 Get Service Role Key

1. Go to https://supabase.com/dashboard/project/hgruvuhrtznijhsqvagn/settings/api
2. Copy the `service_role` key (under "Service role key")
3. Add to `.env`:
```bash
SUPABASE_URL=https://hgruvuhrtznijhsqvagn.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
```

### 3. Railway Deployment (API)

#### 3.1 Create Railway Project

```bash
# Install Railway CLI if needed
npm install -g @railway/cli

# Login
railway login

# Create new project from packages/api
cd packages/api
railway init

# Link to project
railway link
```

#### 3.2 Add Environment Variables

In Railway Dashboard, add all variables from `.env.example`:

```bash
NODE_ENV=production
PORT=3000
SUPABASE_URL=https://hgruvuhrtznijhsqvagn.supabase.co
SUPABASE_SERVICE_KEY=<your-service-role-key>
STRIPE_SECRET_KEY=sk_live_... # Use live key for production
STRIPE_PRICE_ID_BASIC=price_...
STRIPE_PRICE_ID_PRO=price_...
STRIPE_PRICE_ID_ENTERPRISE=price_...
STRIPE_WEBHOOK_SECRET=<leave empty for now>
LATTICE_API_KEY=<generate-secure-key>
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

#### 3.3 Deploy

```bash
railway up
```

Copy your deployment URL (e.g., `https://your-api.railway.app`)

#### 3.4 Configure Stripe Production Webhook

1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://your-api.railway.app/api/v1/webhooks/stripe`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the "Signing secret" (starts with `whsec_`)
6. Add to Railway env vars:
```bash
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 4. Vercel Deployment (Web)

#### 4.1 Create Vercel Project

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from packages/web
cd packages/web
vercel

# Follow prompts
```

#### 4.2 Add Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

```bash
NEXT_PUBLIC_API_URL=https://your-api.railway.app/api/v1
NEXT_PUBLIC_SUPABASE_URL=https://hgruvuhrtznijhsqvagn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

#### 4.3 Deploy

```bash
vercel --prod
```

### 5. Domain Configuration (Optional)

#### 5.1 Add Custom Domain to Vercel
1. Vercel Dashboard → Settings → Domains
2. Add your domain (e.g., `lattice.yourdomain.com`)
3. Update DNS records as instructed

#### 5.2 Add Custom Domain to Railway
1. Railway Dashboard → Settings → Domains
2. Add API subdomain (e.g., `api.yourdomain.com`)
3. Update DNS records

#### 5.3 Update Environment Variables

Update CORS and callback URLs with your production domains.

### 6. Post-Deployment Testing

#### 6.1 Test Payment Flow

1. Visit your production site
2. Sign up for account
3. Navigate to pricing
4. Subscribe to a plan (use test mode first!)
5. Verify:
   - Checkout completes
   - Webhook is received (check Railway logs)
   - Subscription appears in Supabase
   - User dashboard shows active subscription

#### 6.2 Test Billing Portal

1. Login as subscribed user
2. Visit billing/subscription page
3. Click "Manage Subscription"
4. Verify Stripe Customer Portal opens
5. Test cancellation

#### 6.3 Switch to Live Mode

Once testing is complete:

1. Update Stripe keys to live mode (`sk_live_...`)
2. Create production webhook endpoint
3. Update all price IDs to live mode prices
4. Redeploy

### 7. Monitoring Setup

#### 7.1 Error Tracking (Recommended: Sentry)

```bash
# Install Sentry
cd packages/api
yarn add @sentry/node

# Add to index.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

#### 7.2 Uptime Monitoring

Set up monitoring at:
- UptimeRobot: https://uptimerobot.com
- Better Uptime: https://betteruptime.com

Monitor:
- `https://your-api.railway.app/api/v1/health`
- `https://yourdomain.com`

#### 7.3 Stripe Dashboard

Regularly check:
- Failed payments
- Webhook delivery status
- Customer disputes

## 🔒 Security Checklist

- [ ] All environment variables are set
- [ ] Stripe webhook secret is configured
- [ ] CORS is restricted to your domain
- [ ] API keys are rotated regularly
- [ ] Rate limiting is enabled
- [ ] HTTPS is enforced
- [ ] Database RLS policies are active

## 📞 Support

For issues:
- Stripe: https://support.stripe.com
- Railway: https://railway.app/help
- Vercel: https://vercel.com/support
- Supabase: https://supabase.com/support

## 🎉 You're Live!

Once all checks pass, you're ready to accept real payments!

Remember to:
- Monitor for errors
- Test payment flows regularly
- Keep dependencies updated
- Back up database regularly
