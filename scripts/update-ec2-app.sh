#!/bin/bash
# Update Next.js App on EC2 Instance
# Run this on EC2 when you push new code

set -e

echo "🔄 Updating Terraria Web App..."

cd /var/www/terraria

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin main  # or your branch name

# Install new dependencies
echo "📦 Installing dependencies..."
npm install

# Build app
echo "🔨 Building app..."
npm run build

# Restart PM2
echo "🔄 Restarting app..."
pm2 restart terraria-web

echo "✅ Update complete!"
pm2 status
