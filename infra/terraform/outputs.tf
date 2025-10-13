output "lambda_function_name" {
  description = "Name of the Lambda function"
  value       = aws_lambda_function.ec2_manager.function_name
}

output "lambda_function_url" {
  description = "URL endpoint for Lambda function"
  value       = aws_lambda_function_url.ec2_manager.function_url
}

output "lambda_arn" {
  description = "ARN of the Lambda function"
  value       = aws_lambda_function.ec2_manager.arn
}

output "security_group_id" {
  description = "ID of the Terraria security group"
  value       = aws_security_group.terraria.id
}

output "subnet_id" {
  description = "ID of the public subnet"
  value       = aws_subnet.public_a.id
}

output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.main.id
}

output "ubuntu_ami_id" {
  description = "ID of the Ubuntu AMI being used"
  value       = data.aws_ami.ubuntu.id
}
