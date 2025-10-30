# 🗄️ การย้าย Database ไป AWS RDS

## ขั้นตอนการตั้งค่า (ใช้เวลาประมาณ 10-15 นาที)

### 1️⃣ เตรียม AWS Credentials

ถ้ายังไม่มี AWS CLI ให้ติดตั้งก่อน:
```powershell
# ติดตั้ง AWS CLI
# Download: https://awscli.amazonaws.com/AWSCLIV2.msi

# ตั้งค่า credentials
aws configure
```

ใส่ข้อมูล:
- **AWS Access Key ID**: [จาก IAM User]
- **AWS Secret Access Key**: [จาก IAM User]
- **Default region**: ap-southeast-1 (หรือ region ที่ต้องการ)
- **Default output format**: json

### 2️⃣ สร้างไฟล์ terraform.tfvars

```powershell
cd d:\terraria\infra\terraform

# Copy ไฟล์ตัวอย่าง
copy terraform.tfvars.example terraform.tfvars

# แก้ไขไฟล์ terraform.tfvars
notepad terraform.tfvars
```

**สิ่งที่ต้องเปลี่ยน:**
```hcl
# ⚠️ สำคัญ: เปลี่ยนรหัสผ่านนี้!
rds_password = "YourStrongPassword123!@#"

# เลือก region ที่ใกล้คุณที่สุด
region = "ap-southeast-1"  # Bangkok, Thailand
# หรือ
# region = "ap-northeast-1"  # Tokyo, Japan
# region = "us-west-2"       # Oregon, USA
```

### 3️⃣ Deploy RDS ด้วย Terraform

```powershell
cd d:\terraria\infra\terraform

# ตรวจสอบว่า Terraform พร้อมใช้งาน
.\terraform.exe validate

# ดูว่าจะสร้างอะไรบ้าง (ไม่มีผลกระทบจริง)
.\terraform.exe plan

# สร้าง RDS (ใช้เวลา 5-10 นาที)
.\terraform.exe apply
# พิมพ์ 'yes' เพื่อยืนยัน
```

### 4️⃣ รับ Database Connection String

หลัง Terraform สร้าง RDS เสร็จ:

```powershell
# ดู connection string
.\terraform.exe output rds_connection_string

# หรือดู endpoint
.\terraform.exe output rds_endpoint
```

ผลลัพธ์จะได้:
```
rds_endpoint = "terraria-database.xyz123.ap-southeast-1.rds.amazonaws.com:5432"
rds_connection_string = "postgresql://postgres:YourPassword@terraria-database.xyz123.ap-southeast-1.rds.amazonaws.com:5432/terraria"
```

### 5️⃣ อัปเดต .env

คัดลอก connection string และใส่ใน `.env`:

```env
# เปลี่ยนจาก SQLite
# DATABASE_URL="file:./dev.db"

# เป็น RDS PostgreSQL
DATABASE_URL="postgresql://postgres:YourPassword@terraria-database.xyz123.ap-southeast-1.rds.amazonaws.com:5432/terraria"
```

### 6️⃣ Migrate Database

```powershell
cd d:\terraria

# Generate Prisma Client
npx prisma generate

# สร้าง tables บน RDS
npx prisma db push

# หรือใช้ migration (recommended for production)
npx prisma migrate deploy
```

### 7️⃣ ทดสอบ

```powershell
# Restart dev server
npm run dev

# ลองเข้าไปที่
http://localhost:3000
```

Login และลองสร้าง server ใหม่ - ข้อมูลจะถูกเก็บใน RDS แล้ว!

---

## 🔍 ตรวจสอบว่าใช้งาน RDS แล้ว

เปิด Prisma Studio:
```powershell
npx prisma studio
```

จะเห็น connection ไป RDS แทน SQLite

---

## 💰 ประมาณการค่าใช้จ่าย

### Free Tier (12 เดือนแรก)
- **db.t3.micro**: ฟรี 750 ชั่วโมง/เดือน
- **Storage**: ฟรี 20 GB
- **Backup**: ฟรี 20 GB
- **รวม**: $0/เดือน (ถ้าใช้ไม่เกิน free tier)

