# 🚀 How to Activate Cloud Terraria

Complete guide to setup and run Cloud Terraria on your local machine.

---

## 📋 Prerequisites

### 1. **Installed Software**
- ✅ Node.js 18+ (ตรวจสอบ: `node --version`)
- ✅ npm or pnpm (ตรวจสอบ: `npm --version`)
- ✅ AWS CLI (ตรวจสอบ: `aws --version`)
- ✅ Git (ตรวจสอบ: `git --version`)

### 2. **AWS Account & Credentials**
- AWS Academy account (หรือ AWS account ปกติ)
- AWS CLI configured (`aws configure`)
- Region: us-east-1

---

## 🛠️ Setup (ทำครั้งเดียว)

### Step 1: Clone Repository

```bash
git clone https://github.com/SassyxD/Cloud-Terraria.git
cd Cloud-Terraria
```

### Step 2: Install Dependencies

```bash
npm install
# หรือ
pnpm install
```

### Step 3: Setup Environment Variables

สร้างไฟล์ `.env.local`:

```bash
# Database (ใช้ RDS PostgreSQL)
DATABASE_URL="postgresql://postgres:TerrariaDB2024!@cloud-terraria-db.cmjajxf2zbex.us-east-1.rds.amazonaws.com:5432/terraria"

# AWS (ถ้าต้องการ override defaults)
AWS_REGION="us-east-1"
AWS_LAMBDA_FUNCTION_NAME="cloud-terraria-server-manager"

# NextAuth
NEXTAUTH_SECRET="your-random-32-character-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Discord OAuth (Optional)
AUTH_DISCORD_ID="your-discord-client-id"
AUTH_DISCORD_SECRET="your-discord-client-secret"
```

### Step 4: Deploy AWS Infrastructure

**Option A: ใช้ CloudFormation (แนะนำสำหรับ AWS Academy)**

```powershell
# Deploy VPC
aws cloudformation create-stack \
  --stack-name cloud-terraria-network \
  --template-body file://cloudformation/1-vpc-network.yaml \
  --region us-east-1

# รอให้เสร็จ (~3 นาที)
aws cloudformation wait stack-create-complete \
  --stack-name cloud-terraria-network \
  --region us-east-1

# Deploy RDS
aws cloudformation create-stack \
  --stack-name cloud-terraria-database \
  --template-body file://cloudformation/2-rds-database.yaml \
  --parameters ParameterKey=VpcId,ParameterValue=<VPC-ID> \
               ParameterKey=DBSubnetGroupName,ParameterValue=<SUBNET-GROUP> \
               ParameterKey=RDSSecurityGroupId,ParameterValue=<SG-ID> \
  --region us-east-1

# Deploy Lambda
aws cloudformation create-stack \
  --stack-name cloud-terraria-lambda \
  --template-body file://cloudformation/3-lambda-function.yaml \
  --capabilities CAPABILITY_IAM \
  --region us-east-1
```

**Option B: ใช้ Scripts (ง่ายกว่า)**

```powershell
# Windows PowerShell
.\deployment\deploy-cloudformation.ps1 -Action deploy
```

### Step 5: Initialize Database

```bash
# Generate Prisma Client
npx prisma generate

# Apply migrations
npx prisma db push
```

### Step 6: Build Application (Optional for production)

```bash
npm run build
```

---

## ▶️ Run Application

### Development Mode (แนะนำ)

```bash
npm run dev
```

Application จะรันที่: **http://localhost:3000**

### Production Mode

```bash
npm run build
npm start
```

---

## 🎮 How to Use

### 1. เปิดเว็บ

```
http://localhost:3000
```

### 2. Sign In

- **Discord OAuth** (ถ้า configure แล้ว)
- **Mock Credentials** (สำหรับ demo/testing)

### 3. Create Terraria Server

1. คลิกปุ่ม **"Create New Server"**
2. รอ Lambda สร้าง EC2 instance (~2-3 นาที)
3. เมื่อสำเร็จ จะแสดง **Public IP:Port** (เช่น `3.89.217.47:7777`)
4. คลิกปุ่ม **"📋 Copy"** เพื่อ copy IP address

### 4. เชื่อมต่อจาก Terraria Game

1. เปิด Terraria
2. เลือก **Multiplayer**
3. คลิก **Join via IP**
4. Paste IP address ที่ copy มา (เช่น `3.89.217.47:7777`)
5. เล่นได้เลย! 🎉

### 5. Share with Friends

ส่ง IP address ให้เพื่อน เพื่อนสามารถเชื่อมต่อเข้ามาเล่นด้วยได้เลย!

**หมายเหตุ**: เพื่อน**ไม่ต้องเข้าเว็บ** ของคุณ! แค่ต่อ Terraria server IP โดยตรง

---

## 🛑 Stop/Delete Servers

### ผ่าน Web UI

