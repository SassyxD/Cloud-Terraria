# ✅ Cloud Terraria - Complete Deployment Checklist

ใช้ checklist นี้เพื่อ deploy Next.js app บน EC2 และเชื่อมกับ AWS services ทั้งหมด

---

## Phase 1: AWS Infrastructure Setup ☁️

### ✅ 1.1 VPC & Networking (15 min)

- [ ] Deploy VPC stack
  ```bash
  aws cloudformation create-stack \
    --stack-name terraria-vpc \
    --template-body file://infra/cloudformation/vpc.yaml
  ```
- [ ] Note down VPC ID
- [ ] Note down Public Subnet ID  
- [ ] Note down Private Subnet ID

### ✅ 1.2 RDS Database (15 min)

- [ ] Deploy RDS stack
  ```bash
  aws cloudformation create-stack \
    --stack-name terraria-rds \
    --template-body file://infra/cloudformation/rds.yaml \
    --parameters file://infra/cloudformation/parameters.json
  ```
- [ ] Wait for RDS to be available (~10 min)
- [ ] Note down RDS Endpoint
- [ ] Note down Master Password (from parameters)

### ✅ 1.3 Cognito User Pool (5 min)

- [ ] Create User Pool
  - Name: `terraria-users`
  - Sign-in: Email
  - Password: Default policy
- [ ] Create App Client
  - Name: `terraria-web-client`
  - Generate client secret: ✅
  - Callback URLs: `http://YOUR_EC2_IP/api/auth/callback/cognito`
- [ ] Note down User Pool ID
- [ ] Note down App Client ID
- [ ] Note down App Client Secret

### ✅ 1.4 Lambda Function (10 min)

- [ ] Deploy Lambda stack OR manual upload
  ```bash
  # Option 1: CloudFormation
  aws cloudformation create-stack \
    --stack-name terraria-lambda \
    --template-body file://infra/cloudformation/lambda.yaml \
    --capabilities CAPABILITY_IAM
  
  # Option 2: Manual (see AWS_LAMBDA_MANUAL_SETUP.md)
  ```
- [ ] Test Lambda function
- [ ] Note down Lambda Function Name

### ✅ 1.5 S3 Bucket (2 min) - Optional

- [ ] Create S3 bucket
  - Name: `terraria-backups-{random}`
  - Region: us-east-1
  - Block public access: ✅
- [ ] Note down Bucket Name

### ✅ 1.6 SNS Topic (2 min) - Optional

- [ ] Create SNS Topic
  - Name: `terraria-notifications`
- [ ] Create Email Subscription
  - Protocol: Email
  - Endpoint: your@email.com
- [ ] Confirm subscription email
- [ ] Note down Topic ARN

---

## Phase 2: EC2 Web App Deployment 🖥️

### ✅ 2.1 Deploy EC2 Instance (5 min)

**Option A: CloudFormation (Recommended)**

- [ ] Deploy EC2 stack
  ```bash
  # Windows
  scripts\deploy-webapp-ec2.bat
  
  # Linux/Mac
  ./scripts/deploy-webapp-ec2.sh
  ```
- [ ] Wait for stack complete
- [ ] Note down EC2 Public IP

**Option B: Manual**

- [ ] Launch EC2 instance
  - AMI: Amazon Linux 2
  - Type: t2.small
  - VPC: terraria-vpc
  - Subnet: Public subnet
  - Auto-assign public IP: ✅
  - Security Group: Allow 22, 80, 443
  - Key pair: vockey
- [ ] Create IAM Role with Lambda/RDS/S3 permissions
- [ ] Attach IAM Role to EC2
- [ ] Note down EC2 Public IP

### ✅ 2.2 SSH into EC2 (1 min)

- [ ] SSH into instance
  ```bash
  ssh -i vockey.pem ec2-user@YOUR_EC2_PUBLIC_IP
  ```

### ✅ 2.3 Clone Repository (2 min)

- [ ] Create app directory
  ```bash
  sudo mkdir -p /var/www/terraria
  sudo chown ec2-user:ec2-user /var/www/terraria
  cd /var/www/terraria
  ```
- [ ] Clone repository
  ```bash
  git clone https://github.com/SassyxD/Cloud-Terraria.git .
  ```

### ✅ 2.4 Configure Environment (5 min)

- [ ] Copy .env template
  ```bash
  cp .env.production .env
  ```
