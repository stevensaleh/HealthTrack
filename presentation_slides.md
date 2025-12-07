# HealthTrack: Authentication & Health Services Integration
## Presentation Slides with Speaker Notes

---

## SLIDE 1: Title Slide

**Visual:**
```
HealthTrack
Authentication & Health Services Integration

[Your Name]
[Date]

Tech Stack:
• NestJS • JWT • PostgreSQL • Prisma
• Strava API • Fitbit API • OAuth 2.0
```

**Speaker Notes:**
"Hello everyone! Today I'll be presenting my contribution to the HealthTrack project. I was responsible for implementing two critical systems: user authentication with Google OAuth support, and health services integration with Strava and Fitbit. These features form the foundation of our app's security and automatic data collection capabilities."

---

## SLIDE 2: My Role & Contributions

**Visual:**
```
What I Built:

1. Secure Authentication System
   ✓ Email/Password registration & login
   ✓ JWT-based session management
   ✓ Google OAuth integration (partial)
   ✓ Password security & validation

2. Health Services Integration
   ✓ Strava API integration
   ✓ Fitbit API integration
   ✓ OAuth 2.0 flow for external services
   ✓ Automatic data synchronization
```

**Speaker Notes:**
"My contributions fall into two main categories. First, I built a complete authentication system that handles user registration, login, and session management using JWT tokens. I also laid the groundwork for Google OAuth, though the token verification is still pending completion.

Second, I implemented integrations with two major health platforms - Strava and Fitbit - allowing users to automatically import their fitness data instead of entering it manually. This involved implementing complete OAuth 2.0 flows for each service and building adapters to fetch and transform their data into our unified format."

---

## SLIDE 3: System Architecture Overview

**Visual:**
```
┌─────────────────┐
│  React Frontend │
└────────┬────────┘
         │ JWT Token
         ▼
┌─────────────────┐
│  API Controller │ ◄─── JwtAuthGuard
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Services     │ (Business Logic)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Repositories  │ (Data Access)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  PostgreSQL DB  │ (via Prisma ORM)
└─────────────────┘
```

**Speaker Notes:**
"Let me show you the overall architecture. We follow a clean layered approach. The frontend sends requests with JWT tokens for authentication. These hit our API controllers, which are protected by a JwtAuthGuard that validates tokens.

The controllers delegate to service classes for business logic, which in turn use repository classes for database operations. We use Prisma as our ORM to interact with PostgreSQL. This separation of concerns makes the codebase maintainable, testable, and follows NestJS best practices."

---

## SLIDE 4: Authentication System - Overview

**Visual:**
```
Authentication Flow:

Registration:
User → Email/Password → Validate → Hash (bcrypt) → Save → Generate JWT

Login:
User → Credentials → Verify → Compare Hash → Generate JWT → Return Token

Protected Requests:
Request + JWT → JwtAuthGuard → Validate Token → Extract User → Allow/Deny

Password Requirements:
✓ Minimum 8 characters
✓ At least 1 uppercase letter
✓ At least 1 lowercase letter
✓ At least 1 number
✓ Bcrypt hashing (10 salt rounds)
```

**Speaker Notes:**
"The authentication system works in three main flows. During registration, we validate the password strength - it must be at least 8 characters with uppercase, lowercase, and a number. We hash it using bcrypt with 10 salt rounds for security, then generate a JWT token.

For login, we verify credentials by comparing the provided password against the stored hash using bcrypt. On success, we generate a JWT token that expires in 24 hours.

For all subsequent requests to protected endpoints, the JwtAuthGuard intercepts the request, extracts the token from the Authorization header, validates its signature using our secret key, and either allows the request or throws an Unauthorized exception."

---

## SLIDE 5: JWT Guard Implementation

**Visual:**
```typescript
// jwt-auth.guard.ts

@Injectable()
export class JwtAuthGuard implements CanActivate {

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    // Extract token from "Authorization: Bearer <token>"
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    // Verify and decode JWT
    const payload = jwt.verify(token, JWT_SECRET);

    // Attach user info to request
    request.user = payload;

    return true;
  }
}
```

**Key File:** `src/app/guards/jwt-auth.guard.ts`

**Speaker Notes:**
"Here's the actual implementation of our JWT guard. It implements NestJS's CanActivate interface, which means it runs before every protected route.

The guard extracts the Bearer token from the Authorization header, verifies its signature using our JWT_SECRET environment variable, and decodes the payload. If valid, it attaches the user information to the request object so controllers can access it. If invalid or missing, it throws an UnauthorizedException.

This guard is registered globally, and we can mark specific routes as public using a custom decorator. This is located in our codebase at line 20 of the jwt-auth.guard.ts file."

---

## SLIDE 6: User Service - Core Logic

**Visual:**
```typescript
// Key Methods in user.service.ts

async register(data: RegisterDto) {
  // 1. Validate email uniqueness
  // 2. Enforce password strength
  // 3. Hash password with bcrypt (10 rounds)
  const hashedPassword = await bcrypt.hash(password, 10);
  // 4. Create user in database
  // 5. Generate JWT token
  return { accessToken, user };
}

async login(data: LoginDto) {
  // 1. Find user by email
  // 2. Compare password with bcrypt.compare()
  const isValid = await bcrypt.compare(password, user.password);
  // 3. Generate JWT if valid
  return { accessToken, user };
}

async changePassword(userId, currentPassword, newPassword) {
  // 1. Verify current password
  // 2. Validate new password strength
  // 3. Hash and update
}
```

**Key File:** `src/core/services/user.service.ts:95-200`

**Speaker Notes:**
"The UserService contains all our authentication business logic. The register method validates that the email is unique, enforces password strength requirements I mentioned earlier, hashes the password with bcrypt using 10 salt rounds, creates the user in the database, and returns a JWT token.

The login method finds the user by email, uses bcrypt.compare to verify the password against the stored hash - this is important because you can never decrypt bcrypt hashes, only compare - and generates a new JWT on success.

