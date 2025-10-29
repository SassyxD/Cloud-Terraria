# 🎓 AWS Academy - RDS Setup ผ่าน Console

## สำหรับ AWS Academy/Lab Account

เนื่องจาก AWS Academy จำกัดสิทธิ์การใช้ Terraform เราจะสร้าง RDS ผ่าน Console แทนครับ

## 📋 ขั้นตอนสร้าง RDS (10-15 นาที)

### 1. เข้า AWS Console

```
https://awsacademy.instructure.com/
→ AWS Academy Learner Lab
→ Start Lab
→ AWS Console
```

### 2. ไปที่ RDS Service

- Search "RDS" ใน search bar
- คลิก "Amazon RDS"

### 3. Create Database

**คลิก "Create database"**

**Engine options:**
- Engine type: `PostgreSQL`
- Engine version: `PostgreSQL 15.4` (หรือใหม่กว่า)

**Templates:**
- เลือก `Free tier` (ถ้ามี)
- หรือ `Dev/Test` (สำหรับ lab)

**Settings:**
- DB instance identifier: `terraria-database`
- Master username: `postgres`
- Master password: `Terraria2025!SecurePassword`
- Confirm password: `Terraria2025!SecurePassword`

**DB instance class:**
- เลือก `db.t3.micro` (cheapest)

**Storage:**
- Storage type: `General Purpose SSD (gp3)`
- Allocated storage: `20 GiB`
- ✅ Enable storage autoscaling
- Maximum storage threshold: `100 GiB`

**Connectivity:**
- Virtual Private Cloud (VPC): ใช้ default VPC
- Public access: `Yes` (สำหรับ AWS Academy เพื่อให้เชื่อมต่อได้)
- VPC security group:
  - Create new: `terraria-rds-sg`
  - หรือ Existing: เลือก default

**Database authentication:**
- Password authentication (ใช้ตัวนี้)

**Additional configuration:**
- Initial database name: `terraria`
- ✅ Enable automated backups
- Backup retention period: `7 days`
- Backup window: ตามที่ต้องการ
- ✅ Enable Enhanced monitoring (optional)

**คลิก "Create database"**

รอประมาณ 5-10 นาที...

### 4. รับ Endpoint

เมื่อ Status = `Available`:

1. คลิกที่ database name: `terraria-database`
2. ในหน้า "Connectivity & security"
3. คัดลอก **Endpoint**:
   ```
   terraria-database.xxxxxxxxx.ap-southeast-1.rds.amazonaws.com
   ```

### 5. ตั้งค่า Security Group

**สำคัญ!** ต้องอนุญาตให้เชื่อมต่อได้:

1. คลิกที่ Security group (ในหน้า RDS)
2. คลิก "Edit inbound rules"
3. เพิ่ม rule:
   - Type: `PostgreSQL`
   - Protocol: `TCP`
   - Port: `5432`
   - Source:
     - สำหรับทดสอบ: `My IP` หรือ `Anywhere` (0.0.0.0/0)
     - สำหรับ production: เฉพาะ IP ที่ต้องการ
4. Save rules

### 6. อัปเดต .env

```env
# เปลี่ยนจาก SQLite
# DATABASE_URL="file:./dev.db"

# เป็น RDS PostgreSQL
DATABASE_URL="postgresql://postgres:Terraria2025!SecurePassword@terraria-database.xxxxxxxxx.ap-southeast-1.rds.amazonaws.com:5432/terraria"
```

**Format:**
```
postgresql://[username]:[password]@[endpoint]:5432/[database_name]
```

### 7. Migrate Database

```powershell
cd d:\terraria

# Generate Prisma Client
npx prisma generate

# สร้าง tables
npx prisma db push

# ทดสอบ
npx prisma studio
```

### 8. Restart App

```powershell
npm run dev
```

---

## ✅ ทดสอบการเชื่อมต่อ

### ผ่าน Prisma Studio

```powershell
npx prisma studio
```

ถ้าเห็น tables = สำเร็จ!

### ผ่าน psql (optional)

```powershell
# ถ้ามี PostgreSQL client
psql "postgresql://postgres:Terraria2025!SecurePassword@terraria-database.xxxxxxxxx.ap-southeast-1.rds.amazonaws.com:5432/terraria"
```

---

## 💰 ค่าใช้จ่าย AWS Academy

**สำหรับ AWS Academy Lab:**
- มี credit ให้ใช้ตามที่ได้รับ
- RDS db.t3.micro ~$0.02-0.03/ชม
- **อย่าลืมหยุด/ลบ** เมื่อใช้เสร็จ!

---

## 🛑 หยุดใช้งาน RDS

### วิธีที่ 1: Stop (ชั่วคราว)
- ไปที่ RDS Console
- เลือก database
- Actions → Stop temporarily
- (จะ auto-start หลัง 7 วัน)

### วิธีที่ 2: Delete (ถาวร)
- ไปที่ RDS Console
- เลือก database
- Actions → Delete
- ⚠️ เลือก: "Create final snapshot" (ถ้าต้องการเก็บข้อมูล)

---

## 🔄 Alternative: ใช้ SQLite

ถ้าไม่อยากใช้ RDS ตอนนี้:

```env
# ใช้ SQLite ต่อ
DATABASE_URL="file:./dev.db"
```

แล้วค่อยย้าย RDS ทีหลังเมื่อ deploy production จริง!

---

## 📖 เอกสารเพิ่มเติม

- AWS RDS Documentation: https://docs.aws.amazon.com/rds/
- Prisma with PostgreSQL: https://www.prisma.io/docs/concepts/database-connectors/postgresql