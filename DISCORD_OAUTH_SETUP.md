# Discord OAuth Setup Guide

## Error: invalid_client

This error occurs when Discord OAuth credentials are incorrect or expired.

## Quick Fix Steps

### 1. Go to Discord Developer Portal

Visit: https://discord.com/developers/applications

### 2. Create or Select Your Application

- If you don't have an application, click "New Application"
- Give it a name (e.g., "Cloud Terraria")
- Click "Create"

### 3. Get OAuth Credentials

1. Go to **OAuth2** section in the left sidebar
2. Copy your **Client ID**
3. Click "Reset Secret" to generate a new **Client Secret**
4. Copy the new secret immediately (you won't see it again!)

### 4. Configure Redirect URIs

In the OAuth2 page, add these redirect URIs:

```
http://localhost:3000/api/auth/callback/discord
http://127.0.0.1:3000/api/auth/callback/discord
```

Click "Save Changes"

### 5. Update Your .env File

Replace the values in your `.env` file:

```bash
# Discord OAuth Application
AUTH_DISCORD_ID="YOUR_CLIENT_ID_HERE"
AUTH_DISCORD_SECRET="YOUR_CLIENT_SECRET_HERE"
```

### 6. Restart Development Server

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

## Alternative: Use Mock Authentication

If you just want to test without Discord OAuth, we can set up a development-only authentication bypass.

Create a `.env.local` file:

```bash
# Development mode - skip real authentication
SKIP_AUTH=true
```

Then update the auth configuration to allow local development mode.

## Testing

After updating credentials:

1. Clear your browser cache/cookies
2. Go to http://localhost:3000
3. Click "Sign In"
4. You should be redirected to Discord
5. Authorize the app
6. You'll be redirected back to your app

## Troubleshooting

### "invalid_client" error persists

- Double-check Client ID and Secret match exactly
- Ensure redirect URI is correct (no trailing slash)
- Make sure you saved changes in Discord Developer Portal

### "redirect_uri_mismatch" error

- Add the exact URL to your Discord OAuth redirect URIs
- Check for http vs https
- Check for trailing slashes

### Still not working?

Try creating a completely new Discord application and use those credentials.

## Need Help?

Check the auth configuration in:
- `src/server/auth/config.ts`
- `src/server/auth/index.ts`
