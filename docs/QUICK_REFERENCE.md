# 🚀 Quick Deployment Reference

คำสั่งที่ใช้บ่อย สำหรับ deploy และจัดการ Next.js บน EC2

---

## 📦 Initial Deployment

### 1. Deploy EC2 Instance (from local machine)

**Windows:**
```powershell
cd d:\terraria
scripts\deploy-webapp-ec2.bat
```

**Linux/Mac:**
```bash
cd ~/terraria
chmod +x scripts/deploy-webapp-ec2.sh
./scripts/deploy-webapp-ec2.sh
```

### 2. SSH into EC2

```bash
ssh -i vockey.pem ec2-user@YOUR_EC2_PUBLIC_IP
```

### 3. Clone Repository

```bash
cd /var/www/terraria
git clone https://github.com/SassyxD/Cloud-Terraria.git .
```

### 4. Create .env File

```bash
# Copy template
cp .env.production .env

# Edit with your values
nano .env
```

💡 **See [AWS_TOKENS_CHECKLIST.md](./AWS_TOKENS_CHECKLIST.md) for where to get each value**

### 5. Deploy Application

```bash
chmod +x scripts/deploy-nextjs-ec2.sh
./scripts/deploy-nextjs-ec2.sh
```

---

## 🔄 Update Application (After Git Push)

```bash
# SSH into EC2
ssh -i vockey.pem ec2-user@YOUR_EC2_IP

# Run update script
cd /var/www/terraria
./scripts/update-ec2-app.sh
```

**Or manually:**
```bash
git pull origin main
npm install
npm run build
npx prisma migrate deploy
npx prisma generate
pm2 restart terraria-web
```

---

## 📊 Monitoring & Management

### PM2 Commands

```bash
# View status
pm2 status

# View logs (live)
pm2 logs terraria-web

# View last 100 lines
pm2 logs terraria-web --lines 100

# View errors only
pm2 logs terraria-web --err

# Monitor CPU/Memory
pm2 monit

# Restart app
pm2 restart terraria-web

# Stop app
pm2 stop terraria-web

# Start app
pm2 start terraria-web

# Delete from PM2
pm2 delete terraria-web

# Flush logs
pm2 flush

# Save PM2 config
pm2 save
```

### Nginx Commands

```bash
# Check status
sudo systemctl status nginx

# Test configuration
sudo nginx -t

# Reload (no downtime)
sudo systemctl reload nginx

# Restart
sudo systemctl restart nginx

# Stop
sudo systemctl stop nginx

# Start
sudo systemctl start nginx

# View access logs
sudo tail -f /var/log/nginx/terraria-access.log

# View error logs
sudo tail -f /var/log/nginx/terraria-error.log
```

### Database Commands

```bash
# Check connection
nc -zv your-rds-endpoint 5432

# Run migrations
cd /var/www/terraria
npx prisma migrate deploy

# View database
npx prisma studio
# Then open http://YOUR_EC2_IP:5555

# Reset database (DANGER!)
npx prisma migrate reset --force
```

---

## 🔧 Environment Variables

### Update AWS Credentials (expires every 4 hours)

```bash
# Edit .env
cd /var/www/terraria
nano .env

# Update these 3 lines:
# AWS_ACCESS_KEY_ID="ASIA..."
# AWS_SECRET_ACCESS_KEY="..."
# AWS_SESSION_TOKEN="..."

# Restart app
pm2 restart terraria-web
```

### View Current Environment

```bash
# View .env file
cat /var/www/terraria/.env

# View PM2 environment
pm2 env 0
```

---

## 🐛 Troubleshooting

### App won't start

```bash
# Check PM2 logs
pm2 logs terraria-web --lines 50

# Check if port 3000 is in use
sudo lsof -i :3000

# Kill process on port 3000
sudo kill -9 $(sudo lsof -t -i:3000)

# Check environment
pm2 env 0

# Try starting manually
cd /var/www/terraria
npm run start
```

### Can't access from browser

```bash
# Check nginx is running
sudo systemctl status nginx

# Check nginx config
sudo nginx -t

# Check nginx logs
sudo tail -f /var/log/nginx/error.log

# Check Security Group allows port 80
# Go to: EC2 → Security Groups → terraria-webapp-sg
# Inbound rules should have: HTTP (80) from 0.0.0.0/0
```

