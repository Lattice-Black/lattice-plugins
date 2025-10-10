# Multi-Tenancy Setup Instructions

## Prerequisites

Before running the application, you need to install dependencies and configure environment variables.

## 1. Install Dependencies

### API Package
```bash
cd packages/api
yarn add @supabase/supabase-js
```

### Web Package
```bash
cd packages/web
yarn add @supabase/supabase-js
```

## 2. Environment Variables

### API Package Environment Variables

Create `/packages/api/.env`:

```bash
# Database
DATABASE_URL=postgresql://postgres:password@localhost:54322/postgres

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key-here

# API Configuration
PORT=3000
NODE_ENV=development

# CORS
ALLOWED_ORIGINS=http://localhost:3010,http://localhost:3001
```

**Important**:
- `SUPABASE_SERVICE_KEY` is the **service role key** (not anon key)
- Get these values from your Supabase project settings
- Never commit `.env` files to git

### Web Package Environment Variables

Create `/packages/web/.env.local`:

```bash
# API
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important**:
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` is the **anon key** (safe for client-side)
- Never use service role key in web package
- `NEXT_PUBLIC_` prefix makes variables available to browser

## 3. Get Supabase Keys

### Option A: From Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to Settings > API
4. Copy the following:
   - **Project URL** → Use for `SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → Use for `NEXT_PUBLIC_SUPABASE_ANON_KEY` (web only)
   - **service_role** key → Use for `SUPABASE_SERVICE_KEY` (API only)

### Option B: Local Supabase
If running Supabase locally:
```bash
# Start local Supabase
supabase start

# Keys will be printed in the output:
# API URL: http://localhost:54321
# anon key: eyJhbGc...
# service_role key: eyJhbGc...
```

## 4. Database Setup

Ensure the multi-tenancy migration has been run:

```bash
cd supabase
yarn supabase db push
```

This creates:
- `services.user_id` column
- `api_keys` table
- Row-Level Security (RLS) policies

## 5. Run the Application

### Start API Server
```bash
cd packages/api
yarn dev
# Runs on http://localhost:3000
```

### Start Web Dashboard
```bash
cd packages/web
yarn dev
# Runs on http://localhost:3010
```

## 6. Create Your First User

1. Open http://localhost:3010
2. Click "Sign up"
3. Enter email, password, and name
4. Check email for confirmation (if email confirmation is enabled)
5. Sign in to dashboard

## 7. Generate API Key

Currently API keys must be generated manually in the database. In the future, there will be a UI for this.

### Manual API Key Generation

```sql
-- Connect to your database
-- Generate a random API key (use a secure random generator in production)
INSERT INTO api_keys (user_id, key_hash, name)
VALUES (
  'your-user-id-here',  -- Get from auth.users table
  encode(digest('your-secret-api-key-here', 'sha256'), 'hex'),
  'My API Key'
);
```

**Better approach using JavaScript**:

```javascript
import { createHash } from 'crypto';
import { supabase } from './supabase.js';

// Generate a secure random API key
const apiKey = 'lat_' + crypto.randomBytes(32).toString('hex');
console.log('API Key (save this!):', apiKey);

// Hash the key
const keyHash = createHash('sha256').update(apiKey).digest('hex');

// Store in database
const { data, error } = await supabase
  .from('api_keys')
  .insert({
    user_id: 'your-user-id',
    key_hash: keyHash,
    name: 'My API Key'
  });

// Use the apiKey (not keyHash) in your service configuration
```

## 8. Configure Your Services

In your services that will report to Lattice, install the plugin and configure:

```javascript
// Express.js example
import { LatticeExpress } from '@lattice/express-plugin';

app.use(LatticeExpress({
  apiKey: 'lat_your-api-key-here',  // The raw API key (not hashed)
  apiUrl: 'http://localhost:3000/api/v1',
  serviceName: 'my-service'
}));
```

## Troubleshooting

### "Missing Supabase environment variables" error
- Check that all environment variables are set in the correct `.env` files
- Make sure you're using the right key type (anon vs service role)
- Restart the dev server after adding environment variables

### "Invalid API key" error
- Verify the API key hash is correct in the database
- Check that the key hasn't been revoked (`revoked = false`)
- Ensure you're using the raw key (not the hash) in service config

### "Authentication required" error on dashboard
- Check that `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set
- Verify Supabase project URL is correct
- Try signing out and signing in again

### Services not appearing in dashboard
- Verify services are using valid API key
- Check that API URL is correct in service config
- Confirm API server is running
- Check API server logs for errors

### CORS errors in browser
- Add your web app origin to `ALLOWED_ORIGINS` in API `.env`
- Restart API server after changing CORS settings

## Security Checklist

Before deploying to production:

- [ ] Use strong, unique passwords for user accounts
- [ ] Generate cryptographically secure API keys (32+ bytes)
- [ ] Enable HTTPS for all communication
- [ ] Restrict `ALLOWED_ORIGINS` to production domains
- [ ] Never commit `.env` files to version control
- [ ] Rotate API keys periodically
- [ ] Enable email confirmation for new signups (Supabase setting)
- [ ] Set up monitoring and alerting for failed auth attempts
- [ ] Review and test all RLS policies

## Next Steps

1. **API Key Management UI**: Create dashboard page for generating/revoking keys
2. **User Profile**: Add ability to update user info
3. **Multi-factor Auth**: Enable MFA in Supabase dashboard
4. **Team Features**: Share services within an organization
5. **Audit Logging**: Track all security-relevant events

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Multi-Tenancy Security Spec](./specs/006-multi-tenancy-security.md)
- [Implementation Summary](./MULTI_TENANCY_IMPLEMENTATION_SUMMARY.md)
