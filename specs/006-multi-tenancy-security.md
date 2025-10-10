# Multi-Tenancy Security Architecture

**Status**: Implemented
**Last Updated**: 2025-10-10

## Overview

This specification defines the comprehensive multi-tenancy security architecture for the Lattice observability platform. Every service, metric, route, and dependency is isolated by user, ensuring complete data separation between tenants.

## Security Principles

### 1. Zero Trust Architecture
- **Never assume authentication**: All endpoints validate user identity
- **Always filter by user_id**: Every database query includes user_id constraints
- **No global data access**: Users can ONLY see their own data

### 2. Defense in Depth
- Multiple layers of security validation
- Row-Level Security (RLS) policies at database level
- Application-level filtering in service layer
- Authentication middleware at API layer

### 3. Secure by Default
- All endpoints require authentication unless explicitly public
- API keys are hashed in database using SHA-256
- Session tokens are verified on every request

## Authentication Methods

### API Key Authentication
Used for service-to-service communication and plugin ingestion.

**Implementation**: `/packages/api/src/middleware/auth.ts` - `authenticateApiKey`

**Flow**:
1. Client sends API key in `X-Lattice-API-Key` header
2. Server hashes the key using SHA-256
3. Server queries `api_keys` table for matching hash
4. Verifies key is not revoked
5. Updates `last_used` timestamp asynchronously
6. Attaches `user_id` to request object

**Database Schema**:
```sql
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key_hash TEXT NOT NULL UNIQUE,
  name TEXT,
  revoked BOOLEAN DEFAULT FALSE,
  last_used TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Security Features**:
- Keys are never stored in plaintext
- SHA-256 hashing prevents rainbow table attacks
- Revocation support for compromised keys
- Last used tracking for auditing

### Supabase JWT Authentication
Used for web dashboard access.

**Implementation**: `/packages/api/src/middleware/auth.ts` - `authenticateSupabase`

**Flow**:
1. Client sends JWT token in `Authorization: Bearer {token}` header
2. Server validates token with Supabase Auth
3. Extracts user information from validated token
4. Attaches user to request object

**Security Features**:
- Industry-standard JWT validation
- Automatic token refresh handling
- Session management by Supabase

## Data Isolation

### Service Layer Isolation

All service methods accept `userId` parameter and filter queries accordingly.

**MetadataService** (`/packages/api/src/services/metadata-service.ts`):
```typescript
async upsertService(service: Service, userId: string)
async getServiceById(id: string, userId: string)
async getServiceByName(name: string, userId: string)
async listServices(userId: string, filters?: {...})
```

**MetricsService** (`/packages/api/src/services/metrics-service.ts`):
```typescript
async insertMetrics(serviceName: string, userId: string, metrics: MetricData[])
async getServiceStats(userId: string, serviceId?: string)
async getServiceConnections(userId: string)
async getRecentMetrics(serviceName: string, userId: string, limit: number)
```

### Database Queries

Every query includes `WHERE user_id = $userId` clause:

**Example - List Services**:
```sql
SELECT * FROM services
WHERE user_id = $1
  AND status = $2
ORDER BY last_seen DESC
LIMIT $3 OFFSET $4
```

**Example - Get Service Metrics**:
```sql
SELECT m.*
FROM service_metrics m
JOIN services s ON s.id = m.service_id
WHERE s.name = $1 AND s.user_id = $2
ORDER BY m.timestamp DESC
LIMIT $3
```

### Database Views

All materialized views and views include `user_id` for filtering:

**service_stats view**:
```sql
CREATE OR REPLACE VIEW service_stats AS
SELECT
  s.id,
  s.name,
  s.user_id,
  COUNT(m.id) as total_requests,
  AVG(m.response_time_ms) as avg_response_time_ms,
  ...