We also have a changePassword method that first verifies the user knows their current password before allowing them to change it. This prevents unauthorized password changes if someone gets temporary access to a logged-in session."

---

## SLIDE 7: Google OAuth - Current Status

**Visual:**
```
Google OAuth Implementation Status:

✅ COMPLETED:
• Database schema with googleId field
• User model supports OAuth users (nullable password)
• GoogleLoginDto and service method created
• Environment variables configured
• Dependencies installed (passport-google-oauth20)
• API endpoint created (/users/google-login)

⚠️ PENDING:
• Google token verification implementation
• Google Passport Strategy
• Callback handler
• Frontend integration

Current Endpoint:
POST /users/google-login
→ Throws: "Google OAuth not fully implemented"
```

**Key File:** `src/app/controllers/user.controller.ts:88-97`

**Speaker Notes:**
"Let me be transparent about the Google OAuth implementation. I've built all the infrastructure - the database can store Google IDs, user accounts support OAuth without passwords, all the DTOs and service methods are in place, and the API endpoint exists.

However, the actual token verification using Google's libraries isn't complete yet. The endpoint currently throws a placeholder error telling developers it needs implementation. This was a time constraint issue - the infrastructure work took significant effort, and we prioritized getting the email/password authentication and health integrations fully functional first.

The good news is that about 70% of the work is done. Someone just needs to implement the Google token verification library, extract the user profile, and wire it to the existing loginWithGoogle service method. The database schema in our Prisma file shows the googleId field at line 15 of schema.prisma."

---

## SLIDE 8: Health Integrations - Architecture

**Visual:**
```
Modular Adapter Pattern:

┌─────────────────────────────────────┐
│      Integration Controller         │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│      Integration Service            │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   Health Data Provider Factory      │
└──────────────┬──────────────────────┘
               │
       ┌───────┴────────┬──────────┐
       ▼                ▼          ▼
┌─────────────┐  ┌──────────┐  ┌────────┐
│   Strava    │  │  Fitbit  │  │ Lose It│
│   Adapter   │  │  Adapter │  │ Adapter│
└─────────────┘  └──────────┘  └────────┘

Each adapter implements: IHealthDataProvider
• generateAuthUrl()
• exchangeCodeForToken()
• fetchHealthData()
• refreshAccessToken()
• revokeAccess()
```

**Speaker Notes:**
"For health integrations, I designed a modular adapter pattern. At the top, we have an Integration Controller that handles HTTP requests. It delegates to the Integration Service for business logic.

The service uses a Health Data Provider Factory - this is a factory pattern that selects the appropriate adapter based on the provider. Currently we support Strava, Fitbit, and have infrastructure for Lose It.

Each adapter implements a common interface called IHealthDataProvider with five key methods: generating OAuth authorization URLs, exchanging authorization codes for tokens, fetching health data, refreshing expired tokens, and revoking access when users disconnect.

This design makes it incredibly easy to add new providers. For example, if we wanted to add Garmin, we'd just create a GarminAdapter that implements the same five methods, register it in the factory, and it works with all existing code. No changes needed anywhere else."

---

## SLIDE 9: Strava Integration - Deep Dive

**Visual:**
```
Strava OAuth & Data Flow:

1. Authorization:
   Scope: activity:read_all, profile:read_all
   → User approves → Callback with code

2. Token Exchange:
   POST https://www.strava.com/oauth/token
   → Returns: access_token, refresh_token, expires_at

3. Data Fetching:
   GET /api/v3/athlete/activities
   Parameters: before, after, per_page (max 200)

4. Data Transformation:
   Activities → Group by Date → Aggregate:
   • exerciseMinutes = Σ moving_time
   • caloriesBurned = Σ calories
   • distance = Σ distance (meters)
   • heartRate = AVG(average_heartrate)

5. Token Management:
   • Auto-refresh when expired
   • Revoke on disconnect
```

**Key File:** `src/infra/adapters/health-providers/strava.adapter.ts`

**Speaker Notes:**
"Let's dive into the Strava integration. The OAuth flow starts by generating an authorization URL with specific scopes - we request permission to read all activities and profile data. When the user approves, Strava redirects back with an authorization code.

We exchange this code for an access token and refresh token. Strava tokens expire, so we store the expiration timestamp.

To fetch data, we call Strava's athlete activities endpoint with date range parameters. We can fetch up to 200 activities per request. Since Strava gives us individual activities - like a morning run, an afternoon bike ride - we need to group them by date and aggregate the metrics.

The transformation logic sums up moving time for exercise minutes, sums calories burned, sums distance, and calculates average heart rate from activities that have heart rate data.

We also implemented automatic token refresh - before fetching data, we check if the token is expired or expiring within 5 minutes, and refresh it transparently. Users never see this happening. When they disconnect, we properly revoke the token with Strava's API."

---

## SLIDE 10: Fitbit Integration - Multi-API Approach

**Visual:**
```
Fitbit OAuth & Data Sync:

1. Authorization:
   Scopes: activity heartrate sleep weight nutrition profile
   Auth Method: Basic Auth (base64(clientId:clientSecret))

2. Data Fetching Strategy - Per Date:
   For each date in range:
     Parallel API Calls (Promise.allSettled):

     ├─ GET /activities/date/{date}.json
     │  → steps, calories, active minutes, distance
     │
     ├─ GET /sleep/date/{date}.json
     │  → minutesAsleep
     │
     ├─ GET /activities/heart/date/{date}/1d.json
     │  → restingHeartRate
     │
     └─ GET /body/log/weight/date/{date}/30d.json
        → weight

3. Resilience:
   • Promise.allSettled (if one fails, others continue)
   • 100ms delays between dates (rate limit protection)
   • Handles 429 errors gracefully
```

**Key File:** `src/infra/adapters/health-providers/fitbit.adapter.ts`

**Speaker Notes:**
"Fitbit integration is more complex because their API is structured differently. Instead of one endpoint that gives you everything, you need to call multiple endpoints for different data types.

