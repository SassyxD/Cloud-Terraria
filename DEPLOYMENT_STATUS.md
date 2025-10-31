# 🎉 Cloud Terraria - CloudFormation Deployment Status

## ✅ Successfully Deployed

### 1. VPC Network Infrastructure
- **Stack**: `cloud-terraria-network`
- **Resources Created**:
  - VPC (10.0.0.0/16)
  - 2 Public Subnets (us-east-1a, us-east-1b)
  - Internet Gateway
  - Route Tables
  - 3 Security Groups:
    - Lambda Security Group
    - RDS Security Group (PostgreSQL port 5432)
    - Terraria Security Group (Game port 7777, SSH port 22)
  - DB Subnet Group

### 2. Lambda Function
- **Stack**: `cloud-terraria-lambda`
- **Function**: Manages Terraria EC2 instances
- **Runtime**: Node.js 20.x
- **Actions Supported**:
  - START - Create new EC2 or start existing
  - STOP - Stop running instance
  - TERMINATE - Terminate instance
  - STATUS - Get instance status
- **Fixed Issue**: Changed `AWS_REGION` → `REGION` (reserved key)

### 3. RDS PostgreSQL Database
- **Stack**: `cloud-terraria-database` ⏳ **IN PROGRESS**
- **Engine**: PostgreSQL 15.10
- **Instance**: db.t3.micro (Free Tier eligible)
- **Storage**: 20GB GP3
- **Backup**: 7-day retention
- **Fixed Issues**:
  - Changed version from 15.4 → 15.10 (15.4 not available)
  - Disabled Enhanced Monitoring (LabRole permissions issue)
- **Estimated Time**: 10-15 minutes

---

## 🔧 Issues Fixed

1. **AWS CLI Not Installed**
   - ✅ Installed via `winget install Amazon.AWSCLI`
   - ✅ Configured AWS credentials

2. **Lambda: Reserved Environment Variable**
   - ❌ `AWS_REGION` is a reserved key in Lambda
   - ✅ Changed to `REGION`

3. **RDS: PostgreSQL Version Not Available**
   - ❌ Version 15.4 doesn't exist
   - ✅ Changed to 15.10

4. **RDS: Enhanced Monitoring Permission Error**
   - ❌ LabRole doesn't have `rds:MonitorDBInstance` permission
   - ✅ Disabled `MonitoringInterval` and `MonitoringRoleArn`

---

## 📋 Next Steps (After RDS Completes)

### Step 1: Update .env File
```powershell
.\update-env-from-cloudformation.ps1
```

This will automatically:
- Get RDS endpoint from CloudFormation
- Get Lambda function name from CloudFormation
- Update `.env` file with correct values

### Step 2: Run Database Migration
```powershell
npx prisma migrate dev --name init
```

This creates all tables in PostgreSQL:
- User
- Account
- Session
- Post
- ServerInstance
- VerificationToken

### Step 3: Start Development Server
```powershell
npm run dev
```

### Step 4: Test the Application
1. Open http://localhost:3000
2. Sign in with Mock Account (enter any username)
3. Click "Create Server"
4. Watch as Lambda creates EC2 instance
5. Connect to Terraria server using the IP address

---

## 🏗️ Infrastructure Summary

```
┌─────────────────────────────────────────────┐
│          AWS Cloud Infrastructure           │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │  VPC (10.0.0.0/16)                  │  │
│  │                                      │  │
│  │  ┌─────────────┐  ┌─────────────┐  │  │
│  │  │  Subnet 1   │  │  Subnet 2   │  │  │
│  │  │  (AZ-a)     │  │  (AZ-b)     │  │  │
│  │  └──────┬──────┘  └──────┬──────┘  │  │
│  │         │                 │         │  │
│  │  ┌──────┴─────────────────┴──────┐  │  │
│  │  │    Internet Gateway           │  │  │
│  │  └───────────────────────────────┘  │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │  Lambda Function                     │  │
│  │  - Creates/Manages EC2 Instances    │  │
│  │  - Node.js 20.x                     │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │  RDS PostgreSQL 15.10                │  │
│  │  - db.t3.micro                       │  │
│  │  - 20GB Storage                      │  │
│  │  - 7-day Backups                     │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │  EC2 Instances (Created on-demand)   │  │
│  │  - Terraria Game Servers            │  │
│  │  - Docker + Terraria Container      │  │
│  └──────────────────────────────────────┘  │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 💰 Cost Estimate (AWS Academy Free Credits)

- **VPC/Networking**: Free
- **Lambda**: Free Tier (1M requests/month)
- **RDS t3.micro**: Free Tier (750 hours/month)
- **EC2 t2.micro**: Free Tier (750 hours/month)

**Estimated Monthly Cost**: $0 (with Free Tier)

---

## 🔄 How to Update AWS Credentials (Expire every 4 hours)

When AWS Academy credentials expire:

```powershell
# 1. Get new credentials from AWS Academy
# 2. Update .env file
# 3. Configure AWS CLI
aws configure set aws_access_key_id YOUR_NEW_KEY
aws configure set aws_secret_access_key YOUR_NEW_SECRET
aws configure set aws_session_token "YOUR_NEW_TOKEN"
```

---

## 🧹 Cleanup (When Done)

To delete all resources:

```powershell
# Delete in reverse order
aws cloudformation delete-stack --stack-name cloud-terraria-lambda --region us-east-1
aws cloudformation delete-stack --stack-name cloud-terraria-database --region us-east-1
aws cloudformation delete-stack --stack-name cloud-terraria-network --region us-east-1
```

---

## 📚 Files Created

- `cloudformation/1-vpc-network.yaml` - VPC infrastructure
- `cloudformation/2-rds-database.yaml` - PostgreSQL database
- `cloudformation/3-lambda-function.yaml` - Lambda function
- `cloudformation/README.md` - Deployment guide
- `deploy-cloudformation.bat` - Windows deployment script
- `deploy-cloudformation.ps1` - PowerShell deployment script
- `update-env-from-cloudformation.ps1` - Environment update script

---

**Status**: ⏳ Waiting for RDS database to complete (~10-15 minutes)

Check progress: https://console.aws.amazon.com/cloudformation