- [ ] Get AWS Credentials
  - Go to AWS Academy → AWS Details → Show
  - Copy ACCESS_KEY_ID
  - Copy SECRET_ACCESS_KEY
  - Copy SESSION_TOKEN
- [ ] Edit .env file
  ```bash
  nano .env
  ```
- [ ] Fill in all values:

  | Variable | Value | Source |
  |----------|-------|--------|
  | DATABASE_URL | postgresql://... | RDS Endpoint |
  | NEXTAUTH_URL | http://EC2_IP | EC2 Public IP |
  | AUTH_SECRET | random string | `openssl rand -base64 32` |
  | AUTH_COGNITO_ID | ... | Cognito Client ID |
  | AUTH_COGNITO_SECRET | ... | Cognito Client Secret |
  | AUTH_COGNITO_ISSUER | https://... | Cognito User Pool |
  | AWS_REGION | us-east-1 | - |
  | AWS_ACCESS_KEY_ID | ASIA... | AWS Academy |
  | AWS_SECRET_ACCESS_KEY | ... | AWS Academy |
  | AWS_SESSION_TOKEN | ... | AWS Academy |
  | AWS_LAMBDA_FUNCTION_NAME | TerrariaServerManager | Lambda |

- [ ] Save and exit (Ctrl+X, Y, Enter)

### ✅ 2.5 Deploy Application (10 min)

- [ ] Run deployment script
  ```bash
  chmod +x scripts/deploy-nextjs-ec2.sh
  ./scripts/deploy-nextjs-ec2.sh
  ```
- [ ] Wait for installation complete
- [ ] Check PM2 status
  ```bash
  pm2 status
  ```
- [ ] Check nginx status
  ```bash
  sudo systemctl status nginx
  ```

---

## Phase 3: Verification & Testing 🧪

### ✅ 3.1 Web App Access (1 min)

- [ ] Open browser: `http://YOUR_EC2_PUBLIC_IP`
- [ ] See Terraria dashboard ✅
- [ ] No errors in console ✅

### ✅ 3.2 Authentication (2 min)

- [ ] Click "Sign In"
- [ ] Try Cognito login
- [ ] Successfully authenticated ✅
- [ ] Redirected to dashboard ✅

### ✅ 3.3 Database Connection (1 min)

- [ ] Dashboard loads server list ✅
- [ ] No database errors ✅
- [ ] Check PM2 logs:
  ```bash
  pm2 logs terraria-web --lines 20
  ```

### ✅ 3.4 Lambda Integration (3 min)

- [ ] Click "Create Server"
- [ ] Fill in server details
- [ ] Click Create
- [ ] Server appears in list ✅
- [ ] Check server status changes to "Running" ✅

### ✅ 3.5 EC2 Game Server (5 min)

- [ ] Go to EC2 Console
- [ ] See new Terraria server instance ✅
- [ ] Instance state: Running ✅
- [ ] Note down Public IP
- [ ] Copy IP from dashboard ✅

### ✅ 3.6 Terraria Game Connection (5 min)

- [ ] Open Terraria game client
- [ ] Multiplayer → Join via IP
- [ ] Enter server IP + port (7777)
- [ ] Successfully connect ✅
- [ ] Can play the game ✅

---

## Phase 4: Optional Enhancements 🚀

### ✅ 4.1 CloudWatch Monitoring (5 min)

- [ ] Enable CloudWatch Agent on EC2
- [ ] Create CloudWatch Dashboard
- [ ] Add metrics:
  - EC2 CPU utilization
  - EC2 Memory usage
  - Lambda invocations
  - RDS connections

### ✅ 4.2 CloudWatch Alarms (5 min)

- [ ] Create CPU alarm (>80% for 5 min)
- [ ] Create Memory alarm (>90% for 5 min)
- [ ] Create Lambda error alarm (>5 errors)
- [ ] Test alarms

### ✅ 4.3 SNS Notifications (2 min)

- [ ] Update Lambda to send SNS on events
- [ ] Test notification email
- [ ] Confirm receiving emails ✅

### ✅ 4.4 S3 World Backups (10 min)

- [ ] Update Lambda to backup worlds to S3
- [ ] Create server and generate world
- [ ] Stop server
- [ ] Check S3 bucket has backup ✅

### ✅ 4.5 HTTPS with Let's Encrypt (15 min)

- [ ] Get domain name (Route 53 or external)
- [ ] Point domain to EC2 IP
- [ ] SSH into EC2
- [ ] Install certbot
  ```bash
  sudo amazon-linux-extras install epel -y
  sudo yum install certbot python3-certbot-nginx -y
  ```