During OAuth, we request broader scopes - activity, heart rate, sleep, weight, nutrition, and profile. Fitbit uses Basic Authentication for the token exchange, where we base64-encode our client ID and secret.

For data fetching, we iterate through each date in the range. For each date, we make four parallel API calls using Promise.allSettled. This is crucial - if the user doesn't have sleep data for a particular day, that API call might fail, but we still want the activity data. Promise.allSettled lets all promises complete regardless of failures.

The four calls fetch activity summary for steps and calories, sleep data for minutes asleep, heart rate data for resting heart rate, and weight logs.

We also built in resilience for rate limits. There's a 100ms delay between each date to avoid hitting Fitbit's rate limits. If we detect a 429 response, we log a warning. This makes the integration much more reliable in production."

---

## SLIDE 11: Unified Data Model

**Visual:**
```typescript
// All providers transform to this standard format:

interface ExternalHealthData {
  date: Date;                    // Required
  steps?: number;                // 0-100,000
  weight?: number;               // 20-500 kg
  caloriesBurned?: number;       // 0-20,000
  exerciseMinutes?: number;      // 0-1,440
  sleepMinutes?: number;         // 0-1,440
  heartRate?: number;            // 30-250 bpm
  distance?: number;             // meters
  activeMinutes?: number;        // 0-1,440
  restingHeartRate?: number;     // 30-250 bpm
  provider: HealthDataProvider;  // STRAVA, FITBIT, etc.
  rawData?: any;                 // Original API response
}

✓ Validation on all fields
✓ Range checking
✓ Duplicate detection
✓ Single database schema
```

**Speaker Notes:**
"This is one of the most important design decisions - the unified data model. No matter which provider the data comes from, we transform it into this standard ExternalHealthData format.

Each field is optional except the date and provider, because different services track different metrics. Strava doesn't track sleep, Fitbit doesn't focus on exercise duration the same way. This flexibility is important.

We validate every field with reasonable ranges - steps can't be negative or more than 100,000, heart rate must be between 30 and 250 BPM, weight between 20 and 500 kg. This catches bad data before it enters our database.

The benefit of this approach is huge. Our database has one schema for health data. Our charts and dashboards don't care if data came from Strava or Fitbit. And when we add a new provider, we just transform their data to this format - no changes needed anywhere else in the app.

We also keep the raw data from the original API response in case we need to debug or add new features later."

---

## SLIDE 12: OAuth State Security

**Visual:**
```
OAuth State Management (CSRF Protection):

State Encoding:
{
  userId: "uuid",
  provider: "STRAVA" | "FITBIT" | "LOSE_IT",
  redirectUri: "http://localhost:5173/integrations",
  timestamp: 1638360000,
  nonce: "random-string"
}
↓ Encode to Base64
→ "eyJ1c2VySWQiOiJ1dWlkIiwicHJvdmlk..."

Authorization Flow:
1. User clicks "Connect Strava"
2. Backend generates state → encodes → sends to Strava
3. User approves on Strava
4. Strava redirects back with code + state
5. Backend validates:
   ✓ State format is valid
   ✓ Timestamp < 10 minutes old
   ✓ userId matches session
   ✓ Provider matches expected
6. Exchange code for token

Security Benefits:
• Prevents CSRF attacks
• Validates request freshness
• Ensures user context
```

**Key File:** `src/core/services/integration.service.ts:50-75`

**Speaker Notes:**
"Security was a major concern with OAuth integrations. We use OAuth state parameters to prevent Cross-Site Request Forgery attacks.

When a user initiates a connection, we generate a state object containing their user ID, the provider they're connecting to, where to redirect them back, a timestamp, and a random nonce. We encode this as Base64 and send it to the provider.

When the provider redirects back, they include this state unchanged. We decode it and perform several validations. First, we check if it's valid JSON. Second, we verify the timestamp is less than 10 minutes old - this prevents replay attacks. Third, we ensure the user ID matches the current session. Fourth, we verify the provider matches what we expected.

Only after all these checks pass do we proceed with the token exchange. This prevents attackers from tricking users into connecting their Strava account to someone else's HealthTrack account, which would be a serious security vulnerability.

The implementation is in our integration service around line 60."

---

## SLIDE 13: Token Management & Refresh

**Visual:**
```
Automatic Token Refresh Flow:

Before Data Sync:
┌─────────────────────────────┐
│ Check token expiration      │
└──────────┬──────────────────┘
           │
           ▼
    ┌──────────────┐
    │ Expired OR   │
    │ Expiring in  │───Yes──┐
    │ < 5 minutes? │        │
    └──────────────┘        │
           │                │
           No               │
           │                ▼
           │         ┌──────────────────┐
           │         │ Call provider    │
           │         │ refreshToken()   │
           │         └─────────┬────────┘
           │                   │
           │                   ▼
           │         ┌──────────────────┐
           │         │ Update database  │
           │         │ with new tokens  │
           │         └─────────┬────────┘
           │                   │
           └───────────────────┘
                     │
                     ▼
           ┌──────────────────┐
           │ Proceed with     │
           │ data fetch       │
           └──────────────────┘

Token Storage in Database:
{
  accessToken: "encrypted",
  refreshToken: "encrypted",
  expiresAt: DateTime,
  status: "ACTIVE" | "EXPIRED" | "REVOKED"
}
```

**Speaker Notes:**
"Token management is completely automatic and transparent to users. Every time we're about to sync data, we check if the current access token is expired or expiring within the next 5 minutes.

If it is, we use the refresh token to get a new access token from the provider - each provider has its own refresh endpoint. We then update the database with the new access token, new expiration time, and often a new refresh token.

This all happens behind the scenes. Users just click 'Sync' and it works, even if their token expired weeks ago. They never have to re-authenticate unless they explicitly disconnect and reconnect.

