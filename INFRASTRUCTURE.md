# Repository Structure Update

## Branch Organization

This repository now has two separate branches for infrastructure management:

### 1. **main** (Current Branch)
- Uses **AWS CloudFormation** for infrastructure deployment
- Recommended for:
  - AWS Academy accounts (Console-based deployment)
  - Users who prefer CloudFormation
  - Simpler deployment workflow via AWS Console
- Location: `infra/cloudformation/`

### 2. **terraform-infrastructure**
- Uses **Terraform** for infrastructure deployment
- Recommended for:
  - Production AWS accounts with full IAM permissions
  - Teams familiar with Terraform
  - Automated CI/CD pipelines
- Location: `infra/terraform/`

## Why Two Approaches?

AWS Academy accounts have IAM restrictions that prevent API-based infrastructure tools like Terraform from working properly. CloudFormation templates can be deployed manually through the AWS Console, making them more suitable for educational accounts.

## Switching Between Branches

### To use CloudFormation (main branch):
```bash
git checkout main
cd infra/cloudformation
# Follow README.md for deployment instructions
```

### To use Terraform (terraform-infrastructure branch):
```bash
git checkout terraform-infrastructure
cd infra/terraform
terraform init
terraform plan
terraform apply
```

## Infrastructure Comparison

Both approaches deploy the same infrastructure:
- VPC with public and private subnets
- RDS PostgreSQL database
- Lambda function for EC2 management
- Security groups and IAM roles
- EC2 instances for Terraria servers

## Getting Started

1. **Choose your deployment method**:
   - CloudFormation → Stay on `main` branch
   - Terraform → Switch to `terraform-infrastructure` branch

2. **Follow the appropriate README**:
   - CloudFormation: `infra/cloudformation/README.md`
   - Terraform: `infra/terraform/README.md`

3. **Deploy infrastructure and run the application**:
   ```bash
   # After infrastructure deployment
   cp .env.example .env
   # Update .env with your infrastructure outputs
   pnpm install
   npx prisma migrate dev
   pnpm dev
   ```

## Documentation

- Main README: `README.md`
- CloudFormation Guide: `infra/cloudformation/README.md`
- AWS Academy Setup: `AWS_ACADEMY_RDS_GUIDE.md`
- Quick Start: `QUICK_START.md`

## Questions?

If you're unsure which approach to use:
- **AWS Academy student?** → Use CloudFormation (main branch)
- **Production deployment?** → Use Terraform (terraform-infrastructure branch)
- **Just testing locally?** → No infrastructure needed, use SQLite