- [ ] Get certificate
  ```bash
  sudo certbot --nginx -d your-domain.com
  ```
- [ ] Update NEXTAUTH_URL in .env
- [ ] Update Cognito Callback URL
- [ ] Restart app
- [ ] Access via HTTPS ✅

---

## Phase 5: Documentation & Submission 📄

### ✅ 5.1 Take Screenshots

- [ ] Architecture diagram
- [ ] AWS Console (EC2, RDS, Lambda, Cognito)
- [ ] Web dashboard
- [ ] Server creation process
- [ ] Terraria game connected
- [ ] CloudWatch metrics
- [ ] Cost estimation

### ✅ 5.2 Prepare Documentation

- [ ] README with project overview
- [ ] Architecture explanation
- [ ] AWS services used (12+ services)
- [ ] Deployment guide
- [ ] Cost analysis
- [ ] Security measures
- [ ] Scalability considerations

### ✅ 5.3 Create Demo Video (Optional)

- [ ] Show AWS Console
- [ ] Show web dashboard
- [ ] Create server via web
- [ ] Connect with Terraria client
- [ ] Play the game
- [ ] Show monitoring

---

## 🎯 Final Checklist

### Infrastructure
- [ ] ✅ VPC with public/private subnets
- [ ] ✅ RDS PostgreSQL database
- [ ] ✅ AWS Cognito authentication
- [ ] ✅ Lambda function for EC2 management
- [ ] ✅ EC2 web app instance (nginx + Next.js)
- [ ] ✅ EC2 game server instances
- [ ] ✅ S3 bucket for backups
- [ ] ✅ CloudWatch monitoring
- [ ] ✅ CloudWatch alarms
- [ ] ✅ SNS notifications
- [ ] ✅ Secrets Manager
- [ ] ✅ Security Groups configured

### Application
- [ ] ✅ Next.js app running on EC2
- [ ] ✅ PM2 managing Node.js process
- [ ] ✅ Nginx reverse proxy
- [ ] ✅ Database migrations applied
- [ ] ✅ Environment variables configured
- [ ] ✅ Authentication working (Cognito)
- [ ] ✅ Server CRUD operations working
- [ ] ✅ Lambda integration working

### Testing
- [ ] ✅ Web dashboard accessible
- [ ] ✅ User can sign in
- [ ] ✅ User can create server
- [ ] ✅ Server starts successfully
- [ ] ✅ Terraria game connects
- [ ] ✅ Can play multiplayer
- [ ] ✅ Monitoring data visible

### Documentation
- [ ] ✅ All diagrams created
- [ ] ✅ AWS services documented
- [ ] ✅ Deployment guide written
- [ ] ✅ Screenshots taken
- [ ] ✅ Cost estimation done

---

## 🎓 AWS Services Count: 12+

1. ✅ EC2 (Web App)
2. ✅ EC2 (Game Servers)
3. ✅ Lambda
4. ✅ RDS PostgreSQL
5. ✅ Cognito
6. ✅ VPC
7. ✅ Security Groups
8. ✅ S3
9. ✅ CloudWatch Metrics
10. ✅ CloudWatch Alarms
11. ✅ SNS
12. ✅ Secrets Manager
13. ✅ Parameter Store (bonus)

---

## 💰 Total Cost Estimation

| Resource | Monthly Cost |
|----------|-------------|
| EC2 Web App (t2.small) | $17 |
| RDS (db.t3.micro) | $15 |
| EC2 Game Server (when running) | $8/month if run 25% time |
| Lambda (1000 invokes) | $0.20 |
| S3 (10 GB) | $0.23 |
| Data Transfer (100 GB) | $9 |
| CloudWatch | $3 |
| **Total** | **~$52/month** |

**Free Tier (first 12 months):**
- RDS: 750 hours/month free
- EC2: 750 hours/month free
- Lambda: 1M requests free
- S3: 5 GB free
- **Estimated: $5-10/month with free tier**

---

## 📞 Support

- 📖 [Quick Reference](./QUICK_REFERENCE.md) - Common commands
- 🔑 [AWS Tokens Checklist](./AWS_TOKENS_CHECKLIST.md) - Where to get credentials
- 🏗️ [EC2 Deployment Guide](./EC2_DEPLOYMENT_GUIDE.md) - Detailed EC2 setup
- 📚 [AWS Complete Setup](./AWS_COMPLETE_SETUP.md) - All services guide

---

**🎉 Good luck with your deployment!**