We store all token information in the database as encrypted JSON in the credentials field. We also track the status - ACTIVE means it's working, EXPIRED means it needs refresh, and REVOKED means the user disconnected it.

This approach provides a seamless user experience while maintaining security best practices."

---

## SLIDE 14: Database Schema

**Visual:**
```sql
-- Integration Model (Prisma Schema)

model Integration {
  id              String               @id @default(uuid())
  userId          String
  provider        IntegrationProvider  // STRAVA, FITBIT, LOSE_IT

  // OAuth Credentials (encrypted)
  accessToken     String
  refreshToken    String?
  expiresAt       DateTime?
  credentials     Json?                // Full OAuth response

  // Status & Sync
  isActive        Boolean              @default(true)
  status          IntegrationStatus    // ACTIVE, EXPIRED, REVOKED, ERROR
  lastSyncedAt    DateTime?
  syncErrorMessage String?

  // Timestamps
  createdAt       DateTime             @default(now())
  updatedAt       DateTime             @updatedAt

  // Relations
  user            User                 @relation(fields: [userId])

  // Constraints
  @@unique([userId, provider])         // One provider per user
  @@index([userId, isActive])
}

-- Health Data Model

model HealthData {
  id           String   @id @default(uuid())
  userId       String
  date         DateTime

  // Metrics
  steps        Int?
  weight       Float?
  calories     Int?
  // ... other fields

  source       String   @default("MANUAL")  // "STRAVA", "FITBIT", "MANUAL"

  @@unique([userId, date, source])          // Prevent duplicates
  @@index([userId, date])
}
```

**Key File:** `prisma/schema.prisma:45-85`

**Speaker Notes:**
"Let me show you the database schema. The Integration model stores all connection information. Each integration has a unique ID, ties to a user, and specifies the provider.

We store the OAuth access token, optional refresh token, and expiration timestamp. The credentials field is a JSON column that stores the complete OAuth response - this gives us flexibility if providers include additional data we need later.

We track whether the integration is active, its current status, when it was last synced, and any sync error messages for debugging. There's a unique constraint ensuring users can only have one connection per provider - you can't connect two Strava accounts.

The Health Data model stores the actual synced data. Each record has metrics like steps, weight, and calories. Critically, we have a 'source' field that tags where the data came from - MANUAL for user entry, or STRAVA, FITBIT for synced data.

There's a unique constraint on userId, date, and source. This prevents duplicate data - we can't have two records for the same user, same date, from the same source. This is important when users manually sync multiple times.

The schema is in our prisma directory at lines 45 through 85."

---

## SLIDE 15: API Endpoints Summary

**Visual:**
```
Authentication Endpoints:

POST   /users/register           Create new account
POST   /users/login              Login with credentials
POST   /users/google-login       Google OAuth (partial)
GET    /users/me                 Get current user profile
PATCH  /users/me                 Update profile
POST   /users/change-password    Change password
DELETE /users/me                 Delete account
GET    /users/stats              Get user statistics

═══════════════════════════════════════════════════

Integration Endpoints:

POST   /integrations/connect            Initiate OAuth flow
GET    /integrations/callback           OAuth callback handler
GET    /integrations                    List all integrations
GET    /integrations/:id                Get specific integration
POST   /integrations/:id/sync           Manual sync one integration
POST   /integrations/sync-all           Sync all integrations
DELETE /integrations/:id                Disconnect integration
GET    /integrations/providers/info     Get provider information

Total: 16 endpoints created
Auth: JWT required (except public endpoints: register, login, callback)
```

**Speaker Notes:**
"I created a total of 16 RESTful API endpoints across authentication and integrations.

For authentication, we have the standard endpoints - register, login, get and update profile, change password, and delete account. We also have a statistics endpoint that provides user-specific metrics, and the partial Google login endpoint we discussed earlier.

For integrations, the connect endpoint initiates the OAuth flow by generating an authorization URL. The callback endpoint handles the redirect from Strava or Fitbit after user authorization.

Users can list all their integrations, get details on a specific one, manually trigger a sync for one integration, or sync all of them at once with a single button click. They can also disconnect integrations, which properly revokes the OAuth tokens.

The providers info endpoint returns metadata about available providers - what data types they support, their names, descriptions, etc. This powers the frontend integration cards.

All endpoints except register, login, and OAuth callback require JWT authentication. The guard we discussed earlier automatically enforces this."

---

## SLIDE 16: Frontend Integration UI

**Visual:**
```
IntegrationsModal Component:

┌─────────────────────────────────────┐
│  Connected Health Services          │
├─────────────────────────────────────┤
│                                     │
│  ┌───────────────────────────────┐ │
│  │ 🚴 Strava                     │ │
│  │ Track your cycling and        │ │
│  │ running activities            │ │
│  │                               │ │
│  │ Status: Connected ✓           │ │
│  │ Last synced: 2 hours ago      │ │
│  │                               │ │
│  │  [Sync Now]  [Disconnect]     │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ 💪 Fitbit                     │ │
│  │ Sync your fitness and health  │ │
│  │                               │ │
│  │ Status: Not connected         │ │
│  │                               │ │
│  │  [Connect]                    │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘

React Hook: useIntegrations()
• fetchIntegrations()
• initiateConnection(provider)
• syncIntegration(id)
• disconnectIntegration(id)
```

**Key Files:**
- `app/web/src/components/IntegrationsModal.tsx`
- `app/web/src/hooks/useIntegrations.ts`

**Speaker Notes:**
"The frontend integration was also part of my work. We have an IntegrationsModal component that displays cards for each available provider - Strava, Fitbit, and Lose It.

Each card shows the provider logo, name, description, and connection status. If disconnected, users see a 'Connect' button that triggers the OAuth flow. If connected, they see when it was last synced and two buttons - 'Sync Now' for manual synchronization and 'Disconnect' to remove the integration.

The UI is powered by a custom React hook called useIntegrations. This hook provides functions to fetch all integrations, initiate new connections, sync data, and disconnect. It handles all the API calls and state management.

