# โปรเจค Cloud Terraria - การใช้งาน AWS RDS

## ภาพรวมโปรเจค

Cloud Terraria เป็น Web Application สำหรับจัดการเซิร์ฟเวอร์เกม Terraria บน AWS Cloud โดยใช้ **AWS RDS PostgreSQL** เป็นฐานข้อมูลหลัก

## AWS Services ที่ใช้

### 1. AWS RDS (Relational Database Service) - หลัก
- **Database Engine**: PostgreSQL 15.4
- **Instance Type**: db.t3.micro (Free tier eligible)
- **Storage**: 20 GB gp3 (SSD)
- **Features**:
  - Automated Backups (7 วันย้อนหลัง)
  - Performance Insights (ติดตามประสิทธิภาพ)
  - CloudWatch Logs Integration
  - Encryption at Rest
  - Multi-AZ Support (สำหรับ High Availability)

### 2. AWS VPC (Virtual Private Cloud)
- สร้าง Isolated Network สำหรับ RDS
- Public Subnets: สำหรับ Internet Gateway
- Private Subnets: สำหรับ RDS Database (ไม่เปิด Public Access)
- NAT Gateway: สำหรับ Outbound Connection

### 3. AWS CloudFormation
- Infrastructure as Code (IaC)
- Template-based deployment
- Version control สำหรับ Infrastructure

### 4. AWS Secrets Manager
- เก็บ Database Credentials อย่างปลอดภัย
- Automatic rotation support

### 5. AWS Lambda (Optional)
- จัดการ EC2 Instances สำหรับ Terraria Server

## โครงสร้าง Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      AWS Cloud                          │
│                                                         │
│  ┌────────────────────────────────────────────────┐   │
│  │              VPC (10.0.0.0/16)                  │   │
│  │                                                 │   │
│  │  ┌──────────────────┐  ┌──────────────────┐  │   │
│  │  │  Public Subnet   │  │  Public Subnet   │  │   │
│  │  │  10.0.1.0/24     │  │  10.0.2.0/24     │  │   │
│  │  │  AZ-1            │  │  AZ-2            │  │   │
│  │  │                  │  │                  │  │   │
│  │  │  ┌─────────┐     │  │                  │  │   │
│  │  │  │   NAT   │     │  │                  │  │   │
│  │  │  │ Gateway │     │  │                  │  │   │
│  │  │  └─────────┘     │  │                  │  │   │
│  │  └──────────────────┘  └──────────────────┘  │   │
│  │           │                                   │   │
│  │  ┌──────────────────┐  ┌──────────────────┐  │   │
│  │  │  Private Subnet  │  │  Private Subnet  │  │   │
│  │  │  10.0.11.0/24    │  │  10.0.12.0/24    │  │   │
│  │  │  AZ-1            │  │  AZ-2            │  │   │
│  │  │                  │  │                  │  │   │
│  │  │  ┌────────────┐  │  │  ┌────────────┐  │  │   │
│  │  │  │    RDS     │  │  │  │    RDS     │  │  │   │
│  │  │  │ PostgreSQL │◄─┼──┼─►│  Standby   │  │  │   │
│  │  │  │  Primary   │  │  │  │ (Multi-AZ) │  │  │   │
│  │  │  └────────────┘  │  │  └────────────┘  │  │   │
│  │  └──────────────────┘  └──────────────────┘  │   │
│  │                                                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────┐          ┌──────────────────┐    │
│  │  Secrets        │          │  CloudWatch      │    │
│  │  Manager        │          │  Logs & Metrics  │    │
│  └─────────────────┘          └──────────────────┘    │
│                                                         │
└─────────────────────────────────────────────────────────┘
                            ▲
                            │
                    ┌───────┴────────┐
                    │   Next.js App  │
                    │   (Local/EC2)  │
                    └────────────────┘
```

## ขั้นตอนการ Deploy RDS

### วิธีที่ 1: ใช้ AWS Console (แนะนำสำหรับ AWS Academy)

#### 1. Deploy VPC
```
1. เข้า AWS Console → CloudFormation
2. Create Stack → Upload file: infra/cloudformation/vpc.yaml
3. Stack name: terraria-vpc
4. Parameters: ใช้ค่า default
5. Create Stack → รอ 5 นาที
6. เก็บ VPC ID จาก Outputs
```

#### 2. Deploy RDS
```
1. Create Stack → Upload file: infra/cloudformation/rds.yaml
2. Stack name: terraria-rds
3. Parameters:
   - VpcStackName: terraria-vpc
   - DBPassword: รหัสผ่านที่แข็งแรง (อย่างน้อย 8 ตัวอักษร)
   - DBInstanceClass: db.t3.micro
