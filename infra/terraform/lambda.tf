# Lambda function for EC2 management
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../../aws/lambda"
  output_path = "${path.module}/lambda.zip"
}

resource "aws_lambda_function" "ec2_manager" {
  function_name = var.lambda_name
  role          = aws_iam_role.lambda_role.arn
  runtime       = "nodejs20.x"
  handler       = "index.handler"
  filename      = data.archive_file.lambda_zip.output_path
  timeout       = var.lambda_timeout
  architectures = ["x86_64"]
  
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256

  environment {
    variables = {
      AWS_REGION        = var.region
      AMI_ID            = data.aws_ami.ubuntu.id
      INSTANCE_TYPE     = var.instance_type
      SECURITY_GROUP_ID = aws_security_group.terraria.id
      SUBNET_ID         = aws_subnet.public_a.id
      KEY_NAME          = var.key_name
      INSTANCE_PROFILE  = aws_iam_instance_profile.ec2_profile.name
    }
  }

  tags = {
    Name = "${var.project}-lambda-function"
  }

  depends_on = [aws_iam_role_policy_attachment.logs, aws_iam_role_policy_attachment.ec2_attach]
}

# Lambda Function URL for external access
resource "aws_lambda_function_url" "ec2_manager" {
  function_name      = aws_lambda_function.ec2_manager.function_name
  authorization_type = "NONE"

  cors {
    allow_credentials = false
    allow_origins     = ["*"]
    allow_methods     = ["POST", "OPTIONS"]
    allow_headers     = ["date", "keep-alive", "content-type"]
    expose_headers    = ["date", "keep-alive"]
    max_age          = 86400
  }
}