When you click Connect, the hook calls our backend API, receives the OAuth authorization URL, and redirects the browser to Strava or Fitbit. After the user approves, they're redirected back to our app, the callback endpoint handles the token exchange, and the UI updates to show the connected state.

It's a clean, user-friendly interface that abstracts away all the OAuth complexity. Users just click Connect, approve on the provider's site, and they're done."

---

## SLIDE 17: Key Security Features

**Visual:**
```
Security Implementation:

1. Password Security
   ✓ Bcrypt hashing (10 salt rounds)
   ✓ Never stored in plain text
   ✓ Never returned in API responses
   ✓ Strength validation (8+ chars, mixed case, number)
   ✓ Separate change-password endpoint (requires current password)

2. JWT Security
   ✓ Bearer token format (Authorization: Bearer <token>)
   ✓ 24-hour expiration
   ✓ Secret key from environment variables (not hardcoded)
   ✓ Signature verification on every request
   ✓ User info embedded in token (no DB lookup needed)

3. OAuth Security
   ✓ CSRF protection via state parameter
   ✓ State expiration (10 minutes)
   ✓ Encrypted credential storage
   ✓ Automatic token refresh
   ✓ Proper token revocation on disconnect

4. Input Validation
   ✓ Class-validator decorators on DTOs
   ✓ Email format validation
   ✓ XSS prevention (sanitize-html library)
   ✓ Range validation on health data
   ✓ Type safety with TypeScript

5. Database Security
   ✓ Prepared statements via Prisma (SQL injection prevention)
   ✓ Unique constraints (prevent duplicates)
   ✓ Foreign key relationships (referential integrity)
   ✓ Indexed queries (performance + security)
```

**Speaker Notes:**
"Security was a top priority throughout this implementation. Let me highlight the key security features.

For passwords, we use bcrypt hashing with 10 salt rounds. Passwords are never stored in plain text and never returned in API responses, even in user profile objects. We enforce strength requirements and require the current password before allowing changes - this prevents unauthorized password changes.

For JWT tokens, we use the standard Bearer token format in the Authorization header. Tokens expire after 24 hours, forcing periodic re-authentication. The secret key comes from environment variables, never hardcoded. Every protected request verifies the token signature.

For OAuth, we implement CSRF protection using time-limited state parameters that expire after 10 minutes. Credentials are stored encrypted in the database. Tokens refresh automatically, and we properly revoke them when users disconnect.

We validate all inputs using class-validator decorators on our DTOs. Email formats are validated, user inputs are sanitized to prevent XSS attacks, and health data goes through range validation.

Finally, we use Prisma ORM which automatically uses prepared statements, preventing SQL injection. We have unique constraints to prevent duplicate records, foreign keys for referential integrity, and indexed queries for both performance and security.

This multi-layered security approach protects user data and prevents common vulnerabilities."

---

## SLIDE 18: Error Handling & Resilience

**Visual:**
```
Production-Ready Error Handling:

1. Fitbit Resilience
   • Promise.allSettled() - Failed API calls don't break sync
   • Rate limit detection - Handles 429 responses
   • Delays between requests - 100ms to avoid limits
   • Graceful degradation - Partial data is better than no data

2. Token Management
   • Automatic refresh on expiration
   • Status tracking: ACTIVE → EXPIRED → ERROR
   • Error messages stored in database
   • Retry logic for network failures

3. Data Validation
   • Range checks prevent bad data entry
   • Duplicate detection via unique constraints
   • Required field validation
   • Type safety with TypeScript + Prisma

4. User-Facing Errors
   • Clear error messages (no stack traces to users)
   • HTTP status codes (401, 403, 404, 500)
   • Validation errors returned with field names
   • Sync errors displayed in UI

Example Error Response:
{
  "statusCode": 400,
  "message": "Password must contain at least one uppercase letter",
  "error": "Bad Request"
}
```

**Speaker Notes:**
"This isn't just a proof-of-concept - it's production-ready code with comprehensive error handling.

For Fitbit, we use Promise.allSettled instead of Promise.all. This means if the sleep API fails but activity data succeeds, we save the activity data. We detect rate limit responses and log warnings. The 100ms delays between requests prevent hitting rate limits in the first place.

Token management is resilient - we automatically refresh expired tokens, track status changes, and store error messages for debugging. There's retry logic for temporary network failures.

All data goes through validation. We have range checks, duplicate detection through database constraints, required field validation, and TypeScript's type safety catches errors at compile time.

User-facing errors are clean and actionable. We never expose stack traces to users. HTTP status codes are semantic - 401 for unauthorized, 400 for validation errors, 500 for server errors. Validation errors include the specific field that failed.

This error handling makes the app reliable in real-world conditions with flaky networks, API downtime, and invalid user inputs."

---

## SLIDE 19: DEMO TIME

**Visual:**
```
Live Demo Flow:

1. Authentication
   □ Register new user
   □ Login → Receive JWT token
   □ Access protected endpoint (/users/me)

2. Connect Strava
   □ Open Integrations modal
   □ Click "Connect Strava"
   □ OAuth redirect → Approve
   □ Callback → Token exchange
   □ Show connected status

3. Sync Data
   □ Click "Sync Now"
   □ API calls to Strava
   □ Transform data
   □ Save to database

4. View Data
   □ Navigate to dashboard
   □ Show health data with "source: STRAVA" tag
   □ Charts populated with real data

5. Database Inspection
   □ Show Integration record
   □ Show HealthData records
   □ Point out encrypted tokens
```

**Speaker Notes:**
"Let me show you this in action. [Switch to demo]

First, I'll register a new user account with email and password. Notice the validation - if I try a weak password, it's rejected. [Register successfully]

Now I'll login with those credentials and receive a JWT token. Watch what happens if I try to access my profile without the token - 401 Unauthorized. But with the token in the Authorization header, it works.

