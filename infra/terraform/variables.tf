variable "project" {
  type        = string
  default     = "terrakit"
  description = "Project name for resource naming"
}

variable "region" {
  type        = string
  default     = "ap-southeast-1"
  description = "AWS region for resources"
}

variable "vpc_cidr" {
  type        = string
  default     = "10.0.0.0/16"
  description = "CIDR block for VPC"
}

variable "public_cidr" {
  type        = string
  default     = "10.0.1.0/24"
  description = "CIDR block for public subnet"
}

variable "private_cidr" {
  type        = string
  default     = "10.0.2.0/24"
  description = "CIDR block for private subnet"
}

# RDS Configuration
variable "enable_rds" {
  type        = bool
  default     = false
  description = "Enable RDS PostgreSQL database for production"
}

variable "rds_instance_class" {
  type        = string
  default     = "db.t3.micro"
  description = "RDS instance class"
}

variable "rds_allocated_storage" {
  type        = number
  default     = 20
  description = "Initial storage allocation for RDS in GB"
}

variable "rds_max_allocated_storage" {
  type        = number
  default     = 100
  description = "Maximum storage allocation for RDS in GB"
}

variable "rds_username" {
  type        = string
  default     = "postgres"
  description = "RDS master username"
}

variable "rds_password" {
  type        = string
  description = "RDS master password"
  sensitive   = true
}

variable "allow_rds_public_access" {
  type        = bool
  default     = false
  description = "Allow public access to RDS (not recommended for production)"
}

variable "rds_backup_retention_days" {
  type        = number
  default     = 7
  description = "Number of days to retain RDS backups"
}

variable "rds_deletion_protection" {
  type        = bool
  default     = true
  description = "Enable deletion protection for RDS"
}

variable "rds_skip_final_snapshot" {
  type        = bool
  default     = false
  description = "Skip final snapshot when deleting RDS instance"
}

# Security Group
variable "allow_terraria_cidr" {
  type        = string
  default     = "0.0.0.0/0"
  description = "CIDR block allowed to access Terraria servers"
}

variable "open_ssh" {
  type        = bool
  default     = false
  description = "Whether to allow SSH access"
}

# EC2 Parameters
variable "instance_type" {
  type        = string
  default     = "t3.small"
  description = "EC2 instance type for Terraria servers"
}

variable "key_name" {
  type        = string
  default     = ""
  description = "EC2 key pair name for SSH access (optional)"
}

# Lambda
variable "lambda_name" {
  type        = string
  default     = "terraria-ec2-manager"
  description = "Name for the Lambda function"
}

variable "lambda_timeout" {
  type        = number
  default     = 60
  description = "Lambda function timeout in seconds"
}