### หลังจาก Free Tier
- **db.t3.micro**: ~$15-20/เดือน
- **Storage (20GB)**: ~$2-3/เดือน
- **Backup**: ~$1-2/เดือน
- **รวม**: ~$18-25/เดือน

### วิธีประหยัด
1. **ใช้ Free Tier 12 เดือน** ถ้าเป็น AWS account ใหม่
2. **Stop instance เมื่อไม่ใช้** (dev/staging)
3. **ใช้ Aurora Serverless** สำหรับ hobby projects

---

## 🔐 ความปลอดภัย

### ที่เราตั้งค่าให้แล้ว ✅

- **Private Subnet**: RDS อยู่ใน private network
- **Security Group**: อนุญาตเฉพาะ Lambda และ EC2 เข้าถึง
- **Encryption**: Data encrypted at rest
- **Auto Backups**: Backup ทุกวันเวลา 03:00-04:00 UTC
- **Deletion Protection**: ป้องกันการลบโดยไม่ตั้งใจ

### แนะนำเพิ่มเติม

1. **เปลี่ยนรหัสผ่านเป็นประจำ**
2. **ใช้ AWS Secrets Manager** สำหรับเก็บรหัสผ่าน
3. **Enable Multi-AZ** สำหรับ production
4. **ตั้ง CloudWatch Alarms** สำหรับ monitoring

---

## 🛠️ Troubleshooting

### ไม่สามารถเชื่อมต่อ RDS
```powershell
# ตรวจสอบ security group
aws ec2 describe-security-groups --filters "Name=tag:Name,Values=terraria-rds-sg"

# ตรวจสอบ RDS status
aws rds describe-db-instances --db-instance-identifier terraria-database
```

### Migration ล้มเหลว
```powershell
# Reset และลองใหม่
npx prisma migrate reset
npx prisma db push --force-reset
```

### Connection timeout
- ตรวจสอบว่า `DATABASE_URL` ถูกต้อง
- ตรวจสอบว่า RDS status = `available`
- ลองเพิ่ม `?connect_timeout=10` ใน connection string

---

## 🔄 การ Backup และ Restore

### Auto Backup (ตั้งค่าไว้แล้ว)
- Backup ทุกวันเวลา 03:00-04:00 UTC
- เก็บไว้ 7 วัน
- สามารถ restore ย้อนหลังได้

### Manual Backup
```powershell
# สร้าง snapshot
aws rds create-db-snapshot \
  --db-instance-identifier terraria-database \
  --db-snapshot-identifier terraria-backup-$(date +%Y%m%d)
```

### Restore จาก Snapshot
```powershell
# ดู snapshots ที่มี
aws rds describe-db-snapshots \
  --db-instance-identifier terraria-database

# Restore
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier terraria-database-restored \
  --db-snapshot-identifier terraria-backup-20251030
```

---

## 📊 Monitoring

### AWS Console
- ไปที่ **RDS** → **Databases** → **terraria-database**
- ดู **Monitoring** tab สำหรับ:
  - CPU utilization
  - Database connections
  - Free storage space
  - Read/Write IOPS

### CloudWatch Metrics
```powershell
# CPU usage
aws cloudwatch get-metric-statistics \
  --namespace AWS/RDS \
  --metric-name CPUUtilization \
  --dimensions Name=DBInstanceIdentifier,Value=terraria-database \
  --start-time 2025-10-30T00:00:00Z \
  --end-time 2025-10-30T23:59:59Z \
  --period 3600 \
  --statistics Average
```

---

## 🗑️ การลบ RDS (ถ้าต้องการ)

⚠️ **คำเตือน**: การลบจะทำให้ข้อมูลหายถาวร!

```powershell
cd d:\terraria\infra\terraform

# แก้ไข terraform.tfvars
# enable_rds = false

# หรือลบทั้งหมด
.\terraform.exe destroy
```

---

## ✅ เสร็จแล้ว!

เมื่อตั้งค่าเสร็จ คุณจะมี:

- ✅ **Production Database** บน AWS RDS
- ✅ **Auto Backups** ทุกวัน
- ✅ **Security** ที่ปลอดภัย
- ✅ **Monitoring** แบบ real-time
- ✅ **Scalable** infrastructure

**Database ของคุณพร้อม production แล้ว!** 🎉