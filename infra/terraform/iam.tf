data "aws_iam_policy_document" "lambda_assume" {
  statement {
    effect = "Allow"
    principals { type = "Service" identifiers = ["lambda.amazonaws.com"] }
    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "lambda_role" {
  name               = "${var.project}-lambda-role"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume.json
}

# CloudWatch Logs
resource "aws_iam_role_policy_attachment" "logs" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# EC2 control
data "aws_iam_policy_document" "ec2_access" {
  statement {
    effect = "Allow"
    actions = [
      "ec2:RunInstances", "ec2:StartInstances", "ec2:StopInstances",
      "ec2:TerminateInstances", "ec2:DescribeInstances", "ec2:CreateTags",
      "ec2:DescribeImages", "ec2:DescribeSubnets", "ec2:DescribeSecurityGroups",
      "ec2:DescribeInstanceStatus", "ec2:CreateNetworkInterface",
      "ec2:AttachNetworkInterface", "ec2:DeleteNetworkInterface", "ec2:DescribeNetworkInterfaces"
    ]
    resources = ["*"]
  }
}

resource "aws_iam_policy" "ec2_access" {
  name   = "${var.project}-lambda-ec2"
  policy = data.aws_iam_policy_document.ec2_access.json
}

resource "aws_iam_role_policy_attachment" "ec2_attach" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = aws_iam_policy.ec2_access.arn
}
