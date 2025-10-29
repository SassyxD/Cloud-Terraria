# Quick Start: Deploy RDS for Cloud Terraria

This is a quick reference guide for deploying AWS RDS PostgreSQL for the Cloud Terraria project.

## 🚀 Fast Track Deployment (AWS Console)

### 1. Deploy VPC (5 minutes)

1. Open [AWS CloudFormation Console](https://console.aws.amazon.com/cloudformation)
2. Click **Create stack** → **With new resources**
3. Upload template: `infra/cloudformation/vpc.yaml`
4. Stack name: `terraria-vpc`
5. Use default parameters
6. Click **Next** → **Next** → **Create stack**
7. Wait for `CREATE_COMPLETE` status

### 2. Deploy RDS (15 minutes)

1. Click **Create stack** again
2. Upload template: `infra/cloudformation/rds.yaml`
3. Stack name: `terraria-rds`
4. **Important parameters:**
   - **VpcStackName**: `terraria-vpc`
   - **DBPassword**: Your secure password (min 8 chars)
5. Click **Next** → **Next**
6. ✅ Check "I acknowledge that AWS CloudFormation might create IAM resources"
7. Click **Create stack**
8. Wait for `CREATE_COMPLETE` (takes 10-15 minutes)

### 3. Get Database Connection String

1. Go to stack **Outputs** tab
2. Copy the **DatabaseURL** value
3. Add to your `.env` file:
   ```
   DATABASE_URL="postgresql://postgres:password@endpoint:5432/terraria"
   ```

### 4. Initialize Database

```bash
pnpm install
npx prisma generate
npx prisma migrate deploy
```

**Done!** Your RDS is ready to use.

---

## 🖥️ Fast Track Deployment (AWS CLI)

### One-Command Deployment

```bash
# Linux/Mac
chmod +x scripts/deploy-rds.sh
./scripts/deploy-rds.sh

# Windows
scripts\deploy-rds.bat
```

The script will:
- Deploy VPC infrastructure
- Deploy RDS database
- Output the connection string

---

## 📊 RDS Features Included

- ✅ PostgreSQL 15.4
- ✅ db.t3.micro (Free tier eligible)
- ✅ 20 GB gp3 storage
- ✅ Automated backups (7 days retention)
- ✅ Performance Insights enabled
- ✅ CloudWatch Logs integration
- ✅ Encrypted at rest
- ✅ Private subnet deployment
- ✅ Secrets Manager integration

---

## 💰 Cost Estimate

### Free Tier (First 12 months)
- ✅ 750 hours/month of db.t3.micro
- ✅ 20 GB storage
- ✅ 20 GB backup storage
- **Cost: $0/month**

### After Free Tier
- db.t3.micro: ~$15/month
- Storage (20 GB): ~$3/month
- **Total: ~$18/month**

---

## 📸 Screenshots for Project Submission

### Required Screenshots

1. **CloudFormation Stacks**
   - Console → CloudFormation → Stacks
   - Show both `terraria-vpc` and `terraria-rds` with `CREATE_COMPLETE` status

2. **RDS Instance Details**
   - Console → RDS → Databases
   - Show your database instance with status `Available`
   - Highlight: Engine, Storage, Backups

3. **RDS Configuration**
   - Click on database instance
   - Show: Instance size, Storage type, Multi-AZ, Encryption

4. **Performance Insights**
   - Database instance → Performance Insights tab
   - Show the dashboard with metrics

5. **Security Groups**
   - Database instance → Connectivity & security tab
   - Show security group rules

6. **CloudFormation Template**
   - Stack → Template tab
   - Show the YAML template used

7. **Stack Outputs**
   - Stack → Outputs tab
   - Show database endpoint and connection details

8. **Application Connected**
   - Show Prisma Studio connected to RDS
   - Or show your application logs with successful database connection

---

## 🔍 Verify RDS Deployment

### Check Instance Status

```bash
aws rds describe-db-instances \
  --db-instance-identifier production-terraria-db \
  --query 'DBInstances[0].[DBInstanceStatus,Endpoint.Address]'
```

Expected output:
```
[
    "available",
    "production-terraria-db.xxxxx.ap-southeast-1.rds.amazonaws.com"
]
```

### Test Database Connection

```bash
# Using Prisma
npx prisma db push

# Using psql (if installed)
psql -h your-endpoint.rds.amazonaws.com \
     -U postgres \
     -d terraria \
     -p 5432
```

### View in Prisma Studio

```bash
npx prisma studio
```

Browser opens at `http://localhost:5555` showing your RDS database.

---

## 🎓 For Course Project Submission

### Required Deliverables

1. **Documentation** (this file)
2. **CloudFormation Templates** (vpc.yaml, rds.yaml)
3. **Screenshots** (as listed above)
4. **Application Code** (with .env configured for RDS)
5. **Database Schema** (prisma/schema.prisma)

### Project Description Example

> **Title**: Cloud-Based Terraria Server Management with AWS RDS
>
> **Description**: This project deploys a scalable Terraria server management platform using AWS cloud services. The infrastructure includes:
> - AWS RDS PostgreSQL for database management
> - AWS VPC for network isolation
> - CloudFormation for Infrastructure as Code
> - Next.js application for server management
>
> **Key Features**:
> - Automated database backups
> - Performance monitoring with Performance Insights
> - Secure private subnet deployment
> - Encrypted data at rest
> - CloudWatch integration for logging and metrics
>
> **Technologies**: AWS RDS, PostgreSQL, CloudFormation, Next.js, Prisma, TypeScript

---

## 🆘 Quick Troubleshooting

### RDS Creation Failed

**Check CloudFormation Events:**
```bash
aws cloudformation describe-stack-events \
  --stack-name terraria-rds \
  --max-items 20 \
  --query 'StackEvents[?ResourceStatus==`CREATE_FAILED`]'
```

### Cannot Connect to Database

1. **Check security group**: Ensure your app's security group is added to RDS security group
2. **Check database status**: Must be `Available`
3. **Verify connection string**: Check the endpoint, port, username, password

### Application Shows Database Error

```bash
# Regenerate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# Check connection
npx prisma db execute --stdin < /dev/null
```

---

## 🧹 Cleanup (After Project Submission)

### Delete All Resources

**AWS Console:**
1. CloudFormation → Select `terraria-rds` → Delete
2. Wait for completion
3. Select `terraria-vpc` → Delete

**AWS CLI:**
```bash
aws cloudformation delete-stack --stack-name terraria-rds
aws cloudformation wait stack-delete-complete --stack-name terraria-rds

aws cloudformation delete-stack --stack-name terraria-vpc
aws cloudformation wait stack-delete-complete --stack-name terraria-vpc
```

---

## 📚 Additional Resources

- **Full Guide**: See `RDS_DEPLOYMENT_GUIDE.md`
- **Infrastructure Overview**: See `INFRASTRUCTURE.md`
- **CloudFormation Templates**: See `infra/cloudformation/`
- **AWS Academy Guide**: See `AWS_ACADEMY_RDS_GUIDE.md`

---

## ✅ Deployment Checklist

- [ ] AWS account ready (AWS Academy or regular)
- [ ] AWS CLI installed and configured
- [ ] CloudFormation templates downloaded
- [ ] VPC stack created successfully
- [ ] RDS stack created successfully
- [ ] Database endpoint obtained
- [ ] `.env` file updated with DATABASE_URL
- [ ] Prisma migrations executed
- [ ] Application connected to RDS
- [ ] Screenshots taken for submission
- [ ] All features tested and working

**Your RDS is production-ready! 🎉**
