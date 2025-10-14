# RDS Subnet Group
resource "aws_db_subnet_group" "terraria" {
  name       = "${var.project}-db-subnet-group"
  subnet_ids = [aws_subnet.public_a.id, aws_subnet.private.id]

  tags = {
    Name = "${var.project}-db-subnet-group"
  }
}

# RDS Security Group
resource "aws_security_group" "rds" {
  name_prefix = "${var.project}-rds-"
  vpc_id      = aws_vpc.main.id

  # Allow PostgreSQL access from Lambda and EC2
  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.lambda.id, aws_security_group.terraria.id]
  }

  # Allow access from your local development environment (optional)
  dynamic "ingress" {
    for_each = var.allow_rds_public_access ? [1] : []
    content {
      from_port   = 5432
      to_port     = 5432
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

  tags = {
    Name = "${var.project}-rds-sg"
  }
}

# RDS Instance
resource "aws_db_instance" "terraria" {
  count = var.enable_rds ? 1 : 0

  identifier = "${var.project}-database"

  # Engine configuration
  engine         = "postgres"
  engine_version = "15.4"
  instance_class = var.rds_instance_class

  # Storage configuration
  allocated_storage     = var.rds_allocated_storage
  max_allocated_storage = var.rds_max_allocated_storage
  storage_type          = "gp3"
  storage_encrypted     = true

  # Database configuration
  db_name  = var.project
  username = var.rds_username
  password = var.rds_password

  # Network configuration
  db_subnet_group_name   = aws_db_subnet_group.terraria.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = var.allow_rds_public_access

  # Backup configuration
  backup_retention_period = var.rds_backup_retention_days
  backup_window          = "03:00-04:00"
  maintenance_window     = "Sun:04:00-Sun:05:00"

  # Performance and monitoring
  performance_insights_enabled = true
  monitoring_interval         = 60
  monitoring_role_arn        = aws_iam_role.rds_monitoring[0].arn

  # Security
  deletion_protection = var.rds_deletion_protection
  skip_final_snapshot = var.rds_skip_final_snapshot

  tags = {
    Name = "${var.project}-database"
  }
}

# IAM role for RDS monitoring
resource "aws_iam_role" "rds_monitoring" {
  count = var.enable_rds ? 1 : 0

  name = "${var.project}-rds-monitoring-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "monitoring.rds.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "rds_monitoring" {
  count = var.enable_rds ? 1 : 0

  role       = aws_iam_role.rds_monitoring[0].name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}