FROM services s
LEFT JOIN service_metrics m ON m.service_id = s.id
GROUP BY s.id, s.name, s.user_id;
```

Queries against views must filter by `user_id`:
```sql
SELECT * FROM service_stats WHERE user_id = $1
```

## API Endpoint Security

### Ingestion Endpoints
**Authentication**: API Key (database lookup)
**Authorization**: Services are automatically associated with authenticated user

**POST /api/v1/ingest/metadata**:
```typescript
router.post('/metadata', authenticateApiKey, async (req: AuthenticatedRequest, res) => {
  const userId = req.user.id;
  const upsertedService = await metadataService.upsertService(service, userId);
  // ...
});
```

**POST /api/v1/metrics**:
```typescript
router.post('/', authenticateApiKey, async (req: AuthenticatedRequest, res) => {
  const userId = req.user.id;
  await metricsService.insertMetrics(serviceName, userId, metrics);
  // ...
});
```

### Query Endpoints
**Authentication**: Supabase JWT
**Authorization**: All queries filtered by authenticated user's ID

**GET /api/v1/services**:
```typescript
router.get('/', authenticateSupabase, async (req: AuthenticatedRequest, res) => {
  const userId = req.user.id;
  const result = await metadataService.listServices(userId, filters);
  // ...
});
```

**GET /api/v1/services/:id**:
```typescript
router.get('/:id', authenticateSupabase, async (req: AuthenticatedRequest, res) => {
  const userId = req.user.id;
  let service = await metadataService.getServiceById(id, userId);
  // Returns 404 if service doesn't belong to user
});
```

**GET /api/v1/metrics/stats**:
```typescript
router.get('/stats', authenticateSupabase, async (req: AuthenticatedRequest, res) => {
  const userId = req.user.id;
  const stats = await metricsService.getServiceStats(userId, serviceId);
  // ...
});
```

### Endpoint Security Matrix

| Endpoint | Method | Authentication | User Isolation |
|----------|--------|----------------|----------------|
| `/ingest/metadata` | POST | API Key | Yes - via userId |
| `/metrics` | POST | API Key | Yes - via userId |
| `/services` | GET | JWT | Yes - WHERE user_id |
| `/services/:id` | GET | JWT | Yes - WHERE user_id |
| `/metrics/stats` | GET | JWT | Yes - WHERE user_id |
| `/metrics/connections` | GET | JWT | Yes - WHERE user_id |
| `/metrics/recent/:name` | GET | JWT | Yes - JOIN + WHERE user_id |

## Web Dashboard Security

### Client-Side Authentication

**Supabase Client** (`/packages/web/src/lib/supabase.ts`):
- Uses anon key (not service role key)
- Enables session persistence
- Automatic token refresh

**Auth Context** (`/packages/web/src/lib/auth-context.tsx`):
- React context provider for auth state
- Listens to auth state changes
- Provides `user`, `loading`, and `signOut` to components

### Protected Routes

**Route Protection** (`/packages/web/src/app/(protected)/layout.tsx`):
```typescript
<ProtectedRoute>
  {children}
</ProtectedRoute>
```

**Protection Logic**:
1. Check if user is authenticated
2. Show loading spinner while checking
3. Redirect to `/login` if not authenticated
4. Render protected content if authenticated

### API Client Authentication

**API Client** (`/packages/web/src/lib/api.ts`):
```typescript
async function getAuthHeaders(): Promise<HeadersInit> {
  const token = await getSessionToken()
  if (!token) {
    throw new Error('Authentication required. Please sign in.')
  }
  return {
    'Authorization': `Bearer ${token}`,
  }
}
```

All API calls include authentication headers:
```typescript
const headers = await getAuthHeaders()
const response = await fetch(url, { headers, cache: 'no-store' })
```

### Authentication Pages

**Login** (`/packages/web/src/app/login/page.tsx`):
- Email/password authentication
- Error handling and validation
- Redirects to dashboard on success

**Signup** (`/packages/web/src/app/signup/page.tsx`):
- User registration with email confirmation
- Password strength validation
- Full name collection for profile

## Row-Level Security (RLS)

Database-level security policies ensure data isolation even if application logic fails.

### Services Table RLS
```sql
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own services" ON services
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own services" ON services
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own services" ON services
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own services" ON services
  FOR DELETE USING (auth.uid() = user_id);
```

### Service Metrics RLS
```sql
ALTER TABLE service_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own service metrics" ON service_metrics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM services
      WHERE services.id = service_metrics.service_id
      AND services.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own service metrics" ON service_metrics
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM services
      WHERE services.id = service_metrics.service_id
      AND services.user_id = auth.uid()
    )
  );
```

### API Keys RLS
```sql
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own API keys" ON api_keys
  FOR ALL USING (auth.uid() = user_id);
