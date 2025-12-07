# Live Demo Script for HealthTrack Presentation

## Pre-Demo Setup Checklist

**Before presentation:**
- [ ] Backend running on `http://localhost:3000`
- [ ] Frontend running on `http://localhost:5173`
- [ ] Database is running and migrated
- [ ] Have a test Strava account ready
- [ ] Have a test Fitbit account ready (optional)
- [ ] Clear browser cache/use incognito for clean demo
- [ ] Have database viewer ready (Prisma Studio or pgAdmin)
- [ ] Postman/Insomnia ready for API testing (backup if frontend fails)

---

## Demo Flow (8-10 minutes)

### Part 1: Authentication Demo (2-3 minutes)

#### 1.1 User Registration
```
Action: Navigate to http://localhost:5173/register
Steps:
1. Enter email: demo@healthtrack.com
2. Enter weak password: "test123"
   → Show validation error: "Password must contain uppercase"
3. Enter strong password: "Test123456"
4. Enter first name: "Demo"
5. Enter last name: "User"
6. Click "Register"
   → Success! Redirected to dashboard
   → JWT token stored in localStorage

Speaking points:
- "Notice the password validation in real-time"
- "The backend enforces these rules with bcrypt hashing"
- "Upon success, we receive a JWT token valid for 24 hours"
```

#### 1.2 Show JWT Token
```
Action: Open browser DevTools → Application → localStorage
Steps:
1. Show the JWT token stored as "auth_token"
2. Copy token
3. Decode at jwt.io (optional - if internet available)
   → Show payload: { id, email, firstName, lastName, exp }

Speaking points:
- "This token contains user info and expiration"
- "Every protected request includes this in the Authorization header"
- "The backend verifies the signature on each request"
```

#### 1.3 Protected Endpoint Test
```
Action: Open Network tab or Postman
Steps:
1. Make GET request to /users/me WITHOUT token
   → 401 Unauthorized
2. Make GET request to /users/me WITH Bearer token
   → 200 Success, returns user profile

Speaking points:
- "Without the token, the JwtAuthGuard blocks access"
- "With valid token, we get the user profile"
- "This is how all protected endpoints work"
```

---

### Part 2: Strava Integration Demo (4-5 minutes)

#### 2.1 Initiate Connection
```
Action: Navigate to Integrations page
Steps:
1. Click "Integrations" or "Settings" in nav
2. Show the three provider cards: Strava, Fitbit, Lose It
3. Point out Strava shows "Not Connected"
4. Click "Connect Strava"

Speaking points:
- "The frontend calls POST /integrations/connect"
- "Backend generates OAuth URL with encoded state"
- "We're now redirecting to Strava's authorization page"
```

#### 2.2 Strava OAuth Flow
```
Action: On Strava authorization page
Steps:
1. Login to Strava (if not already logged in)
   → Use your test account
2. Show the permissions requested:
   - "View data about your activities"
   - "View your profile information"
3. Click "Authorize"
   → Redirected back to http://localhost:5173/integrations/callback

Speaking points:
- "Strava shows exactly what data we're requesting"
- "Users explicitly approve this access"
- "This is OAuth 2.0 standard authorization flow"
```

#### 2.3 Callback Handling
```
Action: Watch the redirect
Steps:
1. Notice URL contains: ?code=XXX&state=YYY
2. Frontend captures these
3. Makes GET request to /integrations/callback
4. Backend:
   - Validates state (CSRF protection)
   - Exchanges code for tokens
   - Saves integration to database
   - Triggers initial sync
5. Redirected to integrations page
6. Strava card now shows "Connected ✓"
7. Shows "Last synced: just now"

Speaking points:
- "The state parameter prevents CSRF attacks"
- "Backend exchanges the temporary code for access + refresh tokens"
- "Tokens are encrypted and stored in database"
- "Initial sync happens automatically"
```

