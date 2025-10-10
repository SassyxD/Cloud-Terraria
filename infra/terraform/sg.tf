resource "aws_security_group" "terraria" {
  name        = "${var.project}-sg"
  description = "Allow Terraria and optional SSH"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "Terraria"
    from_port   = 7777
    to_port     = 7777
    protocol    = "tcp"
    cidr_blocks = [var.allow_terraria_cidr]
  }

  dynamic "ingress" {
    for_each = var.open_ssh ? [1] : []
    content {
      description = "SSH"
      from_port   = 22
      to_port     = 22
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
    }
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project}-sg" }
}
