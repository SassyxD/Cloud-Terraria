#!/bin/bash
# Deploy Cloud Terraria Web Application to EC2

set -e

echo "=== Cloud Terraria Deployment Script ==="

# Configuration
EC2_IP="34.237.243.145"
EC2_USER="ubuntu"
KEY_FILE="C:/Users/xenon/Downloads/labsuser.pem"  # Update this path
APP_DIR="/opt/terraria-app"

echo "Building production application..."
npm run build

echo "Creating deployment package..."
tar -czf deploy.tar.gz .next package.json package-lock.json public prisma next.config.js

echo "Uploading to EC2..."
scp -i "$KEY_FILE" -o StrictHostKeyChecking=no deploy.tar.gz ${EC2_USER}@${EC2_IP}:/tmp/

echo "Deploying on EC2..."
ssh -i "$KEY_FILE" -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_IP} << 'ENDSSH'
set -e

# Stop service
sudo systemctl stop terraria-app || true

# Extract application
cd /opt/terraria-app
sudo tar -xzf /tmp/deploy.tar.gz
sudo rm /tmp/deploy.tar.gz

# Install dependencies
sudo npm ci --production

# Run Prisma migrations
export DATABASE_URL="${DATABASE_URL}"
sudo npx prisma migrate deploy

# Fix permissions
sudo chown -R root:root /opt/terraria-app

# Restart service
sudo systemctl restart terraria-app
sudo systemctl status terraria-app

echo "Deployment complete!"
ENDSSH

echo ""
echo "✓ Application deployed successfully!"
echo "✓ Access at: http://34.237.243.145"
echo ""
echo "To check logs: ssh -i \"$KEY_FILE\" ${EC2_USER}@${EC2_IP} \"sudo journalctl -u terraria-app -f\""

# Cleanup
rm deploy.tar.gz
