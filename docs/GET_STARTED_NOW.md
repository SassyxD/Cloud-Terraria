# 🚀 Quick Start - Get Your App Running NOW!

## ⚡ Option 1: Fix Discord OAuth (Recommended - 5 minutes)

### Step 1: Go to Discord Developer Portal
Open: **https://discord.com/developers/applications**

### Step 2: Create New Application
1. Click **"New Application"** button (top right)
2. Name it: `Cloud Terraria` (or any name you like)
3. Click **"Create"**

### Step 3: Get Your Credentials
1. You'll see **"CLIENT ID"** on the main page
   - Copy this ID

2. Go to **"OAuth2"** in the left sidebar
3. Click **"Reset Secret"** button
   - Click **"Yes, do it!"**
   - Copy the new secret **immediately** (you can't see it again!)

### Step 4: Add Redirect URI
Still in the **OAuth2** page:

1. Scroll down to **"Redirects"**
2. Click **"Add Redirect"**
3. Enter: `http://localhost:3000/api/auth/callback/discord`
4. Click **"Add Another"**
5. Enter: `http://127.0.0.1:3000/api/auth/callback/discord`
6. Click **"Save Changes"** at the bottom

### Step 5: Update .env File

Open `d:\terraria\.env` and replace:

```env
AUTH_DISCORD_ID="YOUR_DISCORD_CLIENT_ID"
AUTH_DISCORD_SECRET="YOUR_DISCORD_CLIENT_SECRET"
```

With your actual values:

```env
AUTH_DISCORD_ID="1234567890123456789"
AUTH_DISCORD_SECRET="ABC123_your_actual_secret_here"
```

### Step 6: Restart Server

```bash
# Stop current server (Ctrl+C in terminal)
npm run dev
```

### Step 7: Test!
1. Go to http://localhost:3000
2. Click "Sign In"
3. You'll be redirected to Discord
4. Click "Authorize"
5. Done! ✅

---

## 🎮 Option 2: AWS Lambda Setup (For Real Server Creation)

If you also want to create real Terraria servers on AWS:

### Prerequisites
- AWS Account (free tier works!)
- AWS CLI installed and configured

### Quick Deploy

```bash
# Using script
cd infra/cloudformation
aws cloudformation create-stack \
  --stack-name terraria-lambda \
  --template-body file://lambda.yaml \
  --capabilities CAPABILITY_NAMED_IAM
```

Wait 2-3 minutes, then get the Lambda function name:

```bash
aws cloudformation describe-stacks \
  --stack-name terraria-lambda \
  --query 'Stacks[0].Outputs[?OutputKey==`LambdaFunctionName`].OutputValue' \
  --output text
```

### Update .env

Add to your `.env`:

```env
AWS_REGION="ap-southeast-1"
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_LAMBDA_FUNCTION_NAME="production-terraria-server-manager"
```

### Restart and Test

```bash
npm run dev
```

Now when you create a server, it will create a real EC2 instance! 🎉

---

## 📝 Current Status

### ✅ Working Right Now (Mock Mode)
- Discord Authentication (after fixing credentials)
- Create/List/Start/Stop/Delete Servers
- UI fully functional
- Mock IP addresses for testing
- Database persistence

### 🔄 Needs AWS Setup (Optional)
- Real EC2 instances
- Real Public IP addresses
- Actual Terraria server running

---

## 🆘 Troubleshooting

### "invalid_client" error
- Double-check your Discord Client ID and Secret
- Make sure you saved changes in Discord Developer Portal
- Try creating a brand new Discord application

### "redirect_uri_mismatch" error  
- Add redirect URIs in Discord OAuth settings
- Check for typos (http not https for localhost)
- No trailing slashes in URLs

### Server won't start
- Check if port 3000 is already in use
- Try: `npm run dev` again
- Clear browser cache/cookies

---

## 💡 Tips

### Development Mode
Currently using **Mock Mode** - perfect for testing UI without AWS costs!

### When to Use Real AWS
- When you need actual playable Terraria servers
- For production deployment
- To test full AWS integration

### Cost Estimation
- **Mock Mode**: FREE (uses SQLite locally)
- **With AWS**: ~$0.50/hour when server is running (t2.medium EC2)
- **With RDS**: Additional ~$15/month for database

---

## 🎯 What Works Right Now

1. ✅ Beautiful UI
2. ✅ Discord Login
3. ✅ Server Management Dashboard
4. ✅ Create/Delete Servers
5. ✅ Mock IP Display
6. ✅ Database Storage
7. ✅ Session Management

All you need is to fix Discord OAuth (5 minutes!) and you're ready to go! 🚀
