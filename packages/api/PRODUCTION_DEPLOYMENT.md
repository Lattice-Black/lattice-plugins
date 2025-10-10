# Production Deployment Guide

This guide covers everything needed to deploy the Lattice API to production.

## Pre-Deployment Checklist

### 1. Database Security: Re-enable Row Level Security (RLS)

Currently RLS is **disabled** for development. Create a new migration to enable RLS with proper policies:

```bash
# Create new migration
touch supabase/migrations/$(date +%Y%m%d%H%M%S)_enable_rls_for_production.sql
```

Add the following RLS policies:

```sql
-- Re-enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_metrics ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only read/update their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- API Keys: Users can only manage their own API keys
CREATE POLICY "Users can view own API keys" ON api_keys
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own API keys" ON api_keys
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own API keys" ON api_keys
  FOR DELETE USING (auth.uid() = user_id);

-- Subscriptions: Users can view their own subscription
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Services: Users can view/manage services for their tenants
CREATE POLICY "Users can view tenant services" ON services
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create tenant services" ON services
  FOR INSERT WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update tenant services" ON services
  FOR UPDATE USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Routes: Users can view/manage routes for their tenant's services
CREATE POLICY "Users can view tenant routes" ON routes
  FOR SELECT USING (
    service_id IN (
      SELECT id FROM services WHERE tenant_id IN (
        SELECT tenant_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create tenant routes" ON routes
  FOR INSERT WITH CHECK (
    service_id IN (
      SELECT id FROM services WHERE tenant_id IN (
        SELECT tenant_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- Dependencies: Users can view/manage dependencies for their tenant's services
CREATE POLICY "Users can view tenant dependencies" ON dependencies
  FOR SELECT USING (
    service_id IN (
      SELECT id FROM services WHERE tenant_id IN (
        SELECT tenant_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create tenant dependencies" ON dependencies
  FOR INSERT WITH CHECK (
    service_id IN (
      SELECT id FROM services WHERE tenant_id IN (
        SELECT tenant_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- Connections: Similar policy for connections
CREATE POLICY "Users can view tenant connections" ON connections
  FOR SELECT USING (
    service_id IN (
      SELECT id FROM services WHERE tenant_id IN (
        SELECT tenant_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- Service Metrics: Users can view metrics for their tenant's services
CREATE POLICY "Users can view tenant metrics" ON service_metrics
  FOR SELECT USING (
    service_id IN (
      SELECT id FROM services WHERE tenant_id IN (
        SELECT tenant_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create tenant metrics" ON service_metrics
  FOR INSERT WITH CHECK (
    service_id IN (
      SELECT id FROM services WHERE tenant_id IN (
        SELECT tenant_id FROM profiles WHERE id = auth.uid()
      )
    )
  );
```

### 2. Stripe Configuration

#### Switch to Live Keys
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Toggle from "Test mode" to "Live mode"
3. Get your live keys:
   - Secret Key (starts with `sk_live_`)
   - Publishable Key (starts with `pk_live_`)
   - Live price IDs for Basic, Pro, Enterprise tiers

