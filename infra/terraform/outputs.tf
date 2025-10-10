output "lambda_name"        { value = aws_lambda_function.ec2_manager.function_name }
output "lambda_arn"         { value = aws_lambda_function.ec2_manager.arn }
output "lambda_url"         { value = try(aws_lambda_function_url.public.function_url, "") }
output "security_group_id"  { value = aws_security_group.terraria.id }
output "subnet_id"          { value = aws_subnet.public_a.id }
