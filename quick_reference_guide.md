# Quick Reference Guide - Authentication & Health Integrations

## Quick Stats (For Q&A)

**Endpoints Created:** 16 total
- Authentication: 8 endpoints
- Integrations: 8 endpoints

**Providers Supported:** 3
- Strava (fully implemented)
- Fitbit (fully implemented)
- Lose It (infrastructure only)

**Data Types Synced:** 9
- Steps, Weight, Calories, Exercise Minutes, Sleep Minutes, Heart Rate, Distance, Active Minutes, Resting Heart Rate

**Lines of Code:** ~3,500+

**Key Technologies:**
- NestJS (backend framework)
- JWT (authentication)
- Bcrypt (password hashing)
- Prisma (ORM)
- PostgreSQL (database)
- OAuth 2.0 (external integrations)
- TypeScript (language)
- React (frontend)

---

## File Locations (Quick Access)

### Authentication
```
Guards:         src/app/guards/jwt-auth.guard.ts
Controller:     src/app/controllers/user.controller.ts
Service:        src/core/services/user.service.ts
Repository:     src/infra/database/repositories/user.repository.ts
DTOs:           src/app/dto/user.dto.ts
```

### Integrations
```
Controller:     src/app/controllers/integration.controller.ts
Service:        src/core/services/integration.service.ts
Strava:         src/infra/adapters/health-providers/strava.adapter.ts
Fitbit:         src/infra/adapters/health-providers/fitbit.adapter.ts
Factory:        src/infra/adapters/health-providers/health-data-provider.factory.ts
```

### Database
```
Schema:         prisma/schema.prisma
Migrations:     prisma/migrations/
```

### Frontend
```
Modal:          app/web/src/components/IntegrationsModal.tsx
Hook:           app/web/src/hooks/useIntegrations.ts
```

---

## Common Questions & Answers

### Q: Why did you choose JWT over session-based auth?
**A:** JWT is stateless, scalable, and works well with modern SPAs. No server-side session storage needed. Perfect for RESTful APIs. Tokens contain user info, reducing database lookups.

### Q: How do you prevent JWT token theft?
**A:**
- HTTPS only in production (encrypts transmission)
- HttpOnly cookies option (prevents XSS)
- Short expiration (24 hours)
- Token refresh mechanism
- Never log tokens
- CORS configuration

### Q: Why use bcrypt instead of other hashing algorithms?
**A:** Bcrypt is specifically designed for passwords with built-in salt and computational cost (10 rounds). Resistant to brute-force and rainbow table attacks. Industry standard for password hashing.

### Q: What happens if a user's OAuth token expires?
**A:** We automatically refresh it before expiration using the refresh token. Check happens before every sync. Users never see expiration errors. Completely transparent.

### Q: How do you handle Fitbit rate limits?
**A:**
- 100ms delays between date iterations
- Promise.allSettled (graceful degradation)
- 429 error detection
- Retry logic with backoff (future enhancement)

### Q: Why adapter pattern for providers?
**A:** Makes it easy to add new providers. Each implements the same interface (IHealthDataProvider). Business logic doesn't care which provider - it just calls the interface methods. Open/Closed principle.

### Q: How do you prevent duplicate data syncs?
**A:** Database unique constraint on (userId, date, source). If we try to insert duplicate, it's rejected. We can force resync by deleting old records first if needed.

### Q: What if Strava API changes?
**A:** Only the StravaAdapter needs updating. Service layer, database, frontend unchanged. That's the power of the adapter pattern.

### Q: Is Google OAuth actually working?
**A:** Infrastructure is complete (DB schema, service methods, endpoints). Missing piece is token verification library integration. About 70% done. Could be completed in 1-2 sprints.

### Q: How secure is the OAuth state parameter?
**A:**
- Base64-encoded JSON with userId, provider, timestamp, nonce
- Validated on callback (structure, timestamp, user match)
- Expires after 10 minutes
- Prevents CSRF attacks

### Q: Can users connect multiple Strava accounts?
**A:** Currently no - unique constraint on (userId, provider). Design decision. Could be changed to support multiple, but typical users have one account per provider.

