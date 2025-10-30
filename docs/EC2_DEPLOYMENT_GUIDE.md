# 🚀 EC2 Deployment Guide - Next.js on EC2

Deploy your Next.js Terraria web app on EC2 instead of Vercel.

## 📋 Overview

**Architecture:**
```
Internet → EC2 (nginx:80) → Next.js (PM2:3000) → RDS/Lambda/AWS Services
```

**Components:**
- **EC2 Instance**: t2.small Amazon Linux 2
- **nginx**: Reverse proxy (port 80)
- **PM2**: Process manager for Next.js
- **Next.js**: Production build

---

## 🎯 Quick Start (CloudFormation)

### 1. Deploy EC2 Instance

```bash
# Get VPC and Subnet IDs from your existing VPC stack
aws cloudformation describe-stacks \
  --stack-name terraria-vpc \
  --query 'Stacks[0].Outputs'

# Deploy EC2 for web app
aws cloudformation create-stack \
  --stack-name terraria-webapp \
  --template-body file://aws/cloudformation/nextjs-ec2.yaml \
  --parameters \
    ParameterKey=VpcId,ParameterValue=vpc-xxxxx \
    ParameterKey=SubnetId,ParameterValue=subnet-xxxxx \
    ParameterKey=KeyName,ParameterValue=vockey \
    ParameterKey=InstanceType,ParameterValue=t2.small \
  --capabilities CAPABILITY_NAMED_IAM

# Wait for completion
aws cloudformation wait stack-create-complete \
  --stack-name terraria-webapp

# Get instance IP
aws cloudformation describe-stacks \
  --stack-name terraria-webapp \
  --query 'Stacks[0].Outputs[?OutputKey==`PublicIP`].OutputValue' \
  --output text
```

### 2. SSH into Instance

```bash
ssh -i vockey.pem ec2-user@<PUBLIC_IP>
```

### 3. Clone Repository

```bash
cd /var/www/terraria
git clone https://github.com/SassyxD/Cloud-Terraria.git .
```

### 4. Create Environment File

```bash
nano .env
```

Add these values:

```env
# Database (use your RDS endpoint)
DATABASE_URL="postgresql://postgres:YourPassword123@terraria-db.xxxxx.us-east-1.rds.amazonaws.com:5432/terraria"

# NextAuth.js
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://YOUR_EC2_PUBLIC_IP"

# AWS Cognito (optional)
AUTH_COGNITO_ID="your-cognito-client-id"
AUTH_COGNITO_SECRET="your-cognito-client-secret"
AUTH_COGNITO_ISSUER="https://cognito-idp.us-east-1.amazonaws.com/us-east-1_xxxxx"

# AWS Credentials (get from AWS Academy)
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="ASIA..."
AWS_SECRET_ACCESS_KEY="..."
AWS_SESSION_TOKEN="..."

# Lambda
LAMBDA_FUNCTION_NAME="TerrariaServerManager"
```

### 5. Run Deployment Script

```bash
chmod +x scripts/deploy-nextjs-ec2.sh
./scripts/deploy-nextjs-ec2.sh
```

This script will:
- ✅ Install Node.js, PM2, nginx
- ✅ Install dependencies
- ✅ Build Next.js app
- ✅ Configure PM2 to run Next.js
- ✅ Configure nginx reverse proxy
- ✅ Start everything and enable auto-start

### 6. Access Your App

Open browser: `http://YOUR_EC2_PUBLIC_IP`

---

## 🔧 Manual Deployment (Without CloudFormation)

If you prefer manual setup:

### 1. Launch EC2 Instance

**AWS Console:**
1. Go to EC2 → Launch Instance
2. Name: `terraria-webapp`
3. AMI: Amazon Linux 2
4. Instance type: t2.small
5. Key pair: vockey
6. Network: Select your VPC
7. Subnet: Public subnet
8. Auto-assign public IP: **Enable**
9. Security Group:
   - SSH (22) from your IP
   - HTTP (80) from 0.0.0.0/0
   - HTTPS (443) from 0.0.0.0/0
10. Storage: 20 GB gp3
11. Launch instance

### 2. Create IAM Role

**AWS Console:**
1. IAM → Roles → Create role
2. Trusted entity: EC2
3. Permissions:
   - CloudWatchAgentServerPolicy
   - Create custom policy:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "lambda:InvokeFunction",
           "ec2:DescribeInstances",
           "rds:DescribeDBInstances",
           "secretsmanager:GetSecretValue",
           "s3:GetObject",
           "s3:PutObject"
         ],
         "Resource": "*"
       }
     ]
   }
   ```
4. Name: `terraria-webapp-role`
5. Attach to EC2 instance

### 3. SSH and Deploy

```bash
# SSH
ssh -i vockey.pem ec2-user@<PUBLIC_IP>

# Clone repo
sudo mkdir -p /var/www/terraria
sudo chown ec2-user:ec2-user /var/www/terraria
cd /var/www/terraria
git clone https://github.com/SassyxD/Cloud-Terraria.git .

