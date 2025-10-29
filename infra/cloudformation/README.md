# CloudFormation Deployment Guide

This directory contains AWS CloudFormation templates for deploying the Terraria server infrastructure.

## Templates

- `vpc.yaml` - VPC with public/private subnets, internet gateway, NAT gateway
- `rds.yaml` - PostgreSQL RDS instance with security groups and subnet groups
- `lambda.yaml` - Lambda function for EC2 instance management
- `ec2.yaml` - EC2 instance for Terraria server (optional, can be managed by Lambda)
- `master.yaml` - Main template that orchestrates all nested stacks

## Deployment Order

### Option 1: Using Master Stack (Recommended)

1. Upload all templates to an S3 bucket
2. Deploy the master stack which will create all resources:

```bash
aws cloudformation create-stack \
  --stack-name terraria-infrastructure \
  --template-body file://master.yaml \
  --parameters file://parameters.json \
  --capabilities CAPABILITY_IAM
```

### Option 2: Manual Stack Creation

Deploy in this order:

1. **VPC Stack**:
   ```bash
   aws cloudformation create-stack \
     --stack-name terraria-vpc \
     --template-body file://vpc.yaml
   ```

2. **RDS Stack**:
   ```bash
   aws cloudformation create-stack \
     --stack-name terraria-rds \
     --template-body file://rds.yaml \
     --parameters ParameterKey=VpcId,ParameterValue=<vpc-id> \
                  ParameterKey=PrivateSubnet1Id,ParameterValue=<subnet-id> \
                  ParameterKey=PrivateSubnet2Id,ParameterValue=<subnet-id> \
                  ParameterKey=DBPassword,ParameterValue=<secure-password>
   ```

3. **Lambda Stack**:
   ```bash
   aws cloudformation create-stack \
     --stack-name terraria-lambda \
     --template-body file://lambda.yaml \
     --parameters ParameterKey=VpcId,ParameterValue=<vpc-id> \
     --capabilities CAPABILITY_IAM
   ```

## AWS Console Deployment (AWS Academy)

For AWS Academy accounts with limited CLI access:

1. **Navigate to CloudFormation Console**:
   - Log in to AWS Console
   - Go to Services > CloudFormation

2. **Create Stack**:
   - Click "Create stack" > "With new resources"
   - Choose "Template is ready"
   - Upload template file (start with `vpc.yaml`)

3. **Specify Stack Details**:
   - Enter stack name (e.g., `terraria-vpc`)
   - Fill in required parameters

4. **Configure Stack Options**:
   - Add tags if needed
   - Keep default permissions

5. **Review and Create**:
   - Review all settings
   - Check "I acknowledge that AWS CloudFormation might create IAM resources"
   - Click "Create stack"

6. **Wait for Completion**:
   - Monitor stack creation in the Events tab
   - Once complete, go to Outputs tab for resource IDs
   - Use these IDs as parameters for the next stack

## Parameters File Example

Create `parameters.json`:

```json
{
  "Parameters": [
    {
      "ParameterKey": "Environment",
      "ParameterValue": "production"
    },
    {
      "ParameterKey": "DBPassword",
      "ParameterValue": "YourSecurePassword123!"
    },
    {
      "ParameterKey": "AllowedSSHCIDR",
      "ParameterValue": "0.0.0.0/0"
    }
  ]
}
```

## Cleanup

To delete all resources:

```bash
# Delete stacks in reverse order
aws cloudformation delete-stack --stack-name terraria-lambda
aws cloudformation delete-stack --stack-name terraria-rds
aws cloudformation delete-stack --stack-name terraria-vpc
```

Or if using master stack:

```bash
aws cloudformation delete-stack --stack-name terraria-infrastructure
```

## Monitoring

Check stack status:

```bash
aws cloudformation describe-stacks --stack-name terraria-vpc
```

List all stacks:

```bash
aws cloudformation list-stacks
```

## Troubleshooting

- **Stack creation failed**: Check the Events tab in CloudFormation console for error details
- **Access denied errors**: Ensure your IAM user/role has CloudFormation permissions
- **Resource conflicts**: Check if resources with the same name already exist
- **Parameter validation errors**: Verify all required parameters are provided and valid