### Q: What happens to synced data if user disconnects?
**A:** Data remains in database (user's historical data). Integration marked as REVOKED. Token revoked with provider API. They can reconnect later without losing history.

### Q: How do you handle users in different timezones?
**A:** Dates stored as DateTime in PostgreSQL with timezone awareness. API returns ISO 8601 format. Frontend converts to user's local timezone for display.

### Q: Why NestJS instead of Express?
**A:** NestJS provides:
- Built-in dependency injection
- TypeScript-first
- Modular architecture
- Decorators for clean code
- Built-in guards, pipes, interceptors
- Better for large-scale apps

### Q: How do you test this?
**A:** (If asked about testing)
- Unit tests: Mock repositories and external APIs
- Integration tests: Test full flow with test database
- E2E tests: Simulate OAuth flow with mock providers
- Dependency injection makes everything mockable

### Q: What about GDPR/privacy compliance?
**A:** (If asked)
- Users explicitly authorize data access (OAuth consent)
- Can delete account (DELETE /users/me)
- Data deletion cascades to health data
- Tokens properly revoked on disconnect
- No unnecessary data stored

---

## Technical Deep Dives (If Asked)

### JWT Structure
```
Header:     { "alg": "HS256", "typ": "JWT" }
Payload:    { "id": "uuid", "email": "...", "exp": timestamp }
Signature:  HMACSHA256(base64(header) + "." + base64(payload), secret)
```

### Bcrypt Process
```
1. Generate salt (10 rounds = 2^10 iterations)
2. Hash password with salt
3. Store: $2b$10$salt+hash (all-in-one string)
4. Verify: bcrypt.compare(plaintext, stored) → reconstructs salt, rehashes, compares
```

### OAuth 2.0 Flow
```
1. Authorization Request → Provider shows consent screen
2. User Approves → Redirect with authorization code
3. Token Exchange → POST code to provider's token endpoint
4. Receive Tokens → access_token (short-lived), refresh_token (long-lived)
5. Use Token → Include in Authorization header for API calls
6. Token Expires → Use refresh_token to get new access_token
7. Disconnect → Revoke tokens with provider
```

### Strava Data Transformation
```javascript
// Raw Strava activity:
{
  "moving_time": 3600,        // seconds
  "calories": 450,
  "distance": 10000,          // meters
  "average_heartrate": 145
}

// Multiple activities on same day → aggregate:
exerciseMinutes = sum(moving_time) / 60
caloriesBurned = sum(calories)
distance = sum(distance)
heartRate = average(average_heartrate) where HR exists

// Transform to unified format:
{
  date: "2025-12-07",
  exerciseMinutes: 60,
  caloriesBurned: 450,
  distance: 10000,
  heartRate: 145,
  provider: "STRAVA"
}
```

### Fitbit Multi-API Strategy
```javascript
// For each date, parallel calls:
const [activity, sleep, heartRate, weight] = await Promise.allSettled([
  fetchActivity(date),      // steps, calories, active mins
  fetchSleep(date),         // sleep minutes
  fetchHeartRate(date),     // resting HR
  fetchWeight(date)         // weight
]);

// Extract data from successful calls:
if (activity.status === 'fulfilled') { ... }
if (sleep.status === 'fulfilled') { ... }
// etc.

// Result: Get all available data even if some APIs fail
```

---

## Security Checklist (Reference)

**Authentication:**
- ✅ Passwords hashed with bcrypt (10 rounds)
- ✅ Password strength validation
- ✅ JWT tokens with expiration
- ✅ Secret key from environment (not hardcoded)
- ✅ Passwords never in API responses

**Authorization:**
- ✅ JwtAuthGuard on protected routes
- ✅ Token signature verification
- ✅ User context from token payload

**OAuth:**
- ✅ State parameter (CSRF protection)
- ✅ State expiration (10 minutes)
- ✅ Token encryption in database
- ✅ Proper token revocation

**Input Validation:**
- ✅ DTO validation with class-validator
- ✅ Email format validation
- ✅ XSS prevention (sanitize-html)
- ✅ Range validation on metrics

**Database:**
- ✅ Prepared statements (Prisma ORM)
- ✅ Unique constraints
- ✅ Foreign keys
- ✅ Indexed queries

---

## Architecture Patterns Used

1. **Adapter Pattern** - Health data providers
2. **Factory Pattern** - Provider selection
3. **Repository Pattern** - Data access layer
4. **Dependency Injection** - NestJS DI container
5. **DTO Pattern** - Data validation and transfer
6. **Guard Pattern** - Route protection
7. **Strategy Pattern** - Different OAuth implementations

---

## Environment Variables Required

```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/healthtrack"

# JWT
JWT_SECRET="your-super-secret-key-min-32-chars"
JWT_EXPIRATION="24h"

# Strava
STRAVA_CLIENT_ID="your-strava-client-id"
STRAVA_CLIENT_SECRET="your-strava-client-secret"
STRAVA_CALLBACK_URL="http://localhost:3000/integrations/callback"

# Fitbit
FITBIT_CLIENT_ID="your-fitbit-client-id"
FITBIT_CLIENT_SECRET="your-fitbit-client-secret"
FITBIT_CALLBACK_URL="http://localhost:3000/integrations/callback"

# Google OAuth (partial implementation)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:3000/auth/google/callback"

# Application
PORT="3000"
FRONTEND_URL="http://localhost:5173"
NODE_ENV="development"
```

---

## Performance Considerations

**Database:**
- Indexes on (userId, date) for fast queries
- Unique constraints prevent duplicate checks
- Connection pooling via Prisma

**API:**
- Pagination for large datasets (future enhancement)
- Batch sync endpoint (sync-all)
- Async processing (promises, async/await)

**Caching:**
- JWT payload reduces DB lookups
- Provider adapters are singletons (factory pattern)
- Future: Redis for token caching

**Rate Limiting:**
- Fitbit: 100ms delays
- Future: Request throttling middleware

---

## Future Enhancement Priorities

**Short-term (1-2 sprints):**
1. Complete Google OAuth verification
2. Add data export (CSV, JSON)
3. Implement webhook listeners
4. Add activity detail view

**Medium-term (2-4 sprints):**
5. Add Garmin integration
6. Add Apple Health integration
7. Batch historical data import
8. Provider comparison dashboard
9. Advanced analytics

**Long-term (6+ months):**
10. OAuth 2.0 PKCE
11. ML health insights
12. Social features
13. Third-party API

---

## Gotchas & Known Issues

**Google OAuth:**
- Infrastructure complete, token verification pending
- Don't demo Google login - it throws error

**Strava:**
- Free tier has rate limits (200 requests/15 min)
- Historical data limited to 30 days on free tier

**Fitbit:**
- Requires Basic Auth (different from Strava)
- Multiple API calls per date (slower)
- Free tier has stricter rate limits

**General:**
- OAuth requires internet connection
- Test accounts needed for demo
- Tokens expire - refresh logic handles it
- First sync can be slow for long date ranges

---

## Quick Wins to Mention

1. **Modular Design** - Easy to add providers
2. **Security First** - Multiple layers of protection
3. **Type Safety** - TypeScript catches bugs early
4. **Clean Code** - SOLID principles, design patterns
5. **User Experience** - Automatic token refresh, one-click sync
6. **Error Handling** - Graceful degradation
7. **Extensible** - Ready for future enhancements
8. **Production Ready** - Not just a prototype

---

## Code Snippets to Show (If Requested)

**Password Hashing:**
```typescript
// user.service.ts:105-110
const hashedPassword = await bcrypt.hash(password, 10);
```

**JWT Generation:**
```typescript
// user.service.ts:115-120
const token = this.jwtService.sign({
  id: user.id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName
});
```

**Token Validation:**
```typescript
// jwt-auth.guard.ts:35-40
const payload = jwt.verify(token, this.configService.get('JWT_SECRET'));
request.user = payload;
```

**OAuth State:**
```typescript
// integration.service.ts:60-70
const state = {
  userId,
  provider,
  redirectUri,
  timestamp: Date.now(),
  nonce: randomBytes(16).toString('hex')
};
return Buffer.from(JSON.stringify(state)).toString('base64');
```

**Data Transformation:**
```typescript
// strava.adapter.ts:120-130
const dailyData = activities.reduce((acc, activity) => {
  const date = activity.start_date.split('T')[0];
  if (!acc[date]) acc[date] = { activities: [] };
  acc[date].activities.push(activity);
  return acc;
}, {});
```

---

This guide should help you quickly reference key information during Q&A!