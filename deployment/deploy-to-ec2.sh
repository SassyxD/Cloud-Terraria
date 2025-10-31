#!/bin/bash
set -e

EC2_IP=$1
if [ -z "$EC2_IP" ]; then
  echo "Usage: ./deploy-to-ec2.sh <EC2_IP_ADDRESS>"
  exit 1
fi

echo "=== Deploying to EC2: $EC2_IP ==="

# Create deployment package
echo "Step 1: Creating deployment package..."
tar -czf deploy-app.tar.gz \
  .next \
  package.json \
  package-lock.json \
  public \
  prisma \
  next.config.js \
  postcss.config.js \
  src

# Upload to S3
echo "Step 2: Uploading to S3..."
aws s3 cp deploy-app.tar.gz s3://cloud-terraria-deployment-4680/ --region us-east-1

# Deploy via SSM (no SSH needed)
echo "Step 3: Deploying on EC2 via SSM..."
INSTANCE_ID=$(aws ec2 describe-instances \
  --filters "Name=ip-address,Values=$EC2_IP" "Name=instance-state-name,Values=running" \
  --query "Reservations[0].Instances[0].InstanceId" \
  --output text \
  --region us-east-1)

echo "Instance ID: $INSTANCE_ID"

# Send deployment command
COMMAND_ID=$(aws ssm send-command \
  --instance-ids "$INSTANCE_ID" \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=[
    "cd /opt/terraria-app",
    "aws s3 cp s3://cloud-terraria-deployment-4680/deploy-app.tar.gz /tmp/",
    "tar -xzf /tmp/deploy-app.tar.gz -C /opt/terraria-app",
    "npm ci --omit=dev",
    "npx prisma generate",
    "npx prisma db push --skip-generate",
    "systemctl restart terraria-app",
    "systemctl status terraria-app"
  ]' \
  --region us-east-1 \
  --query "Command.CommandId" \
  --output text)

echo "Command ID: $COMMAND_ID"
echo "Waiting for deployment to complete..."

# Wait for command to complete
aws ssm wait command-executed \
  --command-id "$COMMAND_ID" \
  --instance-id "$INSTANCE_ID" \
  --region us-east-1

echo ""
echo "=== Deployment Complete! ==="
echo "Web URL: http://$EC2_IP"
echo ""