#### 2.4 Database View (Optional but impressive)
```
Action: Open Prisma Studio or pgAdmin
Steps:
1. Show Integration table
2. Point out the new record:
   - userId matches our demo user
   - provider = "STRAVA"
   - accessToken (encrypted)
   - refreshToken (encrypted)
   - expiresAt timestamp
   - status = "ACTIVE"
   - lastSyncedAt timestamp

Speaking points:
- "Here's the integration record in PostgreSQL"
- "Tokens are stored securely"
- "We track expiration for automatic refresh"
- "Status tracking helps with error handling"
```

---

### Part 3: Data Sync Demo (2-3 minutes)

#### 3.1 View Initial Synced Data
```
Action: Navigate to Dashboard
Steps:
1. Show the health data chart/table
2. Point out entries with "source: STRAVA" tag
3. Show specific metrics:
   - Exercise minutes
   - Calories burned
   - Distance
   - Heart rate (if available)
4. Point out the date range

Speaking points:
- "This data came directly from Strava API"
- "No manual entry required"
- "The adapter transformed Strava activities into our unified format"
- "Users can see data from multiple sources in one place"
```

#### 3.2 Manual Sync
```
Action: Go back to Integrations page
Steps:
1. Click "Sync Now" on Strava card
2. Show loading indicator
3. Wait for completion
4. Show updated "Last synced: just now" timestamp
5. Go back to Dashboard
6. Show any new data (if you did activities since last sync)

Speaking points:
- "Users can manually trigger sync anytime"
- "Backend checks token expiration first"
- "Refreshes token if needed (transparent to user)"
- "Fetches latest activities from Strava"
- "Transforms and saves to database"
```

#### 3.3 Database - HealthData Records
```
Action: Database viewer
Steps:
1. Show HealthData table
2. Filter by userId = demo user
3. Show records with source = "STRAVA"
4. Point out the metrics:
   - date
   - steps (if available)
   - caloriesBurned
   - exerciseMinutes
   - distance
   - heartRate
5. Show the unique constraint prevents duplicates

Speaking points:
- "Each day's data is a separate record"
- "The source field tags where it came from"
- "Unified schema works for all providers"
- "Duplicates are prevented by database constraints"
```

---

### Part 4: Fitbit Demo (Optional - 2 minutes)

#### 4.1 Connect Fitbit (If time permits)
```
Action: Integrations page
Steps:
1. Click "Connect Fitbit"
2. OAuth flow similar to Strava
3. Show broader permission scopes:
   - Activity
   - Heart Rate
   - Sleep
   - Weight
   - Nutrition
4. Authorize and return
5. Show both Strava and Fitbit connected

Speaking points:
- "Fitbit requests more scopes because it tracks more data types"
- "Same OAuth flow, different provider"
- "The adapter pattern makes this consistent"
```

#### 4.2 Show Multi-Provider Data
```
Action: Dashboard
Steps:
1. Show data entries from both providers
2. Point out:
   - Some days have Strava data (exercise focus)
   - Some days have Fitbit data (steps, sleep, weight)
   - Users get comprehensive view
3. Show how charts aggregate across sources

Speaking points:
- "Users can connect multiple providers"
- "Each tracks different aspects of health"
- "Our unified model combines them seamlessly"
- "Charts show aggregate data regardless of source"
```

---

### Part 5: Disconnect Demo (1 minute)

#### 5.1 Disconnect Integration
```
Action: Integrations page
Steps:
1. Click "Disconnect" on Strava card
2. Confirm modal appears
3. Click "Yes, Disconnect"
4. Backend:
   - Calls Strava revoke token API
   - Updates status to "REVOKED"
   - Marks isActive = false
5. Card returns to "Not Connected" state

Speaking points:
- "Disconnecting properly revokes tokens with the provider"
- "User's data in our database remains (privacy consideration)"
- "They can reconnect anytime without losing historical data"
- "This is proper OAuth lifecycle management"
```

---

## API Testing Demo (Backup if Frontend Fails)

**If frontend has issues, use Postman/Insomnia:**

