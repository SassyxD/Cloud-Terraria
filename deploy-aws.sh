#!/bin/bash

# Cloud Terraria AWS Infrastructure Deployment Script
# This script deploys the complete AWS infrastructure for Cloud Terraria

set -e  # Exit on any error

echo "Cloud Terraria Infrastructure Deployment"
echo "==========================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "Error: Please run this script from the project root directory"
    exit 1
fi

# Check if Terraform is installed
if ! command -v terraform &> /dev/null; then
    echo "Error: Terraform is not installed"
    echo "Please install Terraform: https://terraform.io/downloads"
    exit 1
fi

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "Error: AWS credentials not configured"
    echo "Please run: aws configure"
    exit 1
fi

echo "Prerequisites check passed"

# Navigate to Terraform directory
cd infra/terraform

# Initialize Terraform
echo "Initializing Terraform..."
terraform init

# Validate configuration
echo "Validating Terraform configuration..."
terraform validate

# Plan deployment
echo "Planning deployment..."
terraform plan -out=tfplan

# Ask for confirmation
read -p "Do you want to deploy this infrastructure? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Deployment cancelled"
    exit 0
fi

# Apply the plan
echo "Deploying infrastructure..."
terraform apply tfplan

# Get outputs
echo ""
echo "Deployment completed successfully!"
echo ""
echo "Infrastructure Details:"
echo "========================="

# Extract outputs
LAMBDA_NAME=$(terraform output -raw lambda_function_name)
LAMBDA_URL=$(terraform output -raw lambda_function_url)
VPC_ID=$(terraform output -raw vpc_id)
SUBNET_ID=$(terraform output -raw subnet_id)

echo "Lambda Function Name: $LAMBDA_NAME"
echo "Lambda Function URL:  $LAMBDA_URL"
echo "VPC ID:              $VPC_ID"
echo "Subnet ID:           $SUBNET_ID"

# Navigate back to project root
cd ../..

# Update .env file
echo ""
echo "Updating .env file..."

# Backup existing .env
cp .env .env.backup

# Update AWS_LAMBDA_FUNCTION_NAME in .env
if grep -q "^AWS_LAMBDA_FUNCTION_NAME=" .env; then
    sed -i "s/^AWS_LAMBDA_FUNCTION_NAME=.*/AWS_LAMBDA_FUNCTION_NAME=\"$LAMBDA_NAME\"/" .env
else
    echo "AWS_LAMBDA_FUNCTION_NAME=\"$LAMBDA_NAME\"" >> .env
fi

echo "Environment updated with Lambda function name"

echo ""
echo "Setup Complete!"
echo "=================="
echo ""
echo "Your Cloud Terraria infrastructure is now deployed and ready to use!"
echo ""
echo "Next Steps:"
echo "1. Start your development server: npm run dev"
echo "2. Open http://localhost:3000 in your browser"
echo "3. Sign in with Discord"
echo "4. Create your first Terraria server!"
echo ""
echo "Tips:"
echo "- Your .env file has been updated with the Lambda function name"
echo "- Server creation will now work with real AWS infrastructure"
echo "- Monitor costs in the AWS console"
echo "- Stop servers when not in use to save money"
echo ""
echo "Need help? Check AWS_SETUP_GUIDE.md for troubleshooting"