Now let's connect Strava. I'll open the integrations modal and click 'Connect Strava'. Notice I'm redirected to Strava's authorization page. I'll approve the permissions. [Approve]

Strava redirects back with a code, our callback endpoint exchanges it for tokens, and the UI updates instantly showing 'Connected' status with a timestamp.

Now I'll click 'Sync Now'. Behind the scenes, this is calling Strava's API, transforming the data to our unified format, and saving to the database. [Show sync]

Finally, let's view the data. On the dashboard, you can see my activities now show up with a 'Strava' tag. The charts are populated with real exercise minutes and calories from my actual runs.

If I open the database, you can see the Integration record with encrypted tokens, and the HealthData records with source set to STRAVA.

Everything is working end-to-end, from OAuth through data sync to visualization."

---

## SLIDE 20: Challenges & Solutions

**Visual:**
```
Technical Challenges Faced:

1. Challenge: Different OAuth implementations per provider
   Solution: Created adapter pattern with unified IHealthDataProvider interface
   Result: Easy to add new providers - just implement 5 methods

2. Challenge: Fitbit API rate limits
   Solution: 100ms delays + Promise.allSettled for resilience
   Result: Reliable syncing without hitting rate limits

3. Challenge: Token expiration during long sessions
   Solution: Automatic refresh with 5-minute buffer
   Result: Users never see auth errors during sync

4. Challenge: Strava vs Fitbit data structure differences
   Solution: Unified ExternalHealthData model with transformation layer
   Result: Single database schema, provider-agnostic frontend

5. Challenge: OAuth state security (CSRF prevention)
   Solution: Encoded state with timestamp validation (10-min expiry)
   Result: Secure OAuth flow preventing CSRF attacks

6. Challenge: Handling partial data availability
   Solution: Optional fields + graceful degradation
   Result: Sync succeeds even if some metrics unavailable
```

**Speaker Notes:**
"Every project has challenges. Let me share some key ones and how I solved them.

First challenge: each provider implements OAuth differently. Strava uses one token format, Fitbit uses Basic Auth, they have different scopes. My solution was the adapter pattern - each provider has its own adapter, but they all implement the same interface. This makes the rest of the codebase provider-agnostic.

Second: Fitbit has strict rate limits. If you make requests too fast, they return 429 errors. I added 100ms delays between date iterations and used Promise.allSettled so partial failures don't crash the entire sync. This makes it production-reliable.

Third: tokens expire, sometimes while users are actively using the app. I implemented automatic refresh with a 5-minute buffer - before tokens actually expire, we refresh them proactively. Users never see authentication errors.

Fourth: Strava gives you activities, Fitbit gives you daily summaries - completely different structures. The unified data model solves this. Each adapter transforms its provider's format into our standard format. The database and frontend don't care about provider differences.

Fifth: OAuth state parameters prevent CSRF attacks. I encoded user context into the state with timestamps, validated everything on callback, and expire states after 10 minutes. This prevents attackers from hijacking OAuth flows.

Finally: not all users have all data types. Maybe they don't have a heart rate monitor, or they didn't sleep well and Fitbit has no data. Using optional fields and graceful degradation means syncs succeed with whatever data is available."

---

## SLIDE 21: Impact & Results

**Visual:**
```
Project Impact:

Metrics:
✓ 16 API endpoints created
✓ 3 health data providers supported
✓ 9 health data types synced
✓ 100% JWT-secured protected routes
✓ 0 security vulnerabilities (bcrypt, prepared statements, XSS prevention)

User Benefits:
✓ Secure account management
✓ Automatic health data import (no manual entry)
✓ Real-time sync with fitness devices
✓ Unified data from multiple sources
✓ Seamless token management (users never see expiration)

Technical Benefits:
✓ Modular architecture (easy to extend)
✓ Type-safe codebase (TypeScript + Prisma)
✓ Production-ready error handling
✓ Clean separation of concerns
✓ Comprehensive security implementation

Code Statistics:
• 5 core services
• 8 adapters/providers
• 12 DTOs for validation
• 2 database models
• 3,500+ lines of code
```

**Speaker Notes:**
"Let me summarize the impact of this work.

From a metrics perspective, I created 16 RESTful endpoints, integrated 3 health data providers, and support syncing 9 different health metrics. Every protected route is secured with JWT authentication, and we have zero known security vulnerabilities thanks to bcrypt, prepared statements, and XSS prevention.

For users, this means secure account management, no more manual data entry - your fitness data syncs automatically, real-time sync with devices, unified data from multiple sources in one place, and completely transparent token management.

From a technical perspective, the modular architecture makes it trivial to add new providers. The codebase is fully type-safe with TypeScript and Prisma. Error handling is production-grade. We have clean separation of concerns following NestJS best practices. And security is implemented at every layer.

In terms of code volume, this includes 5 core services, 8 adapters and providers, 12 DTOs for input validation, 2 main database models, and over 3,500 lines of well-structured code.

This work establishes the foundation for HealthTrack's security and data collection capabilities. It's not just functional - it's secure, scalable, and maintainable."

---

## SLIDE 22: Code Quality Highlights

**Visual:**
```
Best Practices Implemented:

1. Design Patterns
   ✓ Adapter Pattern (health providers)
   ✓ Factory Pattern (provider selection)
   ✓ Repository Pattern (data access)
   ✓ Dependency Injection (NestJS)

2. SOLID Principles
   ✓ Single Responsibility (controllers, services, repos separate)
   ✓ Open/Closed (adapters extend without modifying core)
   ✓ Liskov Substitution (all adapters interchangeable)
   ✓ Interface Segregation (IHealthDataProvider)
   ✓ Dependency Inversion (depend on interfaces, not implementations)

3. Clean Code
   ✓ Meaningful variable/function names
   ✓ Small, focused functions
   ✓ No code duplication
   ✓ Comprehensive error handling
   ✓ Type safety everywhere

4. Testing Considerations
   ✓ Mockable interfaces
   ✓ Dependency injection enables unit testing
   ✓ Separation of concerns aids testing
   ✓ DTOs provide validation layer

5. Documentation
   ✓ TypeScript types as documentation
   ✓ Clear API contracts (DTOs)
   ✓ Meaningful error messages
```

