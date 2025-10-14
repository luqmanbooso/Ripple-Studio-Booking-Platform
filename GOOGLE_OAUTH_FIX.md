# Google OAuth Configuration Guide

## Issue: "The given origin is not allowed for the given client ID"

This error occurs because your Google OAuth client is not configured to allow requests from your current domain.

## Solution:

1. **Go to Google Cloud Console**: https://console.cloud.google.com/

2. **Select your project** (or create one if you haven't)

3. **Navigate to "APIs & Services" > "Credentials"**

4. **Find your OAuth 2.0 Client ID** (it should match `945381860270-...`)

5. **Click the edit button** (pencil icon)

6. **Add authorized origins**:
   - For development: `http://localhost:5173` (or your dev port)
   - For production: `https://yourdomain.com`

7. **Add authorized redirect URIs**:
   - For development: `http://localhost:5173` (or your dev port)
   - For production: `https://yourdomain.com`

8. **Save the changes**

## For Vite Development Server:

If you're using Vite (which you are), make sure your dev server is running on the configured port. The default is 5173.

## Environment Variables:

Make sure your `.env` files have the correct client ID:
- `VITE_GOOGLE_CLIENT_ID=945381860270-h2gp3nhalr1jr9ii49sg3lpcvaqkfsmb.apps.googleusercontent.com`

## Testing:

After updating Google Cloud Console, restart your development server and try Google sign-in again.