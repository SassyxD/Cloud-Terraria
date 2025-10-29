# Terraform Variables Configuration
# AWS RDS Setup for Cloud Terraria

# Basic Configuration
project = "terraria"
region  = "ap-southeast-1"  # Bangkok, Thailand

# Enable RDS PostgreSQL
enable_rds = true

# RDS Instance Configuration
rds_instance_class          = "db.t3.micro"     # Free tier eligible
rds_allocated_storage       = 20                # GB - Initial storage
rds_max_allocated_storage   = 100               # GB - Auto-scaling limit
rds_username                = "postgres"
rds_password                = "Terraria2025!SecurePassword"  # CHANGE THIS!

# Security Settings
allow_rds_public_access     = false             # Keep RDS in private subnet
rds_deletion_protection     = true              # Prevent accidental deletion
rds_backup_retention_days   = 7                 # Keep backups for 7 days
rds_skip_final_snapshot     = false             # Create final snapshot on delete

# EC2 Configuration (for Terraria game servers)
instance_type               = "t3.small"
