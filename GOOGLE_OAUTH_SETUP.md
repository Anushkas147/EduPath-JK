# Google OAuth Setup Guide

Your EduPath J&K application now uses Gmail-only authentication. Follow these steps to set up Google OAuth:

## 1. Create Google OAuth Credentials

1. **Go to Google Cloud Console**
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Sign in with your Google account

2. **Create or Select a Project**
   - Click "Select a project" → "New Project"
   - Enter project name: "EduPath J&K"
   - Click "Create"

3. **Enable Google+ API**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Name: "EduPath J&K Web Client"

5. **Configure Authorized Domains**
   - **Authorized JavaScript origins:**
     - `http://localhost:5000` (for development)
     - `https://your-domain.com` (for production)
   - **Authorized redirect URIs:**
     - `http://localhost:5000` (for development)
     - `https://your-domain.com` (for production)

6. **Copy Client ID**
   - Copy the "Client ID" (starts with numbers and ends with `.apps.googleusercontent.com`)

## 2. Configure Environment Variables

### For Development (Replit):
1. Go to your Replit project
2. Click on "Secrets" tab (lock icon)
3. Add these secrets:
   ```
   VITE_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
   GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
   JWT_SECRET=your-super-secret-jwt-key-here
   ```

### For Vercel Deployment:
1. Go to your Vercel project dashboard
2. Click "Settings" → "Environment Variables"
3. Add:
   ```
   VITE_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
   GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
   JWT_SECRET=your-super-secret-jwt-key-here
   ```

## 3. Update Authorized Domains

When deploying to production:
1. Add your production domain to Google OAuth configuration
2. Update authorized JavaScript origins and redirect URIs
3. Example production domains:
   - `https://your-app.vercel.app`
   - `https://your-custom-domain.com`

## 4. Test Authentication

1. **Development Testing:**
   - Start your development server
   - Go to `/login`
   - Click "Continue with Gmail"
   - Only Gmail accounts (@gmail.com) will be accepted

2. **Production Testing:**
   - Deploy to Vercel
   - Test with different Gmail accounts
   - Verify logout functionality works

## Features

✅ **Gmail-Only Authentication** - Only @gmail.com addresses allowed
✅ **Secure JWT Tokens** - HTTP-only cookies for security
✅ **Automatic Registration** - Users auto-registered on first login
✅ **Profile Information** - Name and profile picture from Google
✅ **Vercel Compatible** - Ready for serverless deployment

## Troubleshooting

### "Error 400: redirect_uri_mismatch"
- Check authorized redirect URIs in Google Console
- Ensure your domain is correctly configured

### "Google Sign-In button not loading"
- Check VITE_GOOGLE_CLIENT_ID is set correctly
- Verify internet connection for Google APIs

### "Invalid Google token"
- Check GOOGLE_CLIENT_ID matches VITE_GOOGLE_CLIENT_ID
- Verify client ID is correctly copied from Google Console

### "Only Gmail addresses are allowed"
- This is intentional - the app only accepts @gmail.com accounts
- Users with other email providers cannot register

## Security Notes

- Client ID is safe to expose (it's public by design)
- JWT_SECRET should be kept private and secure
- Never commit real credentials to version control
- Use different client IDs for development and production if needed