### Register
```http
POST http://localhost:3000/users/register
Content-Type: application/json

{
  "email": "demo@healthtrack.com",
  "password": "Test123456",
  "firstName": "Demo",
  "lastName": "User"
}

Response: { "accessToken": "eyJhbGc...", "user": {...} }
```

### Login
```http
POST http://localhost:3000/users/login
Content-Type: application/json

{
  "email": "demo@healthtrack.com",
  "password": "Test123456"
}

Response: { "accessToken": "eyJhbGc...", "user": {...} }
```

### Get Profile (Protected)
```http
GET http://localhost:3000/users/me
Authorization: Bearer eyJhbGc...

Response: { "id": "...", "email": "...", ... }
```

### Initiate Connection
```http
POST http://localhost:3000/integrations/connect
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "provider": "STRAVA",
  "redirectUri": "http://localhost:5173/integrations/callback"
}

Response: { "authUrl": "https://www.strava.com/oauth/authorize?..." }
```

### List Integrations
```http
GET http://localhost:3000/integrations
Authorization: Bearer eyJhbGc...

Response: [
  {
    "id": "...",
    "provider": "STRAVA",
    "isActive": true,
    "lastSyncedAt": "2025-12-07T...",
    "status": "ACTIVE"
  }
]
```

### Sync Integration
```http
POST http://localhost:3000/integrations/{id}/sync
Authorization: Bearer eyJhbGc...

Response: { "message": "Sync completed", "recordsSynced": 15 }
```

---

## Troubleshooting Quick Fixes

### Backend not responding
```bash
cd app/api/healthtrack-backend
npm run start:dev
# Check .env has DATABASE_URL and JWT_SECRET
```

### Frontend not loading
```bash
cd app/web
npm run dev
# Check it's running on port 5173
```

### Database connection error
```bash
# Check PostgreSQL is running
docker ps
# Or
sudo systemctl status postgresql

# Run migrations
cd app/api/healthtrack-backend
npx prisma migrate dev
```

### OAuth callback fails
- Check Strava/Fitbit app settings have correct callback URL
- Verify environment variables: STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET
- Check state parameter hasn't expired (10 min limit)

### Token validation fails
- Check JWT_SECRET in .env matches what was used to sign tokens
- Verify token hasn't expired (24hr limit)
- Check Authorization header format: "Bearer <token>"

---

## Demo Tips

1. **Practice First**: Run through the entire demo 2-3 times before presentation
2. **Have Fallbacks**: If Strava OAuth fails, show Postman requests
3. **Slow Down**: People need time to see what's happening
4. **Narrate Actions**: Say what you're doing as you do it
5. **Point with Cursor**: Highlight important UI elements
6. **Zoom In**: Make sure text is readable (Ctrl/Cmd + +)
7. **Hide Unnecessary Tabs**: Clean browser for clarity
8. **Use Incognito**: Avoids cache issues and autofill
9. **Have Screenshots**: Backup if live demo fails completely
10. **Time Yourself**: 8-10 minutes max, leave time for questions

---

## Key Things to Point Out During Demo

**Security:**
- Password validation
- JWT token in requests
- 401 errors without token
- OAuth state parameter
- Token encryption in database

**Architecture:**
- Frontend → Backend → Database flow
- API endpoints called
- Database tables updated
- Provider adapters working

**User Experience:**
- Clean, simple UI
- Clear connection status
- One-click sync
- Data visualization
- Multi-provider support

**Error Handling:**
- Validation errors show clearly
- Auth errors are caught
- Sync errors are reported
- Rate limits handled

---

## Post-Demo Talking Points

After showing the demo, transition to:

1. **Code Walkthrough** (if requested)
   - "Let me show you the actual implementation..."
   - Open specific files mentioned earlier

2. **Architecture Explanation**
   - Reference the architecture diagram slide
   - "Here's how all these pieces fit together..."

3. **Challenges Solved**
   - "Building this wasn't trivial - let me share some challenges..."
   - Reference challenges slide

4. **Future Enhancements**
   - "This foundation enables several future features..."
   - Reference future enhancements slide

Good luck with the demo!