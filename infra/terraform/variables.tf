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
