# แพ็กไฟล์จาก ../aws/lambda (index.ts ทำเป็น JS ก่อน หรือใส่ index.js ตรง ๆ)
# ถ้าใช้ ts แนะนำ build เป็น dist/index.js ก่อน แล้วชี้ไปที่ไฟล์นั้น
# ง่ายสุด dev แรกๆละวางไฟล์ index.js 

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

  environment {
    variables = {
      AWS_REGION        = var.region
      AMI_ID            = var.ami_id
      INSTANCE_TYPE     = var.instance_type
      SECURITY_GROUP_ID = aws_security_group.terraria.id
      SUBNET_ID         = aws_subnet.public_a.id
      KEY_NAME          = var.key_name
    }
  }

  depends_on = [aws_iam_role_policy_attachment.logs, aws_iam_role_policy_attachment.ec2_attach]
}

# (ออปชัน) เปิด Function URL เพื่อยิงผ่าน HTTPS (ถ้าไม่อยากใช้ SDK)
resource "aws_lambda_function_url" "public" {
  function_name      = aws_lambda_function.ec2_manager.function_name
  authorization_type = "NONE"
  cors {
    allow_origins = ["*"]
    allow_methods = ["POST", "OPTIONS"]
  }
}
