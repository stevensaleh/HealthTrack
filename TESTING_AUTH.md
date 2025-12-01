# Testing Authentication Guide

This guide explains how to test both email/password and Google OAuth authentication in HealthTrack.

## Prerequisites

### 1. Backend Setup

Make sure your backend is running and configured:

```bash
cd app/api/healthtrack-backend

# Start PostgreSQL database
docker compose up -d

# Generate Prisma client
npm run prisma:generate

# Run migrations (if needed)
npm run prisma:migrate

# Start backend server
npm run start:dev
```

The backend should be running at `http://localhost:3000`

### 2. Frontend Setup

Make sure your frontend is running:

```bash
cd app/web

# Install dependencies (if needed)
npm install

# Start development server
npm run dev
```

The frontend should be running at `http://localhost:5173` (or the port shown in terminal)

### 3. Environment Variables

#### Backend (`.env` file in `app/api/healthtrack-backend/`)

Required variables:
```env
DATABASE_URL="postgresql://postgres:dev123@localhost:5432/healthtrack?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRATION="7d"
GOOGLE_CLIENT_ID="your-google-client-id"  # Required for Google auth
GOOGLE_CLIENT_SECRET="your-google-client-secret"  # Optional, not used in current implementation
PORT=3000
NODE_ENV="development"
FRONTEND_URL="http://localhost:5173"
```

#### Frontend (`.env` file in `app/web/`)

Required variables:
```env
VITE_API_URL=http://localhost:3000/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id  # Must match backend GOOGLE_CLIENT_ID
```

**Important:** The `GOOGLE_CLIENT_ID` must be the same in both backend and frontend `.env` files.

### 4. Get Google OAuth Client ID

Follow these detailed steps to get your Google OAuth Client ID:

