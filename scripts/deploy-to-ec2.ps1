# Deploy Cloud Terraria Web Application to EC2
# PowerShell version

param(
    [string]$KeyFile = "C:\Users\xenon\Downloads\labsuser.pem",
    [string]$EC2IP = "34.237.243.145"
)

$ErrorActionPreference = "Stop"

Write-Host "`n=== Cloud Terraria Deployment Script ===" -ForegroundColor Cyan

# Configuration
$EC2User = "ubuntu"
$AppDir = "/opt/terraria-app"

Write-Host "Building production application..." -ForegroundColor Yellow
npm run build

Write-Host "Creating deployment package..." -ForegroundColor Yellow
if (Test-Path deploy.tar.gz) { Remove-Item deploy.tar.gz }
tar -czf deploy.tar.gz .next package.json package-lock.json public prisma next.config.js postcss.config.js tailwind.config.ts tsconfig.json src

Write-Host "Uploading to EC2 ($EC2IP)..." -ForegroundColor Yellow
scp -i $KeyFile -o StrictHostKeyChecking=no deploy.tar.gz ${EC2User}@${EC2IP}:/tmp/

Write-Host "Deploying on EC2..." -ForegroundColor Yellow
$DeployScript = @"
set -e
echo 'Stopping service...'
sudo systemctl stop terraria-app || true

echo 'Extracting application...'
cd /opt/terraria-app
sudo rm -rf .next node_modules package-lock.json
sudo tar -xzf /tmp/deploy.tar.gz
sudo rm /tmp/deploy.tar.gz

echo 'Installing dependencies...'
sudo npm ci --omit=dev

echo 'Running Prisma migrations...'
sudo npx prisma generate
sudo npx prisma migrate deploy || echo 'Migration failed or no migrations pending'

echo 'Fixing permissions...'
sudo chown -R root:root /opt/terraria-app

echo 'Restarting service...'
sudo systemctl restart terraria-app
sleep 2
sudo systemctl status terraria-app --no-pager

echo 'Deployment complete!'
"@

ssh -i $KeyFile -o StrictHostKeyChecking=no ${EC2User}@${EC2IP} $DeployScript

Write-Host ""
Write-Host "[✓] Application deployed successfully!" -ForegroundColor Green
Write-Host "[✓] Access at: http://$EC2IP" -ForegroundColor Green
Write-Host ""
Write-Host "To check logs: ssh -i `"$KeyFile`" ${EC2User}@${EC2IP} `"sudo journalctl -u terraria-app -f`"" -ForegroundColor Cyan

# Cleanup
if (Test-Path deploy.tar.gz) { Remove-Item deploy.tar.gz }
