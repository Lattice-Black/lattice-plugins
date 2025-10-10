# Lattice Production Roadmap

## Business Model
- **Pricing**: $25/year subscription
- **Target**: Developers who want service discovery and monitoring for their microservices
- **Value Prop**: Automatic service discovery, dependency mapping, and beautiful visualization

## Phase 1: Multi-Tenancy & Authentication ✅ Current

### Database Schema
1. **Users Table**
   ```sql
   CREATE TABLE "User" (
     id TEXT PRIMARY KEY,
     email TEXT UNIQUE NOT NULL,
     password_hash TEXT NOT NULL,
     name TEXT,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );
   ```

2. **API Keys Table**
   ```sql
   CREATE TABLE "ApiKey" (
     id TEXT PRIMARY KEY,
     user_id TEXT REFERENCES "User"(id),
     key_hash TEXT NOT NULL,
     name TEXT,
     last_used TIMESTAMP,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

3. **Subscriptions Table**
   ```sql
   CREATE TABLE "Subscription" (
     id TEXT PRIMARY KEY,
     user_id TEXT REFERENCES "User"(id),
     stripe_customer_id TEXT,
     stripe_subscription_id TEXT,
     status TEXT, -- active, canceled, past_due
     current_period_end TIMESTAMP,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

4. **Add user_id to existing tables**
   - ALTER TABLE "Service" ADD COLUMN user_id TEXT REFERENCES "User"(id);
   - ALTER TABLE "Route" - already has serviceId (cascade)
   - ALTER TABLE "Dependency" - already has serviceId (cascade)

### Authentication
- Next-Auth for web dashboard
- API key authentication for plugin submissions
- JWT tokens for API access

## Phase 2: Payment Integration

### Stripe Setup
- Stripe Checkout for subscriptions
- Webhook handling for subscription events
- Customer portal for managing subscriptions
- Handle trial periods (7 days free)

### Billing Dashboard
- View current plan
- Update payment method
- Cancel subscription
- View invoices

## Phase 3: Security & Rate Limiting

### API Security
- Rate limiting per user (1000 requests/hour)
- API key rotation
- Request logging and audit trail
- DDoS protection

### Data Isolation
- Row-level security (RLS) in PostgreSQL
- User-scoped queries everywhere
- No cross-user data leakage

## Phase 4: Landing Page & Marketing

### Landing Page (/)
- Hero section with value prop
- Pricing section ($25/year)
- Feature showcase with screenshots
- Integration examples
- CTA to sign up

### Dashboard (/dashboard)
- Protected route (requires auth)
- Service overview
- Network graph
- API key management

## Phase 5: Production Deployment

### Infrastructure
- Vercel for Next.js dashboard
- Railway/Render for API
- Supabase/Neon for PostgreSQL
- Redis Cloud for caching

### Monitoring
- Error tracking (Sentry)
- Analytics (PostHog/Plausible)
- Uptime monitoring
- Performance metrics

### DevOps
- CI/CD pipeline
- Automated testing
- Database backups
- SSL certificates
- CDN for assets

## Phase 6: Polish & Launch

### Final Checklist
- [ ] Terms of Service
- [ ] Privacy Policy
- [ ] Email notifications (welcome, billing)
- [ ] Onboarding flow
- [ ] Documentation
- [ ] Example integrations
- [ ] Blog post/announcement

## Revenue Projections
- 100 users = $2,500/year
- 500 users = $12,500/year
- 1,000 users = $25,000/year

## Next Steps
1. Add User/ApiKey/Subscription tables ✅
2. Add user_id to Service table ✅
3. Implement authentication
4. Stripe integration
5. Landing page
6. Deploy to production