4. ✅ Check "I acknowledge that AWS CloudFormation might create IAM resources"
5. Create Stack → รอ 10-15 นาที
6. เก็บ DatabaseURL จาก Outputs
```

#### 3. เชื่อมต่อ Application
```bash
# อัพเดทไฟล์ .env
DATABASE_URL="postgresql://postgres:password@endpoint:5432/terraria"

# Run migrations
npx prisma migrate deploy

# Start application
pnpm dev
```

### วิธีที่ 2: ใช้ Script อัตโนมัติ

```bash
# Linux/Mac
chmod +x scripts/deploy-rds.sh
./scripts/deploy-rds.sh

# Windows
scripts\deploy-rds.bat
```

## ไฟล์สำคัญในโปรเจค

### CloudFormation Templates
- `infra/cloudformation/vpc.yaml` - สร้าง VPC และ Network Infrastructure
- `infra/cloudformation/rds.yaml` - สร้าง RDS PostgreSQL Database
- `infra/cloudformation/lambda.yaml` - สร้าง Lambda Function (optional)

### Documentation
- `RDS_QUICK_START.md` - คู่มือเริ่มต้นด่วน
- `RDS_DEPLOYMENT_GUIDE.md` - คู่มือ Deploy แบบละเอียด
- `README.md` - คู่มือหลักของโปรเจค
- `INFRASTRUCTURE.md` - อธิบายโครงสร้าง Infrastructure

### Deployment Scripts
- `scripts/deploy-rds.sh` - สคริปต์ Deploy สำหรับ Linux/Mac
- `scripts/deploy-rds.bat` - สคริปต์ Deploy สำหรับ Windows

### Database Schema
- `prisma/schema.prisma` - Schema ของฐานข้อมูล

## คุณสมบัติของ RDS ที่นำมาใช้

### 1. Automated Backups
- เก็บ Backup ย้อนหลัง 7 วัน
- Backup Window: 03:00-04:00 UTC
- Point-in-time Recovery
- Snapshot Management

### 2. Performance Insights
- Real-time Performance Monitoring
- Query Analysis
- Database Load Visualization
- 7-day Retention

### 3. CloudWatch Integration
- PostgreSQL Logs
- Error Logs
- Slow Query Logs
- Metrics (CPU, Memory, IOPS, Connections)

### 4. Security
- Private Subnet (ไม่เปิด Public Access)
- Security Group ควบคุม Access
- Encryption at Rest (AWS KMS)
- Encryption in Transit (SSL/TLS)
- Secrets Manager สำหรับ Credentials

### 5. High Availability
- Multi-AZ Deployment Option
- Automatic Failover
- Read Replica Support

### 6. Scalability
- Vertical Scaling (เปลี่ยน Instance Type)
- Storage Auto-scaling
- Read Replica สำหรับ Read-heavy Workload

## ข้อมูล Cost

### Free Tier (12 เดือนแรก)
- ✅ 750 ชั่วโมง/เดือน ของ db.t3.micro
- ✅ 20 GB Storage
- ✅ 20 GB Backup Storage
- **ราคา: ฟรี**

### หลัง Free Tier
- db.t3.micro: ~$15/เดือน (~450 บาท)
- Storage 20 GB gp3: ~$3/เดือน (~90 บาท)
- **รวม: ~$18/เดือน (~540 บาท)**

### Tips ประหยัดค่าใช้จ่าย
1. Stop Instance เมื่อไม่ใช้งาน (หยุดได้สูงสุด 7 วัน)
2. ใช้ Reserved Instance (ประหยัด 30-60%)
3. ลด Backup Retention Period
4. Monitor Storage Usage

## Screenshot ที่ต้องเตรียมส่ง

### 1. CloudFormation Stacks
- แสดง terraria-vpc และ terraria-rds สถานะ CREATE_COMPLETE

### 2. RDS Instance
- แสดงรายละเอียด Database Instance
- Engine: PostgreSQL 15.4
- Status: Available
- Storage: 20 GB gp3 Encrypted

### 3. RDS Configuration
- Instance Class: db.t3.micro
- Multi-AZ: Enabled/Disabled
- Automated Backups: Enabled
- Performance Insights: Enabled

### 4. Performance Insights Dashboard
- แสดง Real-time Performance Metrics
- Database Load Chart
- Top SQL Queries

### 5. Security Groups
- แสดง Inbound Rules (Port 5432 from Application SG)
- แสดง Outbound Rules

### 6. CloudFormation Template
- แสดง YAML Template ที่ใช้

### 7. Stack Outputs
- แสดง Database Endpoint
- แสดง Connection String

### 8. Application Connection
- Prisma Studio เชื่อมต่อกับ RDS
- หรือ Application Logs แสดงการเชื่อมต่อสำเร็จ

## การทดสอบและ Verification

### 1. ตรวจสอบ RDS Status
```bash
aws rds describe-db-instances \
  --db-instance-identifier production-terraria-db \
  --query 'DBInstances[0].[DBInstanceStatus,Endpoint.Address]'
