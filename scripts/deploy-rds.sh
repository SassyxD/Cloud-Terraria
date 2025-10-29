#!/bin/bash

# Deploy RDS Infrastructure for Cloud Terraria
# This script automates the deployment of VPC and RDS using CloudFormation

set -e

echo "=========================================="
echo "Cloud Terraria - RDS Deployment Script"
echo "=========================================="
echo ""

# Configuration
STACK_PREFIX="terraria"
REGION=${AWS_REGION:-ap-southeast-1}
ENVIRONMENT=${ENVIRONMENT:-production}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

check_aws_cli() {
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed. Please install it first."
        exit 1
    fi
    print_success "AWS CLI is installed"
}

check_jq() {
    if ! command -v jq &> /dev/null; then
        print_info "jq is not installed. Output formatting will be limited."
        return 1
    fi
    print_success "jq is installed"
    return 0
}

wait_for_stack() {
    local stack_name=$1
    local operation=$2
    
    print_info "Waiting for stack $stack_name to complete $operation..."
    
    aws cloudformation wait stack-${operation}-complete \
        --stack-name "$stack_name" \
        --region "$REGION" 2>&1 || {
        print_error "Stack $stack_name $operation failed"
        echo ""
        echo "Stack events:"
        aws cloudformation describe-stack-events \
            --stack-name "$stack_name" \
            --region "$REGION" \
            --max-items 10 \
            --query 'StackEvents[?ResourceStatus==`CREATE_FAILED` || ResourceStatus==`UPDATE_FAILED`].[LogicalResourceId,ResourceStatusReason]' \
            --output table
        exit 1
    }
    
    print_success "Stack $stack_name $operation completed"
}

get_stack_outputs() {
    local stack_name=$1
    aws cloudformation describe-stacks \
        --stack-name "$stack_name" \
        --region "$REGION" \
        --query 'Stacks[0].Outputs' \
        --output json
}

# Main deployment
main() {
    echo "Configuration:"
    echo "  Region: $REGION"
    echo "  Environment: $ENVIRONMENT"
    echo "  Stack Prefix: $STACK_PREFIX"
    echo ""
    
    # Check prerequisites
    check_aws_cli
    HAS_JQ=$(check_jq && echo "yes" || echo "no")
    
    # Navigate to cloudformation directory
    cd "$(dirname "$0")/../infra/cloudformation" || exit 1
    
    # Get database password
    echo ""
    read -sp "Enter database password (min 8 characters): " DB_PASSWORD
    echo ""
    
    if [ ${#DB_PASSWORD} -lt 8 ]; then
        print_error "Password must be at least 8 characters"
        exit 1
    fi
    
    # Step 1: Deploy VPC
    echo ""
    echo "=========================================="
    echo "Step 1: Deploying VPC Infrastructure"
    echo "=========================================="
    
    VPC_STACK_NAME="${STACK_PREFIX}-vpc"
    
    print_info "Creating VPC stack: $VPC_STACK_NAME"
    
    aws cloudformation create-stack \
        --stack-name "$VPC_STACK_NAME" \
        --template-body file://vpc.yaml \
        --parameters \
            ParameterKey=Environment,ParameterValue="$ENVIRONMENT" \
        --region "$REGION" \
        --tags \
            Key=Project,Value=CloudTerraria \
            Key=Environment,Value="$ENVIRONMENT" \
            Key=ManagedBy,Value=Script
    
    wait_for_stack "$VPC_STACK_NAME" "create"
    
    # Get VPC outputs
    VPC_OUTPUTS=$(get_stack_outputs "$VPC_STACK_NAME")
    
    if [ "$HAS_JQ" = "yes" ]; then
        VPC_ID=$(echo "$VPC_OUTPUTS" | jq -r '.[] | select(.OutputKey=="VPC") | .OutputValue')
        print_success "VPC ID: $VPC_ID"
    fi
    
    # Step 2: Deploy RDS
    echo ""
    echo "=========================================="
    echo "Step 2: Deploying RDS Database"
    echo "=========================================="
    
    RDS_STACK_NAME="${STACK_PREFIX}-rds"
    
    print_info "Creating RDS stack: $RDS_STACK_NAME"
    print_info "This will take 10-15 minutes..."
    
    aws cloudformation create-stack \
        --stack-name "$RDS_STACK_NAME" \
        --template-body file://rds.yaml \
        --parameters \
            ParameterKey=Environment,ParameterValue="$ENVIRONMENT" \
            ParameterKey=VpcStackName,ParameterValue="$VPC_STACK_NAME" \
            ParameterKey=DBName,ParameterValue=terraria \
            ParameterKey=DBUsername,ParameterValue=postgres \
            ParameterKey=DBPassword,ParameterValue="$DB_PASSWORD" \
            ParameterKey=DBInstanceClass,ParameterValue=db.t3.micro \
            ParameterKey=DBAllocatedStorage,ParameterValue=20 \
            ParameterKey=EnablePerformanceInsights,ParameterValue=true \
            ParameterKey=MultiAZ,ParameterValue=false \
        --region "$REGION" \
        --tags \
            Key=Project,Value=CloudTerraria \
            Key=Environment,Value="$ENVIRONMENT" \
            Key=Component,Value=Database \
            Key=ManagedBy,Value=Script
    
    wait_for_stack "$RDS_STACK_NAME" "create"
    
    # Get RDS outputs
    RDS_OUTPUTS=$(get_stack_outputs "$RDS_STACK_NAME")
    
    echo ""
    echo "=========================================="
    echo "Deployment Complete!"
    echo "=========================================="
    echo ""
    
    if [ "$HAS_JQ" = "yes" ]; then
        DB_ENDPOINT=$(echo "$RDS_OUTPUTS" | jq -r '.[] | select(.OutputKey=="DBEndpoint") | .OutputValue')
        DB_PORT=$(echo "$RDS_OUTPUTS" | jq -r '.[] | select(.OutputKey=="DBPort") | .OutputValue')
        DB_URL=$(echo "$RDS_OUTPUTS" | jq -r '.[] | select(.OutputKey=="DatabaseURL") | .OutputValue')
        
        print_success "Database Endpoint: $DB_ENDPOINT"
        print_success "Database Port: $DB_PORT"
        echo ""
        echo "Add this to your .env file:"
        echo "DATABASE_URL=\"$DB_URL\""
    else
        echo "Stack outputs:"
        echo "$RDS_OUTPUTS"
    fi
    
    echo ""
    echo "Next steps:"
    echo "1. Update your .env file with the DATABASE_URL above"
    echo "2. Run: npx prisma migrate deploy"
    echo "3. Run: pnpm dev"
    echo ""
    print_success "All resources deployed successfully!"
}

# Run main function
main