#### Step 1: Go to Google Cloud Console
1. Open your browser and navigate to: [https://console.cloud.google.com/](https://console.cloud.google.com/)
2. Sign in with your Google account (or create one if you don't have it)

#### Step 2: Create or Select a Project
1. At the top of the page, click on the project dropdown (it may show "Select a project" or an existing project name)
2. Click **"NEW PROJECT"** button (or select an existing project if you have one)
3. If creating new:
   - Enter a project name (e.g., "HealthTrack" or "My App")
   - Optionally select an organization
   - Click **"CREATE"**
4. Wait for the project to be created, then select it from the dropdown

#### Step 3: Configure OAuth Consent Screen
1. In the left sidebar, click **"APIs & Services"** → **"OAuth consent screen"**
2. Choose **"External"** user type (unless you have a Google Workspace account, then choose "Internal")
3. Click **"CREATE"**
4. Fill in the required information:
   - **App name**: `HealthTrack` (or your app name)
   - **User support email**: Select your email from dropdown
   - **Developer contact information**: Enter your email address
5. Click **"SAVE AND CONTINUE"**
6. On the "Scopes" page, click **"SAVE AND CONTINUE"** (no need to add scopes for basic sign-in)
7. On the "Test users" page (if in testing mode):
   - Click **"ADD USERS"**
   - Add your Google email address (and any test users)
   - Click **"ADD"**
   - Click **"SAVE AND CONTINUE"**
8. Review and click **"BACK TO DASHBOARD"**

#### Step 4: Create OAuth 2.0 Client ID
1. In the left sidebar, click **"APIs & Services"** → **"Credentials"**
2. At the top, click **"+ CREATE CREDENTIALS"**
3. Select **"OAuth client ID"** from the dropdown
4. If prompted, select **"Web application"** as the application type
5. Fill in the form:
   - **Name**: `HealthTrack Web Client` (or any descriptive name)
   - **Authorized JavaScript origins**: Click **"+ ADD URI"** and add:
     - `http://localhost:5173` (for local development)
     - `http://localhost:3000` (if your frontend runs on different port)
     - Add your production URL when ready (e.g., `https://yourdomain.com`)
   - **Authorized redirect URIs**: Click **"+ ADD URI"** and add:
     - `http://localhost:5173` (for local development)
     - `http://localhost:5173/login` (optional, if you want specific redirect)
     - Add your production URL when ready (e.g., `https://yourdomain.com`)
6. Click **"CREATE"**

#### Step 5: Copy Your Client ID
1. A popup will appear showing your **Client ID** and **Client Secret**
2. **IMPORTANT**: Copy the **Client ID** (it looks like: `123456789-abcdefghijklmnop.apps.googleusercontent.com`)
3. You can also copy the Client Secret if needed (though your current implementation doesn't use it)
4. Click **"OK"** to close the popup
5. You can always view these credentials later by going to **"APIs & Services"** → **"Credentials"**

#### Step 6: Add Client ID to Your Project
1. **Backend `.env` file** (`app/api/healthtrack-backend/.env`):
   ```env
   GOOGLE_CLIENT_ID="your-client-id-here"
   ```
   Replace `your-client-id-here` with the Client ID you copied

2. **Frontend `.env` file** (`app/web/.env`):
   ```env
   VITE_GOOGLE_CLIENT_ID=your-client-id-here
   ```
   Replace `your-client-id-here` with the same Client ID

3. **Important Notes:**
   - Both files must use the **exact same** Client ID
   - No quotes needed in the frontend `.env` file (Vite handles it)
   - Restart both your backend and frontend servers after adding the Client ID

#### Step 7: Verify Setup
1. Restart your backend server:
   ```bash
   cd app/api/healthtrack-backend
   npm run start:dev
   ```

2. Restart your frontend server:
   ```bash
   cd app/web
   npm run dev
   ```

3. Check browser console (F12) when loading the login page - there should be no Google OAuth errors

#### Troubleshooting OAuth Setup

**Issue: "Google OAuth is not configured" error**
- Verify `GOOGLE_CLIENT_ID` is set in backend `.env`
- Restart backend server after adding the variable

**Issue: Google sign-in button doesn't appear or doesn't work**
- Verify `VITE_GOOGLE_CLIENT_ID` is set in frontend `.env`
- Restart frontend server after adding the variable
- Check browser console for errors

**Issue: "Error 400: redirect_uri_mismatch"**
- Go back to Google Cloud Console → Credentials
- Edit your OAuth 2.0 Client ID
- Make sure `http://localhost:5173` (or your exact frontend URL) is in **Authorized redirect URIs**
- The URL must match exactly (including `http://` vs `https://` and port number)

**Issue: "Error 403: access_denied"**
- If your app is in "Testing" mode, you need to add test users
- Go to OAuth consent screen → Test users → Add your email
- Or publish your app (for production use)

**Issue: Can't find "OAuth client ID" option**
- Make sure you've completed the OAuth consent screen setup first
- Try refreshing the page
- Make sure you're in the correct project

---

## Testing Email/Password Authentication

### Test 1: User Registration

1. Navigate to `http://localhost:5173/login`
2. Click "Sign Up" (or toggle to registration mode)
3. Fill in the form:
   - **Name**: `Test User`
   - **Email**: `test@example.com` (use a unique email)
   - **Password**: `password123` (minimum 6 characters)
4. Click "Sign Up"
5. **Expected Result:**
   - Success: Redirects to `/dashboard`
   - User is logged in
   - User data is stored in localStorage
   - Access token is stored in localStorage

### Test 2: User Login

1. Navigate to `http://localhost:5173/login`
2. Make sure you're in "Sign In" mode
3. Fill in the form:
   - **Email**: `test@example.com` (the email you registered with)
   - **Password**: `password123`
4. Click "Sign In"
5. **Expected Result:**
   - Success: Redirects to `/dashboard`
   - User is logged in
   - User data is stored in localStorage

### Test 3: Invalid Credentials

1. Try logging in with:
   - Wrong email: `wrong@example.com`
   - Wrong password: `wrongpassword`
2. **Expected Result:**
   - Error message displayed: "Invalid credentials" or similar
   - User stays on login page
   - No redirect to dashboard

### Test 4: Validation Errors

1. Try submitting the form with:
   - Empty fields
   - Invalid email format
   - Password less than 6 characters
2. **Expected Result:**
   - Form validation prevents submission
   - Error messages displayed

### Test 5: Check Browser Console

Open browser DevTools (F12) and check:
- **Network tab**: Verify API calls to `/api/auth/login` or `/api/auth/register`
- **Console tab**: No errors should appear
- **Application/Storage tab**: 
  - `accessToken` should be in localStorage
  - `refreshToken` should be in localStorage
  - `healthhive_user` should contain user data

---

## Testing Google OAuth Authentication

### Prerequisites for Google Auth

1. **Verify Google Client ID is configured:**
   - Check that `VITE_GOOGLE_CLIENT_ID` is set in frontend `.env`
   - Check that `GOOGLE_CLIENT_ID` is set in backend `.env`
   - Both should have the same value

2. **Verify Google OAuth Provider:**
   - The frontend should wrap the app with `GoogleOAuthProvider`
   - Check browser console for any Google OAuth initialization errors

### Test 1: Google Sign-In (New User)

1. Navigate to `http://localhost:5173/login`
2. Click the "Sign in with Google" button
3. **Expected Result:**
   - Google sign-in popup appears
   - Select a Google account
   - After successful authentication:
     - Popup closes
     - User is redirected to `/dashboard`
     - User is created in database (if first time)
     - User data is stored in localStorage
     - `provider` field should be `"google"`

### Test 2: Google Sign-In (Existing User)

1. If you've already signed in with Google before:
   - Click "Sign in with Google" again
   - Select the same Google account
2. **Expected Result:**
   - Should log in to existing account
   - No duplicate user created
   - Redirects to `/dashboard`

### Test 3: Google Sign-In Error Handling

1. If Google Client ID is missing or incorrect:
   - Click "Sign in with Google"
2. **Expected Result:**
   - Error message: "Google sign-in failed" or similar
   - Check backend logs for: "Google OAuth is not configured"

### Test 4: Check Backend Logs

When testing Google auth, check backend terminal for:
- `verifyGoogleToken` being called
- Token verification success/failure
- User creation or login messages

### Test 5: Verify User in Database

After successful Google sign-in, verify the user was created:

```bash
cd app/api/healthtrack-backend
npm run prisma:studio
```

In Prisma Studio:
- Check `User` table
- Find your user by email
- Verify `provider` field is `"google"`
- Verify `googleId` field is populated

---

## Testing with API Tools (Optional)

You can also test authentication directly using API tools like Postman, curl, or httpie:

### Test Email Registration

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "api-test@example.com",
    "password": "password123",
    "name": "API Test User"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "user": {
    "id": "...",
    "email": "api-test@example.com",
    "name": "API Test User",
    "provider": "email"
  },
  "accessToken": "...",
  "refreshToken": "..."
}
```

### Test Email Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "api-test@example.com",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "user": {
    "id": "...",
    "email": "api-test@example.com",
    "provider": "email"
  },
  "accessToken": "...",
  "refreshToken": "..."
}
```

### Test Google Auth (Requires Valid Token)

Note: This requires a valid Google ID token, which is typically obtained from the frontend Google OAuth flow.

```bash
curl -X POST http://localhost:3000/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{
    "credential": "YOUR_GOOGLE_ID_TOKEN_HERE"
  }'
```

---

## Troubleshooting

### Email Auth Not Working

1. **Check backend is running:**
   ```bash
   curl http://localhost:3000/api/auth/login
   # Should return an error (method not allowed), not connection refused
   ```

2. **Check database connection:**
   - Verify PostgreSQL is running: `docker compose ps`
   - Check backend logs for database connection errors

3. **Check environment variables:**
   - Verify `DATABASE_URL` is correct
   - Verify `JWT_SECRET` is set

4. **Check API URL:**
   - Verify `VITE_API_URL` in frontend `.env` matches backend URL
   - Default should be `http://localhost:3000/api`

### Google Auth Not Working

1. **Check Google Client ID:**
   - Verify it's set in both frontend and backend `.env` files
   - Verify they match exactly
   - Restart both servers after changing `.env` files

2. **Check Google OAuth Configuration:**
   - Verify authorized origins in Google Cloud Console include `http://localhost:5173`
   - Verify redirect URIs are configured

3. **Check Browser Console:**
   - Look for Google OAuth initialization errors
   - Check for CORS errors

4. **Check Backend Logs:**
   - Look for "Google OAuth is not configured" errors
   - Check for token verification errors

5. **Test Google Client ID:**
   - Visit `https://accounts.google.com` to verify your Google account works
   - Try a different browser or incognito mode

### Common Issues

1. **CORS Errors:**
   - Verify `FRONTEND_URL` in backend `.env` matches your frontend URL
   - Check backend CORS configuration in `main.ts`

2. **Token Not Stored:**
   - Check browser localStorage is enabled
   - Check for JavaScript errors in console
   - Verify `AuthContext` is working correctly

3. **Redirect Not Working:**
   - Check React Router is configured correctly
   - Verify routes in `App.tsx`
   - Check for navigation errors in console

---

## Success Criteria Checklist

### Email Authentication ✅
- [ ] Can register a new user
- [ ] Can login with registered credentials
- [ ] Invalid credentials show error
- [ ] Form validation works
- [ ] User data stored in localStorage
- [ ] Tokens stored in localStorage
- [ ] Redirects to dashboard on success
- [ ] User appears in database

### Google Authentication ✅
- [ ] Google sign-in button appears
- [ ] Google popup opens when clicked
- [ ] Can select Google account
- [ ] Successfully authenticates
- [ ] Creates user in database (first time)
- [ ] Logs in existing user (subsequent times)
- [ ] User data stored in localStorage
- [ ] Tokens stored in localStorage
- [ ] Redirects to dashboard on success
- [ ] `provider` field is `"google"` in database

---

## Next Steps

After verifying authentication works:

1. Test protected routes (dashboard should require authentication)
2. Test token refresh (if implemented)
3. Test logout functionality
4. Test session persistence (refresh page, should stay logged in)
5. Test multiple users (register/login with different accounts)