#### Configure Production Webhook
1. Go to [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Set endpoint URL: `https://your-production-domain.com/api/v1/webhooks/stripe`
4. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the **production** webhook signing secret (starts with `whsec_`)

### 3. Environment Variables

Create a production `.env` file with these variables:

```bash
# Database - Use Supabase pooler in production
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/lattice"

# Redis - Use production Redis instance
REDIS_URL="redis://your-production-redis:6379"

# API Configuration
PORT=3000
NODE_ENV="production"

# Security - Generate a strong API key for admin operations
LATTICE_API_KEY="your-secure-admin-key"

# CORS - Update to your production domains
ALLOWED_ORIGINS="https://your-production-domain.com,https://app.your-domain.com"

# Supabase
SUPABASE_URL="https://hgruvuhrtznijhsqvagn.supabase.co"
SUPABASE_SERVICE_KEY="your-service-key"

# Supabase Database Connection (Production Pooler)
SUPABASE_DB_HOST="aws-1-us-east-2.pooler.supabase.com"
SUPABASE_DB_PORT="6543"
SUPABASE_DB_NAME="postgres"
SUPABASE_DB_USER="postgres.hgruvuhrtznijhsqvagn"
SUPABASE_DB_PASSWORD="your-production-password"

# Stripe - LIVE KEYS
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..." # Production webhook secret
STRIPE_PRICE_ID_BASIC="price_..." # Live price IDs
STRIPE_PRICE_ID_PRO="price_..."
STRIPE_PRICE_ID_ENTERPRISE="price_..."
```

### 4. Build the Application

```bash
cd /Users/cwolff/Code/lattice/packages/api
yarn build
```

This creates the `dist/` folder with compiled JavaScript.

### 5. Deployment Options

#### Option A: Docker (Recommended)

Create `Dockerfile`:

```dockerfile
FROM node:21-alpine

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./
RUN yarn install --production

# Copy built application
COPY dist ./dist

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "dist/index.js"]
```

Build and deploy:
```bash
docker build -t lattice-api .
docker run -p 3000:3000 --env-file .env.production lattice-api
```

#### Option B: Platform as a Service (PaaS)

**Vercel:**
- Not ideal for long-running webhook handlers
- Serverless functions have timeouts

**Railway.app:**
```bash
railway login
railway init
railway up
```

**Render.com:**
- Connect GitHub repo
- Set environment variables in dashboard
- Auto-deploys on push

**Fly.io:**
```bash
fly launch
fly deploy
```

#### Option C: VPS (DigitalOcean, AWS EC2, etc.)

1. SSH into server
2. Install Node.js 21+
3. Clone repo and build:
   ```bash
   git clone <your-repo>
   cd lattice/packages/api
   yarn install
   yarn build
   ```
4. Use PM2 to manage the process:
   ```bash
   npm install -g pm2
   pm2 start dist/index.js --name lattice-api
   pm2 save
   pm2 startup
   ```

### 6. SSL/TLS Certificate

Stripe webhooks require HTTPS. Use:
- **Let's Encrypt** (free) with certbot
- **Cloudflare** (free SSL + CDN)
- Your hosting provider's SSL

### 7. Run Database Migrations in Production

```bash
# Push migrations to production Supabase
PGPASSWORD=your-production-password psql \
  "postgresql://postgres.hgruvuhrtznijhsqvagn@aws-1-us-east-2.pooler.supabase.com:6543/postgres" \
  -f supabase/migrations/20251009000000_initial_schema.sql

# Enable RLS (new migration)
PGPASSWORD=your-production-password psql \
  "postgresql://postgres.hgruvuhrtznijhsqvagn@aws-1-us-east-2.pooler.supabase.com:6543/postgres" \
  -f supabase/migrations/XXXXXXXXXXXXXX_enable_rls_for_production.sql
```

### 8. Post-Deployment Verification

#### Test Health Endpoint
```bash
curl https://your-domain.com/api/v1/health
```

Should return:
```json
{
  "status": "ok",
  "version": "1.0.0",
  "schemaVersion": "1.0.0",
  "timestamp": "2025-10-10T..."
}
```

#### Test Stripe Webhook
Stripe Dashboard > Webhooks > Your endpoint > "Send test webhook"

Check your server logs to verify it's received and processed.

#### Test Authentication
```bash
# Sign up
curl -X POST https://your-domain.com/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"secure123","fullName":"Test User"}'

# Login
curl -X POST https://your-domain.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"secure123"}'
```

## Monitoring and Observability

### Add Logging
Consider adding:
- **Datadog** - Application monitoring
- **Sentry** - Error tracking
- **LogDNA** / **Papertrail** - Log aggregation

### Health Checks
Set up uptime monitoring:
- **UptimeRobot** (free)
- **Pingdom**
- **Better Uptime**

Monitor: `https://your-domain.com/api/v1/health`

### Stripe Monitoring
Watch these in Stripe Dashboard:
- Failed webhooks
- Failed payments
- Subscription status

## Security Checklist

- [ ] RLS policies enabled and tested
- [ ] Environment variables secured (not in repo)
- [ ] Using live Stripe keys (not test keys)
- [ ] HTTPS/SSL certificate installed
- [ ] CORS configured for production domains only
- [ ] API keys rotated from development values
- [ ] Database password is strong and secured
- [ ] Webhook signing secrets are production values
- [ ] Rate limiting configured (if needed)
- [ ] Helmet middleware is active (already configured)

## Rollback Plan

If issues occur in production:

1. **Database issues**: Keep your previous migration handy
2. **Application issues**: Have the previous Docker image/build tagged
3. **Stripe issues**: Webhooks can be retried from Stripe Dashboard

## Support Resources

- [Supabase Docs](https://supabase.com/docs)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Express Best Practices](https://expressjs.com/en/advanced/best-practice-production.html)

## Current Status

✅ Development environment fully configured
✅ Stripe webhooks tested locally
✅ Authentication system implemented
✅ Database schema deployed
⚠️ RLS currently disabled for development
🔜 Ready for production deployment

---

**Next Steps**: Create RLS migration → Switch to live Stripe keys → Deploy → Configure production webhook
