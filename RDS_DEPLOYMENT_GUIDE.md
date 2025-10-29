# AWS RDS Deployment Guide for Cloud Terraria

## Overview

This guide provides complete instructions for deploying PostgreSQL RDS for the Cloud Terraria project, suitable for submission as a cloud computing course project.

## Prerequisites

- AWS Account (AWS Academy or regular AWS account)
- AWS CLI installed and configured
- Basic understanding of RDS and VPC concepts

## Deployment Options

### Option 1: Full Stack Deployment (Recommended)

Deploy complete infrastructure including VPC, RDS, and Lambda function.

### Option 2: RDS Only

Deploy only RDS database if you already have VPC infrastructure.

---

## Option 1: Full Stack Deployment

### Step 1: Deploy VPC Infrastructure

**Using AWS Console:**

1. **Navigate to CloudFormation Console**
   - Go to AWS Console → Services → CloudFormation
   - Click "Create stack" → "With new resources (standard)"

2. **Upload VPC Template**
   - Choose "Template is ready"
   - Select "Upload a template file"
   - Upload `infra/cloudformation/vpc.yaml`
   - Click "Next"

3. **Configure Stack**
   - **Stack name**: `terraria-vpc`
   - **Parameters**:
     - Environment: `production`
     - VpcCIDR: `10.0.0.0/16`
     - PublicSubnet1CIDR: `10.0.1.0/24`
     - PublicSubnet2CIDR: `10.0.2.0/24`
     - PrivateSubnet1CIDR: `10.0.11.0/24`
     - PrivateSubnet2CIDR: `10.0.12.0/24`
   - Click "Next"

4. **Configure Stack Options**
   - Add tags (optional):
     - Key: `Project`, Value: `CloudTerraria`
     - Key: `Environment`, Value: `Production`
   - Click "Next"

5. **Review and Create**
   - Review all settings
   - Click "Create stack"
   - Wait for status: `CREATE_COMPLETE` (approximately 3-5 minutes)

6. **Save Outputs**
   - Go to "Outputs" tab
   - Note down these values (needed for RDS deployment):
     - `VPC` (VPC ID)
     - `PrivateSubnet1` (Private Subnet 1 ID)
     - `PrivateSubnet2` (Private Subnet 2 ID)

**Using AWS CLI:**

```bash
# Navigate to cloudformation directory
cd infra/cloudformation

# Create VPC stack
aws cloudformation create-stack \
  --stack-name terraria-vpc \
  --template-body file://vpc.yaml \
  --parameters \
    ParameterKey=Environment,ParameterValue=production \
    ParameterKey=VpcCIDR,ParameterValue=10.0.0.0/16

# Wait for completion
aws cloudformation wait stack-create-complete \
  --stack-name terraria-vpc

# Get outputs
aws cloudformation describe-stacks \
  --stack-name terraria-vpc \
  --query 'Stacks[0].Outputs'
```

---

### Step 2: Deploy RDS Database

**Using AWS Console:**

1. **Navigate to CloudFormation Console**
   - Click "Create stack" → "With new resources (standard)"

2. **Upload RDS Template**
   - Choose "Template is ready"
   - Select "Upload a template file"
   - Upload `infra/cloudformation/rds.yaml`
   - Click "Next"

3. **Configure Stack**
   - **Stack name**: `terraria-rds`
   - **Parameters**:
     - Environment: `production`
     - VpcStackName: `terraria-vpc` (must match VPC stack name)
     - DBName: `terraria`
     - DBUsername: `postgres`
     - DBPassword: `YourSecurePassword123!` (⚠️ Use a strong password!)
     - DBInstanceClass: `db.t3.micro` (Free tier eligible)
     - DBAllocatedStorage: `20` (GB)
     - DBBackupRetentionPeriod: `7` (days)
     - EnablePerformanceInsights: `true`
     - MultiAZ: `false` (Set to `true` for production)
   - Click "Next"

