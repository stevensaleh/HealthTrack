# Authentication Setup Guide

This guide will help you set up authentication for the HealthTrack application, including Google Sign-In.

## Features Implemented

✅ Login page with email/password authentication  
✅ User registration  
✅ Google OAuth sign-in  
✅ Protected routes  
✅ User session management  
✅ Logout functionality  

## Setting Up Google OAuth

To enable Google Sign-In functionality, follow these steps:

### 1. Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "New Project"
4. Enter a project name (e.g., "HealthTrack")
5. Click "Create"

### 2. Enable Google+ API

1. In your project, go to "APIs & Services" > "Library"
2. Search for "Google+ API" or "Google Identity Services API"
3. Click on it and press "Enable"

### 3. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - Choose "External" user type (unless you have a Google Workspace)
   - Fill in the required information (App name, user support email, developer contact)
   - Click "Save and Continue"
   - Add scopes: `email`, `profile`, `openid`
   - Add test users if needed
4. Create OAuth Client ID:
   - Application type: "Web application"
   - Name: "HealthTrack Web Client"
   - Authorized JavaScript origins:
     - `http://localhost:5173` (for Vite dev server)
     - Add your production URL when deploying
   - Authorized redirect URIs: (leave empty for now)
   - Click "Create"
5. **Copy the Client ID** (you'll need this)

### 4. Configure Environment Variables

1. Create a `.env` file in the project root:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and add your Google Client ID:
   ```
   VITE_GOOGLE_CLIENT_ID=your_actual_client_id_here
   ```

3. **Important**: Never commit the `.env` file to git (it's already in `.gitignore`)

### 5. Restart Development Server

After adding the `.env` file, restart your development server:
```bash
npm run dev
```

## Testing Authentication

### Email/Password Authentication

1. Navigate to `/login`
2. Fill in email and password
3. Click "Sign In" or "Sign Up"
4. Currently uses mock authentication (you'll need to connect to a backend API)

### Google Sign-In

1. Navigate to `/login`
2. Click the "Sign in with Google" button
3. Select your Google account
4. Grant permissions
5. You should be redirected to the home page

## Next Steps for Production

### Backend Integration

The current implementation uses mock authentication. For production, you'll need to:

1. **Create a backend API** with endpoints for:
   - `POST /api/auth/login` - Email/password login
   - `POST /api/auth/register` - User registration
   - `POST /api/auth/google` - Verify Google token

2. **Update `AuthContext.jsx`** to make actual API calls:
   - Replace mock functions in `login()`, `register()`, and `loginWithGoogle()`
   - Add error handling for network requests
   - Implement JWT token storage and refresh logic

3. **Add password hashing** on the backend (use bcrypt or similar)

4. **Set up a database** to store user information:
   - User ID
   - Email
   - Hashed password (for email/password users)
   - OAuth provider info
   - Other user profile data

### Security Considerations

- Always use HTTPS in production
- Implement CSRF protection
- Use secure, httpOnly cookies for tokens
- Implement rate limiting on login endpoints
- Add email verification for new registrations
- Consider adding two-factor authentication

## File Structure

```
src/
├── components/
│   ├── Login.jsx          # Login/Registration component
│   ├── Login.css          # Login component styles
│   └── ProtectedRoute.jsx # Route protection component
├── context/
│   └── AuthContext.jsx    # Authentication context and logic
└── Home.jsx               # Protected home page
```

## Troubleshooting

### Google Sign-In Button Not Appearing

- Check that your Google Client ID is correctly set in `.env`
- Make sure the `.env` file is in the root directory
- Restart the development server after creating/editing `.env`
- Check browser console for errors

### Authentication Not Persisting

- Check that `localStorage` is enabled in your browser
- Clear browser cache and try again
- Check browser console for errors

### Redirect Issues

- Ensure you've added the correct authorized origins in Google Cloud Console
- Make sure the redirect URI matches your development URL

## Questions?

If you encounter any issues, check:
- Browser console for errors
- Network tab for failed API requests
- Google Cloud Console for OAuth configuration