1. กลับไปที่ http://localhost:3000
2. เลือก server ที่ต้องการ
3. คลิก **"Stop"** หรือ **"Delete"**

### ผ่าน AWS Console

```bash
# List instances
aws ec2 describe-instances \
  --filters "Name=tag:ManagedBy,Values=Cloud-Terraria" \
  --region us-east-1

# Stop instance
aws ec2 stop-instances \
  --instance-ids <instance-id> \
  --region us-east-1

# Terminate instance
aws ec2 terminate-instances \
  --instance-ids <instance-id> \
  --region us-east-1
```

---

## 🔧 Troubleshooting

### ❌ "Lambda function not found"

```bash
# ตรวจสอบ Lambda
aws lambda get-function \
  --function-name cloud-terraria-server-manager \
  --region us-east-1

# ถ้าไม่มี ให้ deploy ใหม่
aws cloudformation create-stack \
  --stack-name cloud-terraria-lambda \
  --template-body file://cloudformation/3-lambda-function.yaml \
  --capabilities CAPABILITY_IAM \
  --region us-east-1
```

### ❌ "Database connection failed"

```bash
# ตรวจสอบ DATABASE_URL ใน .env.local
cat .env.local | grep DATABASE_URL

# ทดสอบ connection
npx prisma db push --skip-generate

# ดู RDS endpoint
aws rds describe-db-instances \
  --db-instance-identifier cloud-terraria-db \
  --query "DBInstances[0].Endpoint.Address" \
  --output text \
  --region us-east-1
```

### ❌ Port 3000 already in use

```powershell
# หา process ที่ใช้ port 3000
Get-NetTCPConnection -LocalPort 3000 | Select-Object OwningProcess

# ปิด process
Stop-Process -Id <PID> -Force

# หรือใช้ port อื่น
$env:PORT=3001
npm run dev
```

### ❌ "AWS credentials not configured"

```bash
# Configure AWS CLI
aws configure

# ใส่ข้อมูล:
# AWS Access Key ID: <your-key>
# AWS Secret Access Key: <your-secret>
# Default region: us-east-1
# Default output format: json
```

### ❌ Server ไม่แสดง Public IP

ตรวจสอบ Lambda logs:

```bash
aws logs tail /aws/lambda/cloud-terraria-server-manager --follow --region us-east-1
```

---

## 💰 Cost Management

### ตรวจสอบค่าใช้จ่าย

```bash
# ดู current month costs
aws ce get-cost-and-usage \
  --time-period Start=$(date -u +%Y-%m-01),End=$(date -u +%Y-%m-%d) \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --region us-east-1
```

### ลดค่าใช้จ่าย

1. **Stop servers เมื่อไม่เล่น**
   - Web UI → คลิก "Stop"
   - ประหยัดได้: ~70-80% ของค่า EC2

2. **ลบ servers ที่ไม่ใช้**
   - Web UI → คลิก "Delete"
   - EC2 instances จะถูกลบ

3. **ตั้ง Budget Alert**
   ```bash
   # สร้าง budget $50/month
   aws budgets create-budget \
     --account-id <account-id> \
     --budget file://budget.json
   ```

---

## 📚 Additional Resources

- **AWS Cost Calculator**: `AWS_COST_CALCULATOR.md`
- **Deployment Summary**: `DEPLOYMENT_SUMMARY.md`
- **Quick Start**: `QUICK_START.md`
- **Project Report**: `report.md`

---

## 🔒 Security Best Practices

1. **ไม่ commit sensitive data**
   - `.env.local` อยู่ใน `.gitignore`
   - ไม่ commit AWS credentials

2. **Rotate secrets regularly**
   - เปลี่ยน NEXTAUTH_SECRET ทุก 90 วัน
   - เปลี่ยน database password

3. **Use IAM roles**
   - Lambda ใช้ IAM role แทน hardcode credentials
   - EC2 instances ใช้ Instance Profile

4. **Monitor access**
   - ดู CloudWatch Logs
   - ตั้ง CloudTrail logging

---

## 📞 Support

- **GitHub Issues**: https://github.com/SassyxD/Cloud-Terraria/issues
- **Documentation**: `/docs` folder
- **AWS Support**: AWS Academy support team

---

## ✅ Checklist

Before using:
- [ ] AWS CLI installed & configured
- [ ] Node.js installed
- [ ] Repository cloned
- [ ] Dependencies installed (`npm install`)
- [ ] `.env.local` created with correct values
- [ ] CloudFormation stacks deployed
- [ ] Database migrated (`npx prisma db push`)

Ready to use:
- [ ] `npm run dev` running
- [ ] Browser open at http://localhost:3000
- [ ] Can sign in
- [ ] Can create server
- [ ] Server shows Public IP
- [ ] Can connect from Terraria game

---

**🎮 Happy Gaming!**

---

*Last Updated: October 31, 2025*  
*Version: 1.0.0*  
*Branch: main*
