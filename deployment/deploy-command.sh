#!/bin/bash
set -e
echo 'Downloading application from S3...'
aws s3 cp s3://cloud-terraria-deployment-4680/deploy-app.tar.gz /tmp/deploy-app.tar.gz --region us-east-1

echo 'Extracting application...'
cd /opt/terraria-app
tar -xzf /tmp/deploy-app.tar.gz
rm /tmp/deploy-app.tar.gz

echo 'Installing dependencies...'
npm ci --omit=dev

echo 'Generating Prisma Client...'
npx prisma generate

echo 'Starting service...'
systemctl restart terraria-app
systemctl enable terraria-app

echo 'Checking status...'
sleep 3
systemctl status terraria-app --no-pager

echo 'Deployment complete!'