4. **Configure Stack Options**
   - Add tags:
     - Key: `Project`, Value: `CloudTerraria`
     - Key: `Environment`, Value: `Production`
     - Key: `Component`, Value: `Database`
   - Click "Next"

5. **Review and Create**
   - Review all settings
   - ✅ Check "I acknowledge that AWS CloudFormation might create IAM resources"
   - Click "Create stack"
   - Wait for status: `CREATE_COMPLETE` (approximately 10-15 minutes)

6. **Save Database Outputs**
   - Go to "Outputs" tab
   - **Important values**:
     - `DBEndpoint` - Database connection endpoint
     - `DBPort` - Database port (usually 5432)
     - `DatabaseURL` - Full connection string
     - `DBSecretArn` - Secrets Manager ARN (contains credentials)

**Using AWS CLI:**

```bash
# Create RDS stack
aws cloudformation create-stack \
  --stack-name terraria-rds \
  --template-body file://rds.yaml \
  --parameters \
    ParameterKey=Environment,ParameterValue=production \
    ParameterKey=VpcStackName,ParameterValue=terraria-vpc \
    ParameterKey=DBName,ParameterValue=terraria \
    ParameterKey=DBUsername,ParameterValue=postgres \
    ParameterKey=DBPassword,ParameterValue=YourSecurePassword123! \
    ParameterKey=DBInstanceClass,ParameterValue=db.t3.micro \
    ParameterKey=DBAllocatedStorage,ParameterValue=20 \
    ParameterKey=DBBackupRetentionPeriod,ParameterValue=7 \
    ParameterKey=EnablePerformanceInsights,ParameterValue=true \
    ParameterKey=MultiAZ,ParameterValue=false

# Wait for completion (this takes 10-15 minutes)
aws cloudformation wait stack-create-complete \
  --stack-name terraria-rds

# Get database connection details
aws cloudformation describe-stacks \
  --stack-name terraria-rds \
  --query 'Stacks[0].Outputs'
```

---

### Step 3: Deploy Lambda Function (Optional)

**Using AWS Console:**

1. **Create Lambda Stack**
   - Upload `infra/cloudformation/lambda.yaml`
   - Stack name: `terraria-lambda`
   - Parameters:
     - Environment: `production`
     - VpcStackName: `terraria-vpc`
     - TerrariaInstanceName: `terraria-server`
     - InstanceType: `t2.medium`

2. **Review and Create**
   - ✅ Check "I acknowledge that AWS CloudFormation might create IAM resources"
   - Click "Create stack"
   - Wait for completion (2-3 minutes)

**Using AWS CLI:**

```bash
aws cloudformation create-stack \
  --stack-name terraria-lambda \
  --template-body file://lambda.yaml \
  --parameters \
    ParameterKey=Environment,ParameterValue=production \
    ParameterKey=VpcStackName,ParameterValue=terraria-vpc \
    ParameterKey=TerrariaInstanceName,ParameterValue=terraria-server \
    ParameterKey=InstanceType,ParameterValue=t2.medium \
  --capabilities CAPABILITY_NAMED_IAM

aws cloudformation wait stack-create-complete \
  --stack-name terraria-lambda
```

---

## Option 2: RDS Only Deployment

If you already have VPC infrastructure, you can deploy only the RDS stack.

### Prerequisites

You need:
- VPC ID
- Two Private Subnet IDs (in different availability zones)

### Modify RDS Template

Edit `infra/cloudformation/rds.yaml` and replace the ImportValue sections:

```yaml
# Change this:
SubnetIds:
  - Fn::ImportValue: !Sub ${VpcStackName}-PrivateSubnet1
  - Fn::ImportValue: !Sub ${VpcStackName}-PrivateSubnet2

# To this (with your actual subnet IDs):
SubnetIds:
  - subnet-0123456789abcdef0
  - subnet-0123456789abcdef1
```

