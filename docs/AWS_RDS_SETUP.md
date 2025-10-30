# AWS RDS Production Setup Guide

This guide helps you set up PostgreSQL on AWS RDS for production use with Cloud Terraria.

## Prerequisites

1. **Install Terraform**:
   ```powershell
   # Install via Chocolatey (recommended)
   choco install terraform
   
   # Or download from: https://www.terraform.io/downloads
   ```

2. **Configure AWS CLI**:
   ```powershell
   aws configure
   # Enter your AWS Access Key ID, Secret Access Key, region, and output format
   ```

## Deployment Steps

### 1. Enable RDS in Terraform

Create a `terraform.tfvars` file in `infra/terraform/`:

```hcl
# Basic Configuration
project = "terrakit"
region  = "us-east-1"  # Choose your preferred region

# Enable RDS
enable_rds = true

# RDS Configuration
rds_instance_class          = "db.t3.micro"     # Free tier eligible
rds_allocated_storage       = 20                # GB
rds_max_allocated_storage   = 100               # GB
rds_username               = "postgres"
rds_password               = "YourSecurePassword123!"  # Change this!

# Security (recommended for production)
allow_rds_public_access    = false              # Keep private
rds_deletion_protection    = true               # Prevent accidental deletion
rds_backup_retention_days  = 7                  # 7 days backup retention
```

### 2. Deploy Infrastructure

```powershell
cd infra/terraform

# Initialize Terraform
terraform init

# Plan deployment (review changes)
terraform plan

# Apply changes
terraform apply
```

### 3. Get RDS Connection Details

After deployment, get the RDS endpoint:

```powershell
terraform output rds_endpoint
terraform output rds_connection_string
```

### 4. Update Environment Variables

Update your `.env` file with the RDS connection string:

```env
# Replace with your actual RDS endpoint
DATABASE_URL="postgresql://postgres:YourSecurePassword123!@terrakit-database.xyz.us-east-1.rds.amazonaws.com:5432/terrakit"
```

### 5. Run Database Migrations

```powershell
cd d:\terraria

# Generate Prisma client for PostgreSQL
npx prisma generate

# Run migrations to create tables
npx prisma migrate dev --name "init"

# Alternatively, push schema directly
npx prisma db push
```

## Security Best Practices

### Network Security
- RDS is placed in a private subnet
- Only Lambda and EC2 instances can access the database
- No public internet access by default

### Access Control
- Use strong passwords (20+ characters)
- Enable deletion protection
- Regular automated backups
- Encryption at rest enabled

### Monitoring
- Performance Insights enabled
- CloudWatch monitoring
- Backup retention configured

## Cost Optimization

### Development
```hcl
# Minimal cost for development
rds_instance_class = "db.t3.micro"  # Free tier
rds_allocated_storage = 20          # Minimum
enable_rds = false                  # Use SQLite locally
```

### Production
```hcl
# Optimized for production
rds_instance_class = "db.t3.small"          # Better performance
rds_allocated_storage = 50                  # More storage
rds_max_allocated_storage = 200             # Auto-scaling
rds_backup_retention_days = 30              # Longer retention
```

## Troubleshooting

### Connection Issues
1. **Check Security Groups**: Ensure Lambda and EC2 can reach RDS
2. **Verify Endpoint**: Use the correct RDS endpoint from Terraform output
3. **Test Connection**: Use a PostgreSQL client to test connectivity

### Migration Issues
```powershell
# Reset and recreate schema
npx prisma migrate reset

# Force push schema changes
npx prisma db push --force-reset
```

### Performance Issues
- Monitor Performance Insights in AWS Console
- Check CloudWatch metrics for CPU and connections
- Consider upgrading instance class if needed

## Alternative: AWS RDS Serverless

For variable workloads, consider Aurora Serverless:

```hcl
# In variables.tf, add:
variable "use_aurora_serverless" {
  type    = bool
  default = false
}

# In rds.tf, replace aws_db_instance with:
resource "aws_rds_cluster" "aurora_serverless" {
  count = var.use_aurora_serverless ? 1 : 0
  
  engine             = "aurora-postgresql"
  engine_mode        = "serverless"
  database_name      = var.project
  master_username    = var.rds_username
  master_password    = var.rds_password
  
  scaling_configuration {
    auto_pause               = true
    max_capacity             = 2
    min_capacity             = 1
    seconds_until_auto_pause = 300
  }
}
```

This automatically scales based on usage and pauses when inactive, reducing costs significantly.