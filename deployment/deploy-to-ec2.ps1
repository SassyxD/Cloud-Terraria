param(
    [Parameter(Mandatory=$true)]
    [string]$EC2_IP
)

$ErrorActionPreference = "Stop"
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

Write-Host "`n=== Deploying to EC2: $EC2_IP ===" -ForegroundColor Cyan

# Step 1: Build app
Write-Host "`nStep 1: Building application..." -ForegroundColor Yellow
npm run build

# Step 2: Create deployment package
Write-Host "`nStep 2: Creating deployment package..." -ForegroundColor Yellow
if (Test-Path "deploy-app.tar.gz") { Remove-Item "deploy-app.tar.gz" -Force }
tar -czf deploy-app.tar.gz .next package.json package-lock.json public prisma next.config.js postcss.config.js src

# Step 3: Upload to S3
Write-Host "`nStep 3: Uploading to S3..." -ForegroundColor Yellow
aws s3 cp deploy-app.tar.gz s3://cloud-terraria-deployment-4680/ --region us-east-1

# Step 4: Get Instance ID
Write-Host "`nStep 4: Getting Instance ID..." -ForegroundColor Yellow
$INSTANCE_ID = aws ec2 describe-instances `
  --filters "Name=ip-address,Values=$EC2_IP" "Name=instance-state-name,Values=running" `
  --query "Reservations[0].Instances[0].InstanceId" `
  --output text `
  --region us-east-1

Write-Host "Instance ID: $INSTANCE_ID" -ForegroundColor Green

# Step 5: Deploy via SSM
Write-Host "`nStep 5: Deploying on EC2 via SSM..." -ForegroundColor Yellow

$DEPLOY_SCRIPT = @"
cd /opt/terraria-app
aws s3 cp s3://cloud-terraria-deployment-4680/deploy-app.tar.gz /tmp/
tar -xzf /tmp/deploy-app.tar.gz -C /opt/terraria-app
npm ci --omit=dev
npx prisma generate
npx prisma db push --skip-generate
systemctl restart terraria-app
sleep 3
systemctl status terraria-app --no-pager
"@

# Save script to file
$DEPLOY_SCRIPT | Out-File -FilePath "deploy-script.sh" -Encoding ASCII -NoNewline

# Upload script to S3
aws s3 cp deploy-script.sh s3://cloud-terraria-deployment-4680/ --region us-east-1

# Execute via SSM
$COMMAND_ID = aws ssm send-command `
  --instance-ids $INSTANCE_ID `
  --document-name "AWS-RunShellScript" `
  --parameters "commands=['cd /tmp && aws s3 cp s3://cloud-terraria-deployment-4680/deploy-script.sh . && chmod +x deploy-script.sh && ./deploy-script.sh']" `
  --region us-east-1 `
  --query "Command.CommandId" `
  --output text

Write-Host "Command ID: $COMMAND_ID" -ForegroundColor Green
Write-Host "Waiting for deployment..." -ForegroundColor Yellow

# Wait and show output
Start-Sleep -Seconds 10

$OUTPUT = aws ssm get-command-invocation `
  --command-id $COMMAND_ID `
  --instance-id $INSTANCE_ID `
  --region us-east-1 `
  --query "StandardOutputContent" `
  --output text

Write-Host "`n=== Deployment Output ===" -ForegroundColor Cyan
Write-Host $OUTPUT

Write-Host "`n=== Deployment Complete! ===" -ForegroundColor Green
Write-Host "Web URL: http://$EC2_IP" -ForegroundColor Yellow