```yaml
# Change this:
VpcId:
  Fn::ImportValue: !Sub ${VpcStackName}-VPC

# To this (with your actual VPC ID):
VpcId: vpc-0123456789abcdef0
```

### Deploy RDS Stack

Follow Step 2 from Option 1 above.

---

## Configure Application

### Step 1: Update Environment Variables

Update your `.env` file with the database connection string:

```bash
# Get the database URL from CloudFormation outputs
DATABASE_URL="postgresql://postgres:YourSecurePassword123!@your-db-endpoint.region.rds.amazonaws.com:5432/terraria"

# Or retrieve from Secrets Manager
DATABASE_URL=$(aws secretsmanager get-secret-value \
  --secret-id production/terraria/database \
  --query 'SecretString' \
  --output text | jq -r '.url')
```

### Step 2: Run Database Migrations

```bash
# Install dependencies
pnpm install

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Verify connection
npx prisma db push
```

### Step 3: Test Database Connection

```bash
# Open Prisma Studio to verify database
npx prisma studio
```

---

## Verify RDS Deployment

### Check RDS Instance Status

**AWS Console:**
1. Go to RDS Console
2. Click "Databases"
3. Find your instance: `production-terraria-db`
4. Verify status: `Available`

**AWS CLI:**

```bash
aws rds describe-db-instances \
  --db-instance-identifier production-terraria-db \
  --query 'DBInstances[0].[DBInstanceStatus,Endpoint.Address,Endpoint.Port]'
```

### Test Database Connection

```bash
# Install PostgreSQL client (if not installed)
# Windows: Download from https://www.postgresql.org/download/windows/
# Mac: brew install postgresql
# Linux: sudo apt-get install postgresql-client

# Test connection
psql -h your-db-endpoint.region.rds.amazonaws.com \
     -U postgres \
     -d terraria \
     -p 5432
```

---

## RDS Features Enabled

Your RDS instance includes these cloud-native features:

### 1. **Automated Backups**
- Retention: 7 days
- Backup window: 03:00-04:00 UTC
- Point-in-time recovery enabled

### 2. **Performance Insights**
- Real-time performance monitoring
- 7-day retention period
- Database load analysis

### 3. **CloudWatch Logs**
- PostgreSQL logs exported to CloudWatch
- Upgrade logs exported to CloudWatch
- Log retention: As per CloudWatch settings

### 4. **Storage Auto-scaling**
- Automatic storage expansion when needed
- gp3 storage for better performance
- 3000 IOPS baseline

### 5. **Encryption**
- Storage encryption at rest enabled
- AWS KMS managed keys

### 6. **Security**
- Private subnet deployment (no public access)
- Security group with restricted access
- Secrets Manager integration for credentials

### 7. **High Availability Options**
- Multi-AZ deployment available (set MultiAZ=true)
- Automatic failover capability
- Read replicas can be added

---

## Monitoring and Management

### CloudWatch Metrics

Key metrics to monitor:
- `CPUUtilization`
- `DatabaseConnections`
- `FreeableMemory`
- `ReadIOPS` / `WriteIOPS`
- `NetworkReceiveThroughput` / `NetworkTransmitThroughput`

**View metrics:**
```bash
aws cloudwatch get-metric-statistics \
  --namespace AWS/RDS \
  --metric-name CPUUtilization \
  --dimensions Name=DBInstanceIdentifier,Value=production-terraria-db \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average
```

### Performance Insights

View in AWS Console:
1. Go to RDS Console
2. Click your database instance
3. Select "Performance Insights" tab
4. Analyze database load and queries

### Secrets Manager

Retrieve database credentials securely:

```bash
aws secretsmanager get-secret-value \
  --secret-id production/terraria/database \
  --query 'SecretString' \
  --output text | jq .
```

---

## Cost Optimization

### Free Tier Eligible Configuration

