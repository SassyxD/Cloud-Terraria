# AWS Infrastructure Setup Guide

Your Cloud Terraria frontend is ready, but you need to deploy the AWS infrastructure to make server creation functional. Follow these steps:

## Prerequisites

1. **AWS Account** with programmatic access
2. **Terraform** installed on your machine
3. **AWS CLI** configured with your credentials

## Step 1: Install Required Tools

### Install Terraform
- **Windows**: Download from https://terraform.io/downloads
- **macOS**: `brew install terraform`
- **Linux**: Use package manager or download binary

### Install AWS CLI
- Download from https://aws.amazon.com/cli/
- Configure with: `aws configure`

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