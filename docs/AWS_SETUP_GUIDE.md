# AWS Credentials Setup Guide

## 🔐 Complete AWS Setup for Cloud Terraria

### Step 1: Install AWS CLI (Current Status)

The AWS CLI installation via winget was started. Let's complete the setup:

1. **Close all PowerShell windows** and open a new one
2. **Test installation**: 
   ```powershell
   aws --version
   ```

If it still doesn't work, download manually:
- **Download**: https://awscli.amazonaws.com/AWSCLIV2.msi  
- **Install**: Run the MSI installer
- **Restart**: Open new PowerShell window

### Step 2: Create AWS Account and Get Credentials

#### Option A: Create New AWS Account (Recommended)
1. Go to https://aws.amazon.com/
2. Click "Create an AWS Account" 
3. **Free Tier Benefits**:
   - EC2 t3.micro: 750 hours/month FREE
   - RDS t3.micro: 750 hours/month FREE
   - Lambda: 1M requests/month FREE
   - Perfect for your Terraria project!

#### Option B: Use Existing AWS Account
1. Log into AWS Console: https://console.aws.amazon.com/

### Step 3: Create IAM User for Terraform

**⚠️ Important**: Don't use root account for operations.

1. **Go to IAM**: https://console.aws.amazon.com/iam/
2. **Users** → **"Create user"**
3. **Username**: `terraria-terraform`
4. **Access type**: "Programmatic access" 
5. **Permissions** - Attach policies:
   - `AmazonEC2FullAccess`
   - `AmazonRDSFullAccess` 
   - `AWSLambdaFullAccess`
   - `IAMFullAccess`
   - `AmazonVPCFullAccess`
6. **📋 SAVE**: Access Key ID & Secret Access Key

### Step 4: Configure AWS CLI

```powershell
# Configure credentials
aws configure
```

Enter when prompted:
- **AWS Access Key ID**: [From Step 3]
- **AWS Secret Access Key**: [From Step 3]  
- **Default region**: `us-east-1`
- **Output format**: `json`

### Step 5: Verify Setup

```powershell
# Test connection
aws sts get-caller-identity

# Should return your account info
```

### Step 6: Deploy Infrastructure

```powershell
# Navigate to terraform
cd d:\terraria\infra\terraform

# Validate configuration
.\terraform.exe validate

# See what will be created
.\terraform.exe plan

# For production, create terraform.tfvars:
# enable_rds = true
# rds_password = "YourSecurePassword123!"

# Deploy (when ready)
.\terraform.exe apply
```

## Step 2: Configure AWS Credentials

You need AWS credentials with the following permissions:
- EC2 full access
- Lambda full access
- IAM role creation
- VPC management

### Option A: AWS CLI Configuration
```bash
aws configure
```
Enter your:
- AWS Access Key ID
- AWS Secret Access Key  
- Default region (use: ap-southeast-1)
- Default output format (use: json)

### Option B: Environment Variables
Update your `.env` file with:
```
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key" 
AWS_REGION="ap-southeast-1"
```

## Step 3: Deploy Infrastructure

### Navigate to Terraform directory
```bash
cd infra/terraform
```

### Initialize Terraform
```bash
terraform init
```

### Plan the deployment
```bash
terraform plan
```

### Deploy the infrastructure
```bash
terraform apply
```
Type `yes` when prompted.

## Step 4: Update Environment Variables

After deployment, Terraform will output:
- Lambda function URL
- Lambda function name

Update your `.env` file:
```
AWS_LAMBDA_FUNCTION_NAME="terrakit-terraria-ec2-manager"
```

## Step 5: Test Server Creation

1. Start your development server: `npm run dev`
2. Go to http://localhost:3000
3. Sign in with Discord
4. Click "Create New Server"
5. Fill in server details
6. Click "Create Server"

## Infrastructure Components

The Terraform deployment creates:

### Networking
- **VPC**: Virtual Private Cloud for isolated network
- **Subnet**: Public subnet for EC2 instances
- **Internet Gateway**: For internet access
- **Security Group**: Firewall rules for Terraria (port 7777)

### Compute & Lambda
- **Lambda Function**: Manages EC2 lifecycle (create/start/stop/terminate)
- **IAM Roles**: Permissions for Lambda to manage EC2
- **EC2 Instance Profile**: For Terraria servers

### Outputs
- Lambda function URL for API calls
- VPC and subnet IDs
- Security group ID

## Troubleshooting

### Common Issues

1. **Permission Denied**
   - Ensure AWS credentials have required permissions
   - Check IAM policies

2. **Region Mismatch**
   - Ensure all configurations use same region (ap-southeast-1)

3. **Terraform Errors**
   - Run `terraform plan` to see what will be created
   - Check for resource conflicts

4. **Lambda Function Not Found**
   - Verify AWS_LAMBDA_FUNCTION_NAME in .env
   - Check if deployment completed successfully

### Get Terraform Outputs
```bash
cd infra/terraform
terraform output
```

This will show:
- `lambda_function_url`: The API endpoint
- `lambda_function_name`: Function name for .env

## Cost Estimation

### Per Terraria Server:
- **EC2 t3.small**: ~$15/month (if running 24/7)
- **Lambda**: ~$0.01 per server operation
- **VPC**: Free tier eligible

### Optimization:
- Stop servers when not in use (saves ~90% of EC2 costs)
- Use t3.nano for smaller servers (~$4/month)

## Security Notes

- Security group only allows Terraria port (7777)
- EC2 instances in public subnet (required for player access)
- IAM roles follow least-privilege principle
- Lambda function has minimal required permissions

## Next Steps After Setup

1. **Test server creation** through the web interface
2. **Monitor costs** in AWS console
3. **Set up server auto-shutdown** for cost optimization
4. **Configure backups** for world saves (optional)

## Support

If you encounter issues:
1. Check AWS CloudWatch logs for Lambda errors
2. Verify EC2 instances are launching in AWS console
3. Test Lambda function directly in AWS console
4. Check Terraform state: `terraform show`

---

Your Cloud Terraria infrastructure will be production-ready after following these steps!