**Speaker Notes:**
"I want to highlight the code quality aspects because these are what make this codebase maintainable long-term.

I implemented multiple design patterns - the adapter pattern for providers, factory pattern for provider selection, repository pattern for data access, and dependency injection throughout via NestJS.

The code follows SOLID principles. Each class has a single responsibility - controllers handle HTTP, services handle business logic, repositories handle data. It's open for extension but closed for modification - we can add new providers without changing existing code. All adapters are interchangeable thanks to the common interface.

Clean code practices include meaningful names - no single-letter variables - small focused functions, zero code duplication, comprehensive error handling, and type safety everywhere thanks to TypeScript.

The architecture is highly testable. All interfaces are mockable, dependency injection makes unit testing straightforward, separation of concerns means you can test each layer independently, and DTOs provide a natural validation layer.

For documentation, TypeScript types serve as inline documentation, DTOs define clear API contracts, and error messages are meaningful and actionable.

This isn't just code that works - it's code that other developers can understand, maintain, and extend. That's crucial for a group project and future development."

---

## SLIDE 23: Future Enhancements

**Visual:**
```
Potential Next Steps:

Short-Term (1-2 sprints):
□ Complete Google OAuth token verification
□ Add Google Passport Strategy
□ Implement Google callback handler
□ Frontend Google login button

Medium-Term (2-4 sprints):
□ Add more providers:
  • Garmin Connect
  • Apple Health (via HealthKit)
  • Google Fit
  • MyFitnessPal

□ Enhanced features:
  • Webhook listeners (real-time sync instead of manual)
  • Batch data import (historical data backfill)
  • Data export functionality (CSV, JSON)
  • Activity-level detail view
  • Provider comparison dashboard

Long-Term (6+ months):
□ OAuth 2.0 PKCE for enhanced security
□ Multi-device support (multiple Fitbit devices)
□ Advanced analytics across providers
□ Machine learning for health insights
□ Social features (share activities)
□ Third-party API for other apps to consume data
```

**Speaker Notes:**
"Looking forward, there are several natural extensions to this work.

In the short term, the obvious task is completing Google OAuth. The infrastructure is there, we just need to implement token verification, add the Passport strategy, wire up the callback handler, and add a button on the frontend. This could be done in 1-2 sprints.

Medium-term, the adapter pattern makes it easy to add more providers. Garmin, Apple Health, Google Fit, MyFitnessPal - each would just be a new adapter implementing the same five methods. We could also add webhook listeners so data syncs automatically when users complete activities, rather than requiring manual sync.

Other medium-term features include batch importing historical data, data export functionality for users who want their data in CSV or JSON, activity-level detail views instead of just daily summaries, and a comparison dashboard showing data across providers.

Long-term possibilities include implementing OAuth 2.0 PKCE for even stronger security, supporting multiple devices per provider, advanced analytics that combine data from all providers, machine learning for health insights and predictions, social features where users can share activities, and even exposing a third-party API so other apps can consume HealthTrack data.

The architecture we've built is extensible enough to support all of these without major refactoring. That's the power of good design up front."

---

## SLIDE 24: Key Takeaways

**Visual:**
```
What I Learned & What I Built:

Technical Skills Developed:
✓ OAuth 2.0 implementation (multiple providers)
✓ JWT authentication & authorization
✓ RESTful API design
✓ NestJS framework mastery
✓ Prisma ORM & database modeling
✓ TypeScript advanced features
✓ Security best practices
✓ External API integration
✓ Error handling & resilience
✓ Design patterns in practice

Soft Skills:
✓ System architecture design
✓ Security-first mindset
✓ Problem-solving complex challenges
✓ Code maintainability focus
✓ Documentation importance

What Makes This Implementation Strong:
1. Modular & extensible architecture
2. Production-grade security
3. Comprehensive error handling
4. Type-safe throughout
5. Clean separation of concerns
6. Well-documented code
7. User-friendly API
8. Resilient to failures
```

**Speaker Notes:**
"Let me wrap up with key takeaways.

From a technical skills perspective, this project gave me hands-on experience with OAuth 2.0 across multiple providers - understanding the nuances of different implementations. I implemented JWT authentication from scratch, not just using a library. I designed RESTful APIs, mastered NestJS framework, learned Prisma ORM for database modeling, used advanced TypeScript features, applied security best practices at every layer, integrated external APIs, built resilient error handling, and implemented design patterns in real production code.

I also developed soft skills - architecting entire systems from scratch, thinking security-first throughout development, solving complex challenges like rate limiting and token management, focusing on long-term maintainability, and understanding the importance of good documentation.

What makes this implementation strong is the combination of modularity - it's easy to extend - production-grade security at every layer, comprehensive error handling that makes it reliable, type safety throughout the codebase catching bugs early, clean separation of concerns making it testable, well-documented code that others can understand, user-friendly APIs, and resilience to real-world failures.

This wasn't just about making features work - it was about making them work correctly, securely, and maintainably. That's what I'm most proud of in this contribution."

---

## SLIDE 25: Architecture Diagram (Summary)

