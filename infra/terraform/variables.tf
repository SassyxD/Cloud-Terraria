variable "project"     { type = string  default = "terrakit" }
variable "region"      { type = string  default = "ap-southeast-1" }
variable "vpc_cidr"    { type = string  default = "10.0.0.0/16" }
variable "public_cidr" { type = string  default = "10.0.1.0/24" }

# Security Group
variable "allow_terraria_cidr" { type = string  default = "0.0.0.0/0" }
variable "open_ssh"            { type = bool    default = false }

# EC2 Parameters
variable "ami_id"         { type = string }  # Enter Ubuntu 22.04 AMI according to the region
variable "instance_type"  { type = string  default = "t3.small" }
variable "key_name"       { type = string  default = "vockey" } # Leave blank if not using SSH

# Lambda
variable "lambda_name"    { type = string  default = "terraria-ec2-manager" }
variable "lambda_timeout" { type = number  default = 60 }