# Run deployment
chmod +x scripts/deploy-nextjs-ec2.sh
./scripts/deploy-nextjs-ec2.sh
```

---

## 🔄 Updating Your App

When you push new code to GitHub:

```bash
# SSH into EC2
ssh -i vockey.pem ec2-user@<PUBLIC_IP>

# Run update script
cd /var/www/terraria
./scripts/update-ec2-app.sh
```

Or manually:

```bash
cd /var/www/terraria
git pull origin main
npm install
npm run build
pm2 restart terraria-web
```

---

## 📊 Monitoring & Management

### Check App Status

```bash
# PM2 status
pm2 status

# View logs
pm2 logs terraria-web

# Monitor resources
pm2 monit

# Restart app
pm2 restart terraria-web

# Stop app
pm2 stop terraria-web

# Start app
pm2 start terraria-web
```

### Check nginx

```bash
# Status
sudo systemctl status nginx

# Test configuration
sudo nginx -t

# Restart
sudo systemctl restart nginx

# View logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### System Resources

```bash
# Memory usage
free -h

# Disk usage
df -h

# CPU usage
top

# Network connections
netstat -tuln | grep LISTEN
```

---

## 🔒 Security Hardening

### 1. Update Security Group

Restrict SSH to your IP only:

```bash
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxx \
  --protocol tcp \
  --port 22 \
  --cidr YOUR_IP/32
```

### 2. Enable HTTPS (Let's Encrypt)

```bash
# Install certbot
sudo amazon-linux-extras install epel -y
sudo yum install certbot python3-certbot-nginx -y

# Get certificate (requires domain name)
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo systemctl enable certbot-renew.timer
```

Update nginx config:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        # ... rest of config
    }
}
```

### 3. Set up CloudWatch Logs

```bash
# Install CloudWatch agent
sudo yum install amazon-cloudwatch-agent -y

# Configure
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-config-wizard
```

---

## 💰 Cost Estimation

**Monthly costs (us-east-1):**

| Resource | Type | Cost |
|----------|------|------|
| EC2 Instance | t2.small | $16.79/month |
| EBS Storage | 20 GB gp3 | $1.60/month |
| Data Transfer | 100 GB out | $9.00/month |
| **Total** | | **~$27/month** |

**Cost savings:**
- t2.micro: $8.47/month (but may be slow)
- Reserved Instance (1 year): ~40% savings

---

## 🐛 Troubleshooting

### App won't start

```bash
# Check PM2 logs
pm2 logs terraria-web

# Check if port 3000 is in use
sudo lsof -i :3000

# Check environment variables
pm2 env 0
```

### Can't access from browser

```bash
# Check nginx is running
sudo systemctl status nginx

# Check Security Group allows port 80
aws ec2 describe-security-groups --group-ids sg-xxxxx

# Check nginx logs
sudo tail -f /var/log/nginx/error.log
```

### Database connection failed

```bash
# Test RDS connection
nc -zv your-rds-endpoint.rds.amazonaws.com 5432

# Check Security Group allows EC2 → RDS
# RDS security group should allow port 5432 from EC2 security group
```

### Out of memory

```bash
# Check memory
free -h

# Reduce PM2 instances
pm2 scale terraria-web 1

# Or upgrade to t2.medium
```

---

## 🎯 Comparison: EC2 vs Vercel

| Feature | EC2 | Vercel |
|---------|-----|--------|
| **Setup** | Manual | Automatic |
| **Cost** | ~$27/month | Free (hobby) |
| **Control** | Full control | Limited |
| **Scaling** | Manual | Auto |
| **SSL** | Manual (Let's Encrypt) | Automatic |
| **Deployment** | Git pull + build | Git push |
| **Monitoring** | CloudWatch | Built-in |

**Use EC2 when:**
- ✅ You need full control
- ✅ Running background jobs
- ✅ Custom system dependencies
- ✅ Learning AWS infrastructure

**Use Vercel when:**
- ✅ Quick deployment
- ✅ Don't want to manage servers
- ✅ Free tier is enough
- ✅ Auto-scaling needed

---

## 📚 Next Steps

1. ✅ Set up domain name (Route 53)
2. ✅ Enable HTTPS with Let's Encrypt
3. ✅ Configure CloudWatch monitoring
4. ✅ Set up automated backups
5. ✅ Create AMI for disaster recovery
6. ✅ Implement CI/CD with GitHub Actions

---

## 🔗 Related Documentation

- [AWS Complete Setup](./AWS_COMPLETE_SETUP.md) - Full AWS infrastructure
- [RDS Deployment](./RDS_DEPLOYMENT_GUIDE.md) - Database setup
- [Diagrams](./DIAGRAMS.md) - Architecture diagrams

---

**Questions?** Check the [troubleshooting section](#-troubleshooting) or create an issue on GitHub.