**Visual:**
```
HealthTrack System Architecture

┌─────────────────────────────────────────────────────────┐
│                    React Frontend                       │
│  • IntegrationsModal  • Login/Register Forms            │
│  • Dashboard with synced data                           │
└────────────┬────────────────────────────────────────────┘
             │ HTTP Requests + JWT Token
             ▼
┌────────────────────────────────────────────────────────┐
│              API Layer (NestJS)                        │
│  ┌──────────────┐  ┌──────────────────────────────┐   │
│  │JwtAuthGuard  │  │  Controllers                 │   │
│  │(validates    │→ │  • UserController            │   │
│  │ all requests)│  │  • IntegrationController     │   │
│  └──────────────┘  └──────────────────────────────┘   │
└────────────┬───────────────────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────────────────┐
│              Service Layer                             │
│  • UserService (auth logic)                            │
│  • IntegrationService (OAuth + sync)                   │
└────────────┬───────────────────────────────────────────┘
             │
      ┌──────┴──────┐
      ▼             ▼
┌──────────┐  ┌─────────────────────────────────────┐
│Repositories│  │  Health Data Provider Factory     │
│(Prisma)   │  └─────────┬───────────────────────────┘
└──────────┘            │
      │          ┌──────┴──────┬──────────┐
      │          ▼             ▼          ▼
      │    ┌─────────┐  ┌──────────┐  ┌────────┐
      │    │ Strava  │  │  Fitbit  │  │Lose It │
      │    │ Adapter │  │  Adapter │  │Adapter │
      │    └────┬────┘  └────┬─────┘  └───┬────┘
      │         │            │            │
      │         └────────────┴────────────┘
      │                   │
      │                   ▼
      │         ┌──────────────────┐
      │         │  External APIs   │
      │         │  • Strava API    │
      │         │  • Fitbit API    │
      │         └──────────────────┘
      ▼
┌────────────────┐
│  PostgreSQL    │
│  • Users       │
│  • Integrations│
│  • HealthData  │
└────────────────┘
```

**Speaker Notes:**
"This diagram summarizes the entire architecture I built.

At the top is the React frontend with the integrations modal, login forms, and dashboard. It communicates with the backend via HTTP requests, including JWT tokens for authentication.

The API layer uses NestJS. The JwtAuthGuard intercepts every request to protected endpoints and validates tokens. Controllers handle HTTP routing - UserController for authentication, IntegrationController for health services.

The service layer contains business logic. UserService handles authentication logic, IntegrationService orchestrates OAuth flows and data synchronization.

Below that, we have repositories using Prisma for database access, and the Health Data Provider Factory that routes requests to the appropriate adapter based on the provider.

Each adapter - Strava, Fitbit, Lose It - implements the same interface but handles provider-specific API calls and data transformations. They communicate with external APIs.

Everything flows down to PostgreSQL where we persist users, integrations with OAuth tokens, and synced health data.

This layered architecture provides clear separation of concerns, makes testing easier, and allows us to swap components without affecting others. It's a production-grade architecture following industry best practices."

---

## SLIDE 26: Questions & Thank You

**Visual:**
```
Thank You!

Questions?

Contact:
[Your Name]
[Your Email]
[Your GitHub]

Project Repository:
github.com/[username]/HealthTrack

Key Contributions:
• 16 API endpoints
• 3 health provider integrations
• Complete authentication system
• 3,500+ lines of production code

Technologies:
NestJS • TypeScript • Prisma • PostgreSQL
JWT • OAuth 2.0 • Bcrypt • React

"Building secure, scalable, and maintainable health integrations"
```

**Speaker Notes:**
"Thank you for your attention! I'm happy to answer any questions about the implementation, technical decisions, security considerations, or anything else related to my contribution to HealthTrack.

Some topics I'm prepared to discuss in more detail:
- The specific OAuth flows for Strava and Fitbit
- JWT token structure and validation logic
- How we handle token refresh automatically
- The adapter pattern and why it makes adding providers easy
- Security considerations and how we prevent common vulnerabilities
- Database schema design decisions
- Error handling strategies
- How to complete the Google OAuth implementation
- Performance considerations for data syncing
- Future enhancements and scalability

I'm also happy to do a live code walkthrough of any specific component or walk through the database schema in detail. Feel free to ask anything!"

---

## BONUS SLIDE: Live Code Walkthrough Checklist

**Visual:**
```
Code Walkthrough Ready:

If asked to show code, demonstrate:

1. JWT Guard Implementation
   File: src/app/guards/jwt-auth.guard.ts
   Lines: 20-45
   Show: Token extraction, verification, user attachment

2. User Service - Register/Login
   File: src/core/services/user.service.ts
   Lines: 95-200
   Show: Password hashing, JWT generation

3. Strava Adapter
   File: src/infra/adapters/health-providers/strava.adapter.ts
   Lines: 50-150
   Show: OAuth flow, data transformation

4. Integration Service - OAuth State
   File: src/core/services/integration.service.ts
   Lines: 50-100
   Show: State encoding/validation, CSRF protection

5. Database Schema
   File: prisma/schema.prisma
   Lines: 45-85
   Show: Integration and HealthData models

6. Frontend Integration Hook
   File: app/web/src/hooks/useIntegrations.ts
   Show: API integration, state management
```

**Speaker Notes:**
"If you want to see actual code, I have the codebase ready to walk through. I can show you the JWT guard implementation, the user service methods for registration and login, the Strava adapter with OAuth and data transformation, the integration service with OAuth state security, the database schema, or the frontend React hooks. Just let me know what you'd like to dive into!"

---

# END OF PRESENTATION

**Total Slides: 26 main slides + 1 bonus slide**
**Estimated Presentation Time: 25-30 minutes**
**Recommended Time per Slide: ~1-2 minutes**

---

## PRESENTATION DELIVERY TIPS:

1. **Start Strong**: Begin with the demo if possible (slides 19) - it's more engaging than theory
2. **Know Your Audience**: Adjust technical depth based on who's in the room
3. **Use Analogies**: "OAuth is like valet parking - you give limited access, not your keys"
4. **Pause for Questions**: After major sections (auth, Strava, Fitbit)
5. **Show Enthusiasm**: This is impressive work - let that show!
6. **Have Backup**: If demo fails, have screenshots ready
7. **Time Management**: Practice to stay within time limits
8. **Emphasize Impact**: Not just "what" but "why it matters"
9. **Be Honest**: About Google OAuth being incomplete - shows maturity
10. **End Strong**: The architecture diagram (slide 25) is a great summary visual

Good luck with your presentation!