```

## Security Testing

### Manual Testing Checklist

**API Key Authentication**:
- [ ] Request without API key returns 401
- [ ] Request with invalid API key returns 401
- [ ] Request with revoked API key returns 401
- [ ] Request with valid API key succeeds
- [ ] API key last_used timestamp updates

**JWT Authentication**:
- [ ] Request without token returns 401
- [ ] Request with invalid token returns 401
- [ ] Request with expired token returns 401
- [ ] Request with valid token succeeds

**Data Isolation**:
- [ ] User A cannot see User B's services
- [ ] User A cannot access User B's service by ID
- [ ] User A cannot see User B's metrics
- [ ] User A's API key cannot ingest for User B

**Web Dashboard**:
- [ ] Unauthenticated users redirected to /login
- [ ] Login with valid credentials succeeds
- [ ] Invalid credentials show error
- [ ] Signup creates new account
- [ ] Sign out clears session

### Automated Testing

**Unit Tests** (recommended):
```typescript
describe('MetadataService', () => {
  it('should filter services by user_id', async () => {
    const services = await metadataService.listServices(userId1)
    expect(services.every(s => s.user_id === userId1)).toBe(true)
  })

  it('should return null for service owned by different user', async () => {
    const service = await metadataService.getServiceById(serviceId, differentUserId)
    expect(service).toBeNull()
  })
})
```

**Integration Tests** (recommended):
```typescript
describe('GET /api/v1/services', () => {
  it('should return 401 without auth token', async () => {
    const response = await request(app).get('/api/v1/services')
    expect(response.status).toBe(401)
  })

  it('should return only user services with valid token', async () => {
    const response = await request(app)
      .get('/api/v1/services')
      .set('Authorization', `Bearer ${userToken}`)
    expect(response.status).toBe(200)
    expect(response.body.services.every(s => s.user_id === userId)).toBe(true)
  })
})
```

## Security Best Practices

### DO ✓
- Always validate user authentication before processing requests
- Filter ALL database queries by user_id
- Hash sensitive data (API keys) before storage
- Use parameterized queries to prevent SQL injection
- Log authentication failures for monitoring
- Implement rate limiting on auth endpoints
- Use HTTPS in production
- Rotate API keys periodically
- Implement account lockout after failed attempts

### DON'T ✗
- Store API keys or passwords in plaintext
- Skip authentication checks for "internal" endpoints
- Trust client-provided user IDs
- Use global/admin credentials in application code
- Expose user_id in URLs (use opaque identifiers if needed)
- Share API keys between users
- Log sensitive data (passwords, tokens)

## Deployment Considerations

### Environment Variables

**API Package** (`.env`):
```bash
DATABASE_URL=postgresql://...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...  # Service role key for server
```

**Web Package** (`.env.local`):
```bash
NEXT_PUBLIC_API_URL=https://api.lattice.dev/api/v1
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...  # Anon key for client
```

### Database Migrations

Ensure all migrations include:
1. `user_id` columns with NOT NULL constraints
2. Foreign key references to `auth.users`
3. Composite unique constraints including `user_id`
4. RLS policies for all tables
5. Indexes on `user_id` for query performance

### Monitoring

**Security Metrics to Track**:
- Failed authentication attempts by IP
- API key usage patterns
- Unusual query patterns (e.g., user accessing many resources)
- RLS policy violations (logged by Postgres)
- Session duration and token refresh rates

## Future Enhancements

### Planned Security Features
1. **Multi-factor Authentication (MFA)**: Add TOTP support via Supabase
2. **API Key Scoping**: Limit API keys to specific operations
3. **Rate Limiting**: Per-user rate limits on API endpoints
4. **Audit Logging**: Comprehensive audit trail for security events
5. **IP Whitelisting**: Optional IP restrictions for API keys
6. **OAuth Integration**: Support for Google, GitHub authentication
7. **Service Accounts**: Non-user API access with limited permissions
8. **RBAC**: Role-based access control for team features

## References

- Supabase Auth Documentation: https://supabase.com/docs/guides/auth
- Row Level Security: https://supabase.com/docs/guides/auth/row-level-security
- OWASP Top 10: https://owasp.org/www-project-top-ten/
- JWT Best Practices: https://tools.ietf.org/html/rfc8725