```

### 2. ทดสอบการเชื่อมต่อ
```bash
# ใช้ Prisma
npx prisma db push

# ใช้ psql (ถ้าติดตั้งแล้ว)
psql -h endpoint.rds.amazonaws.com -U postgres -d terraria
```

### 3. ดูข้อมูลใน Prisma Studio
```bash
npx prisma studio
# เปิด Browser ที่ http://localhost:5555
```

### 4. ตรวจสอบ Metrics
```bash
aws cloudwatch get-metric-statistics \
  --namespace AWS/RDS \
  --metric-name CPUUtilization \
  --dimensions Name=DBInstanceIdentifier,Value=production-terraria-db \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average
```

## การลบ Resources (หลังส่งงาน)

### AWS Console
```
1. CloudFormation → Select terraria-rds → Delete
2. รอจนลบเสร็จ
3. Select terraria-vpc → Delete
```

### AWS CLI
```bash
aws cloudformation delete-stack --stack-name terraria-rds
aws cloudformation wait stack-delete-complete --stack-name terraria-rds

aws cloudformation delete-stack --stack-name terraria-vpc
aws cloudformation wait stack-delete-complete --stack-name terraria-vpc
```

## Checklist สำหรับส่งงาน

- [ ] Deploy VPC Stack สำเร็จ
- [ ] Deploy RDS Stack สำเร็จ
- [ ] RDS Instance สถานะ Available
- [ ] เชื่อมต่อ Application กับ RDS ได้
- [ ] Screenshot ครบทุกข้อ
- [ ] Documentation ครบถ้วน
- [ ] CloudFormation Templates
- [ ] Prisma Schema
- [ ] ประเมินค่าใช้จ่าย
- [ ] แสดง Features ที่ใช้ (Backups, Performance Insights, etc.)
- [ ] แสดง Security Configuration
- [ ] Application ทำงานกับ RDS ได้

## ข้อดีของการใช้ RDS

1. **Managed Service** - AWS จัดการ Infrastructure, Patching, Backups
2. **High Availability** - Multi-AZ Deployment, Automatic Failover
3. **Scalability** - ปรับขนาดได้ง่าย ทั้ง Vertical และ Horizontal
4. **Security** - Encryption, Security Groups, Private Subnets
5. **Monitoring** - Performance Insights, CloudWatch Integration
6. **Backup & Recovery** - Automated Backups, Point-in-time Recovery
7. **Cost-Effective** - Pay-as-you-go, Free Tier Available

## สรุป

โปรเจค Cloud Terraria นี้แสดงให้เห็นถึงการใช้งาน AWS RDS PostgreSQL ในการสร้าง Cloud-based Application โดย:

- ใช้ **CloudFormation** เป็น Infrastructure as Code
- Deploy **RDS PostgreSQL** ใน Private Subnet เพื่อความปลอดภัย
- เปิดใช้ **Performance Insights** สำหรับ Monitoring
- ตั้งค่า **Automated Backups** สำหรับ Data Protection
- ใช้ **Secrets Manager** สำหรับเก็บ Credentials
- ผสานกับ **Next.js Application** ผ่าน Prisma ORM

โปรเจคนี้พร้อมสำหรับการส่งเป็นงาน Cloud Computing และสามารถ Scale ได้จริงสำหรับ Production Use! 🚀
