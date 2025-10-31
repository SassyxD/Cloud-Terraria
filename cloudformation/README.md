# Cloud Terraria - CloudFormation Deployment Guide

## 📋 Overview

Deploy complete infrastructure for Cloud Terraria using AWS CloudFormation.

**Infrastructure includes:**
- ✅ VPC with public subnets across 2 AZs
- ✅ Security Groups (RDS, Lambda, Terraria EC2)
- ✅ RDS PostgreSQL database
- ✅ Lambda function for EC2 management
- ✅ All networking (Internet Gateway, Route Tables)

---

## 🚀 Quick Deploy (3 Commands)

```powershell
# 1. Deploy VPC and Network (2-3 minutes)
aws cloudformation create-stack `
  --stack-name cloud-terraria-network `
  --template-body file://cloudformation/1-vpc-network.yaml `
  --region us-east-1

# Wait for completion
aws cloudformation wait stack-create-complete --stack-name cloud-terraria-network --region us-east-1

# 2. Deploy RDS Database (10-15 minutes)
aws cloudformation create-stack `
  --stack-name cloud-terraria-database `
  --template-body file://cloudformation/2-rds-database.yaml `
  --parameters ParameterKey=DBPassword,ParameterValue=TerrariaDB2024! `
  --region us-east-1

# Wait for completion
aws cloudformation wait stack-create-complete --stack-name cloud-terraria-database --region us-east-1

# 3. Deploy Lambda Function (1-2 minutes)
aws cloudformation create-stack `
  --stack-name cloud-terraria-lambda `
  --template-body file://cloudformation/3-lambda-function.yaml `
  --capabilities CAPABILITY_IAM `
  --region us-east-1

# Wait for completion
aws cloudformation wait stack-create-complete --stack-name cloud-terraria-lambda --region us-east-1
```

---

## 📊 Get Outputs

After deployment, get connection info:

```powershell
# Get Database endpoint
aws cloudformation describe-stacks `
  --stack-name cloud-terraria-database `
  --query "Stacks[0].Outputs" `
  --region us-east-1

# Get Lambda function name
aws cloudformation describe-stacks `
  --stack-name cloud-terraria-lambda `
  --query "Stacks[0].Outputs[?OutputKey=='LambdaFunctionName'].OutputValue" `
  --output text `
  --region us-east-1
```

---

## 🔧 Update .env File

After deployment completes, update your `.env` file:

```env
# Database (from stack outputs)
DATABASE_URL="postgresql://postgres:TerrariaDB2024!@<DB_ENDPOINT>:5432/terraria"

# Lambda (from stack outputs)
AWS_LAMBDA_FUNCTION_NAME="<LAMBDA_FUNCTION_NAME>"

# Keep existing AWS credentials
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_SESSION_TOKEN="..."
```

---

## 🔍 Monitor Deployment

Check stack status:

```powershell
# Check all stacks
aws cloudformation list-stacks `
  --stack-status-filter CREATE_COMPLETE CREATE_IN_PROGRESS `
  --region us-east-1

# Watch specific stack
aws cloudformation describe-stack-events `
  --stack-name cloud-terraria-network `
  --region us-east-1 `
  --max-items 10
```

---

## 🧹 Cleanup (Delete Everything)

When done, delete in reverse order:

```powershell
# 1. Delete Lambda
aws cloudformation delete-stack --stack-name cloud-terraria-lambda --region us-east-1

# 2. Delete RDS (takes 5-10 minutes)
aws cloudformation delete-stack --stack-name cloud-terraria-database --region us-east-1

# 3. Delete Network
aws cloudformation delete-stack --stack-name cloud-terraria-network --region us-east-1
```

---

## 🎯 Next Steps

1. **Run database migration:**
   ```powershell
   npx prisma migrate dev --name init
   ```

2. **Start development server:**
   ```powershell
   npm run dev
   ```

3. **Test Lambda function:**
   ```powershell
   aws lambda invoke `
     --function-name <LAMBDA_FUNCTION_NAME> `
     --payload '{"action":"STATUS"}' `
     response.json `
     --region us-east-1
   ```

---

## ⚠️ Troubleshooting

### Stack Creation Failed

```powershell
# Get error details
aws cloudformation describe-stack-events `
  --stack-name cloud-terraria-network `
  --region us-east-1 `
  --query "StackEvents[?ResourceStatus=='CREATE_FAILED']"
```

### RDS Connection Issues

1. Check security group allows your IP
2. Verify RDS is publicly accessible
3. Test connection:
   ```powershell
   Test-NetConnection -ComputerName <DB_ENDPOINT> -Port 5432
   ```

### Lambda Permissions

Lambda uses `LabRole` which should have:
- EC2 full access
- CloudWatch Logs
- VPC access

---

## 💰 Cost Estimate

**Free Tier Eligible:**
- RDS t3.micro: 750 hours/month free
- Lambda: 1M requests free
- Data transfer: 1GB free

**After Free Tier:**
- ~$15-20/month (if RDS runs 24/7)
- ~$2/month (if RDS stopped when not used)

---

## 📚 Stack Details

### Stack 1: Network (cloud-terraria-network)
- VPC (10.0.0.0/16)
- 2 Public Subnets
- Internet Gateway
- 3 Security Groups
- DB Subnet Group

### Stack 2: Database (cloud-terraria-database)
- RDS PostgreSQL 15.4
- db.t3.micro instance
- 20GB storage
- 7-day backups
- CloudWatch monitoring

### Stack 3: Lambda (cloud-terraria-lambda)
- Node.js 20.x runtime
- 512MB memory
- 5-minute timeout
- Function URL enabled

---

**Ready to deploy!** 🚀

Run the 3 commands above to get started.