### Database connection failed

```bash
# Test RDS connection
nc -zv your-rds-endpoint.rds.amazonaws.com 5432

# Check RDS Security Group
# Should allow port 5432 from EC2 security group

# Verify DATABASE_URL in .env
cat .env | grep DATABASE_URL

# Test with Prisma
cd /var/www/terraria
npx prisma db pull
```

### Lambda invoke failed

```bash
# Check AWS credentials not expired
cat .env | grep AWS_

# Test Lambda manually
aws lambda invoke \
  --function-name TerrariaServerManager \
  --payload '{"action":"LIST"}' \
  response.json

cat response.json
```

### Out of memory

```bash
# Check memory usage
free -h

# Check PM2 memory
pm2 monit

# Reduce PM2 instances
pm2 scale terraria-web 1

# Or upgrade to t2.medium
```

---

## 🔒 Security

### Update Security Group (SSH from your IP only)

```bash
# Get your IP
curl ifconfig.me

# Update Security Group
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxx \
  --protocol tcp \
  --port 22 \
  --cidr YOUR_IP/32
```

### Enable HTTPS with Let's Encrypt

```bash
# Install certbot
sudo amazon-linux-extras install epel -y
sudo yum install certbot python3-certbot-nginx -y

# Get certificate (requires domain name)
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo systemctl enable certbot-renew.timer
sudo systemctl start certbot-renew.timer
```

---

## 📈 Performance

### Check System Resources

```bash
# Memory
free -h

# Disk
df -h

# CPU
top

# Network
netstat -tuln | grep LISTEN
```

### Optimize PM2

```bash
# Scale instances (based on CPU cores)
pm2 scale terraria-web 2

# Reload with zero-downtime
pm2 reload terraria-web

# Set max memory restart
pm2 restart terraria-web --max-memory-restart 500M
```

---

## 🗑️ Cleanup

### Remove Application

```bash
# Stop PM2
pm2 stop terraria-web
pm2 delete terraria-web

# Stop nginx
sudo systemctl stop nginx

# Remove files
sudo rm -rf /var/www/terraria
```

### Delete CloudFormation Stack

```bash
# From local machine
aws cloudformation delete-stack --stack-name terraria-webapp

# Wait for completion
aws cloudformation wait stack-delete-complete --stack-name terraria-webapp
```

---

## 📚 Useful Links

- **EC2 Console**: https://console.aws.amazon.com/ec2
- **CloudWatch Logs**: https://console.aws.amazon.com/cloudwatch/home#logsV2:log-groups
- **RDS Console**: https://console.aws.amazon.com/rds
- **Lambda Console**: https://console.aws.amazon.com/lambda

---

## 🎯 Common Workflows

### Workflow 1: Deploy New Feature

```bash
# 1. On local machine: push code
git add .
git commit -m "Add new feature"
git push origin main

# 2. On EC2: update and deploy
ssh -i vockey.pem ec2-user@YOUR_EC2_IP
cd /var/www/terraria
./scripts/update-ec2-app.sh
```

### Workflow 2: Update AWS Credentials

```bash
# 1. Get new credentials from AWS Academy
# 2. SSH into EC2
ssh -i vockey.pem ec2-user@YOUR_EC2_IP

# 3. Update .env
cd /var/www/terraria
nano .env
# (update AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_SESSION_TOKEN)

# 4. Restart
pm2 restart terraria-web
```

### Workflow 3: Check Logs

```bash
# SSH into EC2
ssh -i vockey.pem ec2-user@YOUR_EC2_IP

# View logs
pm2 logs terraria-web --lines 100
sudo tail -f /var/log/nginx/terraria-error.log
```

---

**💡 Pro Tip**: Save your EC2 IP as a variable for quick SSH:

```bash
# In your .bashrc or .zshrc
export TERRARIA_EC2="54.123.45.67"
alias terraria-ssh="ssh -i vockey.pem ec2-user@$TERRARIA_EC2"

# Then just use:
terraria-ssh
```