- Instance: `db.t3.micro`
- Storage: 20 GB gp3
- Backups: 20 GB
- Free tier: 750 hours/month for 12 months

### Estimated Monthly Cost (After Free Tier)

- db.t3.micro: ~$15/month
- Storage (20 GB gp3): ~$3/month
- Backup storage (20 GB): Free (equal to provisioned storage)
- **Total: ~$18/month**

### Cost Reduction Tips

1. **Stop instance when not in use**: Database can be stopped for up to 7 days
   ```bash
   aws rds stop-db-instance --db-instance-identifier production-terraria-db
   ```

2. **Use Reserved Instances**: Save up to 60% with 1-year commitment

3. **Delete unnecessary backups**: Reduce backup retention period

4. **Monitor storage usage**: Avoid unnecessary storage growth

---

## Cleanup / Delete Resources

### Delete Individual Stacks

**AWS Console:**
1. Go to CloudFormation Console
2. Select stack
3. Click "Delete"
4. Confirm deletion

**AWS CLI:**

```bash
# Delete in reverse order
aws cloudformation delete-stack --stack-name terraria-lambda
aws cloudformation delete-stack --stack-name terraria-rds
aws cloudformation delete-stack --stack-name terraria-vpc

# Wait for deletion
aws cloudformation wait stack-delete-complete --stack-name terraria-lambda
aws cloudformation wait stack-delete-complete --stack-name terraria-rds
aws cloudformation wait stack-delete-complete --stack-name terraria-vpc
```

### Delete with Final Snapshot (Recommended)

To save your data before deletion:

1. Go to RDS Console
2. Select your database
3. Click "Actions" → "Take snapshot"
4. Enter snapshot name: `terraria-final-snapshot`
5. Wait for snapshot completion
6. Then delete the CloudFormation stacks

---

## Troubleshooting

### Issue: RDS stack creation fails

**Error**: "Cannot create DB subnet group"

**Solution**: Ensure VPC stack is complete and outputs are available

```bash
aws cloudformation describe-stacks --stack-name terraria-vpc --query 'Stacks[0].Outputs'
```

### Issue: Cannot connect to database

**Check security groups:**
```bash
aws ec2 describe-security-groups \
  --filters "Name=tag:Name,Values=production-terraria-app-sg" \
  --query 'SecurityGroups[0].IpPermissions'
```

**Check if database is available:**
```bash
aws rds describe-db-instances \
  --db-instance-identifier production-terraria-db \
  --query 'DBInstances[0].DBInstanceStatus'
```

### Issue: Performance is slow

**Enable Performance Insights:**
- Already enabled by default
- View in RDS Console → Performance Insights tab

**Check CloudWatch metrics:**
- High CPU? Consider upgrading instance class
- High IOPS? Consider provisioned IOPS storage

---

## Project Submission Checklist

For your cloud computing course project:

- [ ] VPC deployed with CloudFormation template
- [ ] RDS PostgreSQL instance running
- [ ] Database accessible from application
- [ ] Screenshots of AWS Console showing:
  - [ ] CloudFormation stacks
  - [ ] RDS instance details
  - [ ] Performance Insights dashboard
  - [ ] CloudWatch metrics
- [ ] Application `.env` configured with RDS endpoint
- [ ] Database migrations executed successfully
- [ ] Application running and connected to RDS
- [ ] Documentation of deployment process
- [ ] Cost estimation included

---

## Additional Resources

- [AWS RDS Documentation](https://docs.aws.amazon.com/rds/)
- [CloudFormation RDS Reference](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/AWS_RDS.html)
- [PostgreSQL on RDS Best Practices](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_BestPractices.html)
- [Prisma with PostgreSQL](https://www.prisma.io/docs/concepts/database-connectors/postgresql)

---

## Support

For issues or questions:
1. Check AWS CloudFormation Events tab for error details
2. Review CloudWatch Logs for application errors
3. Verify security group rules and network configuration
4. Check this repository's Issues page
