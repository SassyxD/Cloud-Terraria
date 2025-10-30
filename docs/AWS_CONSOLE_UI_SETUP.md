# 🖱️ AWS Management Console UI Setup Guide

Setup ทุกอย่างผ่าน UI เท่านั้น ไม่ต้องใช้ CLI

---

## 📋 เตรียมความพร้อม

### ✅ สิ่งที่ต้องมี:
- [ ] AWS Academy Account
- [ ] vockey.pem key file (download จาก AWS Academy)
- [ ] Text editor เพื่อจด values

### 📝 ไฟล์สำหรับจดค่า:
สร้างไฟล์ `aws-values.txt` เพื่อจดค่าที่ได้:

```
=== AWS VALUES ===
VPC ID: 
Public Subnet ID: 
Private Subnet ID: 
RDS Endpoint: 
RDS Password: TerrariaDB2024!
Cognito User Pool ID: 
Cognito Client ID: 
Cognito Client Secret: 
EC2 Web App Public IP: 
Lambda Function Name: TerrariaServerManager
AWS Access Key: 
AWS Secret Key: 
AWS Session Token: 
```

---

## 🚀 Step 1: เริ่ม AWS Academy Lab (5 นาที)

1. เข้า **AWS Academy** → **Modules** → **Learner Lab**
2. คลิก **"Start Lab"**
3. รอจน dot ข้าง AWS เป็น **สีเขียว** (~2-3 นาที)
4. คลิก **"AWS"** เพื่อเปิด AWS Management Console
5. เลือก region: **us-east-1 (N. Virginia)**

---

## 🌐 Step 2: สร้าง VPC (10 นาที)

### 2.1 สร้าง VPC

1. ไปที่ **Services** → **VPC**
2. คลิก **"Create VPC"**
3. เลือก **"VPC and more"** (จะสร้าง subnets อัตโนมัติ)
4. ตั้งค่า:

```
Name tag: terraria
IPv4 CIDR block: 10.0.0.0/16

Number of Availability Zones: 2
Number of public subnets: 2
Number of private subnets: 2

NAT gateways: None
VPC endpoints: None
DNS hostnames: Enable
DNS resolution: Enable
```

5. คลิก **"Create VPC"**
6. รอจน Status เป็น **Available** (~2 นาที)

### 2.2 จด VPC IDs

ใน VPC dashboard:
- **VPC ID**: `vpc-xxxxxxxxxxxxx` → จดลง `aws-values.txt`
- ไป **Subnets**:
  - **Public Subnet 1 ID**: `subnet-xxxxx` (terraria-subnet-public1-us-east-1a) → จด
  - **Public Subnet 2 ID**: `subnet-yyyyy` (terraria-subnet-public2-us-east-1b) → จด (optional)
  - **Private Subnet 1 ID**: `subnet-zzzzz` (terraria-subnet-private1-us-east-1a) → จด
  - **Private Subnet 2 ID**: `subnet-wwwww` (terraria-subnet-private2-us-east-1b) → จด

⚠️ **สำคัญ**: RDS ต้องการ subnet อย่างน้อย 2 AZs (Availability Zones)

---

## 🔒 Step 3: สร้าง Security Groups (5 นาที)

### 3.1 Security Group สำหรับ RDS

1. ไปที่ **VPC** → **Security Groups**
2. คลิก **"Create security group"**
3. ตั้งค่า:

```
Security group name: terraria-db-sg
Description: Security group for RDS database
VPC: เลือก VPC ที่สร้าง (vpc-xxxxx)
```

4. **Inbound rules** - ยังไม่ต้องเพิ่ม (จะเพิ่มทีหลัง)
5. คลิก **"Create security group"**
6. **จด Security Group ID**: `sg-xxxxx`

### 3.2 Security Group สำหรับ EC2 Web App

1. คลิก **"Create security group"** อีกครั้ง
2. ตั้งค่า:

```
Security group name: terraria-webapp-sg
Description: Security group for Next.js web app
VPC: เลือก VPC ที่สร้าง (vpc-xxxxx)
```

3. **Inbound rules** - คลิก **"Add rule"**:

| Type | Port | Source | Description |
|------|------|--------|-------------|
| SSH | 22 | My IP | SSH access |
| HTTP | 80 | 0.0.0.0/0 | Web access |
| HTTPS | 443 | 0.0.0.0/0 | Secure web |
| Custom TCP | 3000 | 0.0.0.0/0 | Next.js (optional) |

4. คลิก **"Create security group"**
5. **จด Security Group ID**: `sg-yyyyy`

### 3.3 อัปเดต RDS Security Group

1. กลับไปที่ **terraria-db-sg**
2. คลิก **"Edit inbound rules"**
3. คลิก **"Add rule"**:

```
Type: PostgreSQL
Port: 5432
Source: Custom → เลือก terraria-webapp-sg (sg-yyyyy)
Description: Allow from web app
```

4. คลิก **"Save rules"**

---

## 🗄️ Step 4: สร้าง RDS Database (15 นาที)

1. ไปที่ **Services** → **RDS**
2. คลิก **"Create database"**

### 4.1 Engine Options

```
Engine type: PostgreSQL
Engine Version: PostgreSQL 15.x (latest)
Templates: Free tier
```

### 4.2 Settings

```
DB instance identifier: terraria-db
Master username: postgres
Master password: TerrariaDB2024!
Confirm password: TerrariaDB2024!
```

⚠️ **จด password**: `TerrariaDB2024!`

### 4.3 Instance Configuration

```
DB instance class: db.t3.micro (free tier)
Storage type: General Purpose SSD (gp2)
Allocated storage: 20 GB
[ ] Enable storage autoscaling
```

### 4.4 Connectivity

```
Virtual private cloud (VPC): เลือก terraria VPC
```

**DB Subnet Group:**
- คลิก **"Create new DB subnet group"**
- เข้าไปตั้งค่า:
  ```
  Name: terraria-db-subnet-group
  Description: Subnet group for Terraria RDS
  VPC: terraria
  Availability Zones: 
    [✓] us-east-1a
    [✓] us-east-1b
  Subnets:
    [✓] terraria-subnet-private1-us-east-1a (10.0.128.0/20)
    [✓] terraria-subnet-private2-us-east-1b (10.0.144.0/20)
  ```
- คลิก **Create**

กลับมาที่หน้า Create database:

```
Subnet group: terraria-db-subnet-group
Public access: No
VPC security group: Choose existing
  - Remove default
  - เลือก terraria-db-sg
Availability Zone: No preference
```

### 4.5 Additional Configuration

```
Initial database name: terraria
[ ] Enable automated backups (ถ้าไม่ต้องการ)
[ ] Enable encryption (optional)
```

### 4.6 Create

1. คลิก **"Create database"**
2. รอ 10-15 นาที จน Status เป็น **Available**

### 4.7 เอา RDS Endpoint

1. ไปที่ **RDS** → **Databases** → **terraria-db**
2. ในหัวข้อ **Connectivity & security**:
   - **Endpoint**: `terraria-db.xxxxxxxxxxxxx.us-east-1.rds.amazonaws.com`
   - **Port**: `5432`
3. **จดลง aws-values.txt**

### 4.8 สร้าง DATABASE_URL

```
DATABASE_URL="postgresql://postgres:TerrariaDB2024!@terraria-db.xxxxxxxxxxxxx.us-east-1.rds.amazonaws.com:5432/terraria"
```

---

## 👤 Step 5: สร้าง Cognito User Pool (5 นาที)

1. ไปที่ **Services** → **Amazon Cognito**
2. คลิก **"User pools"** ในเมนูซ้าย
3. คลิก **"Create user pool"**

### 5.1 Define your application

**Application type:**
```
(•) Traditional web application
```

**Name your application:**
```
terraria-web-app
```

### 5.2 Configure options

**Options for sign-in identifiers:**
```
[✓] Email
[ ] Phone number
[ ] Username
```

**Self-registration:**
```
[✓] Enable self-registration
```

**Required attributes for sign-up:**

คลิก **"Select attributes"** แล้วเลือก:
```
[✓] email
```

คลิก **"Confirm"**

### 5.3 Add a return URL (optional)

**Return URL:**
```
http://localhost:3000/api/auth/callback/cognito
```

(จะอัปเดตด้วย EC2 IP ภายหลัง)

### 5.4 Create

คลิก **"Create user directory"**

---

### 5.5 เอา Cognito Values

**หลังสร้างเสร็จ จะเห็นหน้า User pool information:**

1. **User pool ID**: `us-east-1_xxxxxxxxx` → **จดไว้**

---

**เอา App Client ID และ Client Secret:**

1. ในหน้าเดียวกัน คลิกแท็บ **"App clients"** ด้านบน
2. จะเห็น app client ชื่อ **terraria-web-app** ในตาราง
3. คลิกที่ชื่อ **terraria-web-app**
4. ในหน้า **App client information** จะเห็น:
   - **Client ID**: `xxxxxxxxxxxxxxxxxxxxx` → **จดไว้**
   - **Client secret**: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` → **จดไว้** (ถ้าไม่เห็น ให้คลิก "Show client secret")

---

**บันทึกค่าทั้ง 3 ตัวนี้ในไฟล์ `aws-values.txt`:**
```
=== COGNITO ===
User Pool ID:     us-east-1_wNY6AP6ve
Client ID:        4urpkjllmdl60quv6t1cngqk1o
Client Secret:    xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Issuer:           https://cognito-idp.us-east-1.amazonaws.com/us-east-1_wNY6AP6ve
```

---

## ⚡ Step 6: สร้าง Lambda Function (10 นาที)

### 6.1 เตรียม Lambda Code

**Lambda มีหลายไฟล์ ต้อง zip ก่อน upload:**

**ใน PowerShell:**

```powershell
cd d:\terraria\aws\lambda
Compress-Archive -Path index.js,package.json -DestinationPath lambda-function.zip -Force
```

**หรือใน File Explorer:**

1. เปิด File Explorer → ไปที่ `d:\terraria\aws\lambda`
2. เลือกไฟล์: `index.js` และ `package.json`
3. คลิกขวา → **Send to** → **Compressed (zipped) folder**
4. ตั้งชื่อ: `lambda-function.zip`

### 6.2 สร้าง Lambda Function

1. ไปที่ **Services** → **Lambda**
2. คลิก **"Create function"**

```
Function option: Author from scratch
Function name: TerrariaServerManager
Runtime: Node.js 20.x
Architecture: x86_64

Permissions:
  Execution role: (•) Use an existing role
  Existing role: LabRole
```

> 💡 **หมายเหตุ**: ถ้าไม่เห็น LabRole ให้เลือก **"Create a new role with basic Lambda permissions"** แทน

3. คลิก **"Create function"**

### 6.3 Upload Code

1. ในหน้า Function overview
2. ที่ **Code source** section
3. คลิก **"Upload from"** → **".zip file"**
4. คลิก **"Upload"** → เลือก `lambda-function.zip`
5. คลิก **"Save"**
6. รอให้ status เป็น **"Successfully uploaded"**

### 6.4 Configure

1. ไปที่ tab **Configuration**
2. คลิก **General configuration** → **Edit**:

```
Timeout: 1 min 0 sec
Memory: 256 MB
```

3. คลิก **"Save"**

### 6.5 Test (Optional)

1. ไปที่ tab **Test**
2. Event name: `test-list`
3. Event JSON:
```json
{
  "action": "LIST"
}
```
4. คลิก **"Test"**
5. ถ้าสำเร็จจะเห็น response

**จด Function Name**: `TerrariaServerManager`

---

## 🖥️ Step 7: สร้าง EC2 Instance สำหรับ Web App (15 นาที)

### 7.1 Launch EC2 Instance

1. ไปที่ **Services** → **EC2**
2. คลิก **"Launch instances"**

### 7.2 Name and Tags

```
Name: terraria-webapp
```

### 7.3 Application and OS Images

```
Quick Start: Amazon Linux
Amazon Linux 2023 AMI
Architecture: 64-bit (x86)
```

### 7.4 Instance Type

```
Instance type: t2.small
```

### 7.5 Key Pair

**ถ้ายังไม่มี Key Pair - ต้อง download จาก AWS Academy:**

1. กลับไปที่ **AWS Academy** → **Learner Lab**
2. คลิก **"AWS Details"** (ปุ่มทางขวาของปุ่ม AWS)
3. คลิก **"Download PEM"**
4. ไฟล์จะถูก download ชื่อ **`labsuser.pem`**
5. ย้ายไฟล์ไปที่ `~\Downloads\` (C:\Users\YourName\Downloads\)

**กลับมาที่หน้า Launch EC2:**

```
Key pair name: vockey
```

> 💡 **สำคัญ**: 
> - ไฟล์ที่ download จาก AWS Academy ชื่อ **`labsuser.pem`**
> - แต่ Key pair ใน EC2 ชื่อ **`vockey`**
> - ใช้ `labsuser.pem` สำหรับ SSH แทน `vockey.pem`

### 7.6 Network Settings

คลิก **"Edit"**:

```
VPC: เลือก terraria VPC
Subnet: เลือก terraria-subnet-public1-us-east-1a
Auto-assign public IP: Enable
Firewall (security groups): Select existing security group
  เลือก: terraria-webapp-sg
```

### 7.7 Configure Storage

```
Size: 20 GiB
Volume type: gp3
```

### 7.8 Advanced Details

ขยาย **Advanced details**:

```
IAM instance profile: เลือก profile ที่มี (เช่น LabInstanceProfile หรือชื่ออื่น)
```

> 💡 **หมายเหตุ**: AWS Academy จะมี IAM Instance Profile สำเร็จรูป เลือก profile ที่มีอยู่ในลิสต์

ใน **User data** ใส่:

```bash
#!/bin/bash
yum update -y
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
yum install -y nodejs git
npm install -g pm2
amazon-linux-extras install nginx1 -y || yum install nginx -y
mkdir -p /var/www/terraria
chown ec2-user:ec2-user /var/www/terraria
systemctl enable nginx
systemctl start nginx
```

### 7.9 Launch

1. **Summary** → ดูให้แน่ใจทุกอย่างถูกต้อง
2. คลิก **"Launch instance"**
3. รอ 2-3 นาที จน Instance state เป็น **Running**

### 7.10 เอา Public IP

1. ไปที่ **EC2** → **Instances** → **terraria-webapp**
2. ดู **Public IPv4 address**: `54.123.45.67`
3. **จดลง aws-values.txt**

**สร้างค่า:**
```
NEXTAUTH_URL="http://54.123.45.67"
```

---

## 🔄 Step 8: อัปเดต Cognito Callback URL (2 นาที)

เอา EC2 Public IP ไปอัปเดต Cognito:

1. ไปที่ **Amazon Cognito** → **User pools**
2. คลิกที่ user pool ที่สร้างไว้
3. ไปที่แท็บ **"App clients"** 
4. คลิกที่ app client (terraria-web-app)
5. Scroll ลงหา **"Return URLs"** หรือ **"Callback URLs"**
6. คลิก **"Edit"**
7. เพิ่ม URL ใหม่ (คั่นด้วย comma หรือ enter):

```
http://54.123.45.67/api/auth/callback/cognito
```

(แทน 54.123.45.67 ด้วย EC2 Public IP จริง)

8. คลิก **"Save changes"**

---

## 🔑 Step 9: เอา AWS Credentials (2 นาที)

1. กลับไปที่ **AWS Academy** → **Learner Lab**
2. คลิก **"AWS Details"**
3. คลิก **"Show"** ข้าง AWS CLI
4. คัดลอกทั้ง 3 บรรทัด:

```bash
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="ASIA..."
AWS_SECRET_ACCESS_KEY="..."
AWS_SESSION_TOKEN="FwoGZXIvYXdzE..."
```

5. **จดลง aws-values.txt**

⚠️ **สำคัญ**: Credentials หมดอายุทุก 4 ชั่วโมง!

---

## 🔐 Step 10: Generate AUTH_SECRET (2 นาที)

**Windows PowerShell:**
```powershell
$bytes = New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

คัดลอกผลลัพธ์:
```
AUTH_SECRET="ผลลัพธ์ที่ได้"
```

---

## 📝 Step 11: สร้างไฟล์ .env (5 นาที)

รวมทุกค่าที่จดไว้:

```bash
# === Database (จาก RDS) ===
DATABASE_URL="postgresql://postgres:TerrariaDB2024!@terraria-db.xxxxx.us-east-1.rds.amazonaws.com:5432/terraria"

# === NextAuth (จาก EC2 + Generate) ===
NEXTAUTH_URL="http://54.123.45.67"
AUTH_SECRET="generated-secret-here"

# === Cognito (จาก Cognito User Pool) ===
AUTH_COGNITO_ID="xxxxxxxxxxxxxxxxxxxxx"
AUTH_COGNITO_SECRET="xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
AUTH_COGNITO_ISSUER="https://cognito-idp.us-east-1.amazonaws.com/us-east-1_xxxxxxxxx"

# === AWS Credentials (จาก AWS Academy) ===
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="ASIA..."
AWS_SECRET_ACCESS_KEY="..."
AWS_SESSION_TOKEN="FwoG..."

# === Lambda (จาก Lambda Function) ===
AWS_LAMBDA_FUNCTION_NAME="TerrariaServerManager"

# === Environment ===
NODE_ENV="production"
```

---

## 🚀 Step 12: Deploy บน EC2 (10 นาที)

### 12.1 SSH เข้า EC2

**Windows (PowerShell):**
```powershell
cd ~\Downloads  # ที่ที่มี labsuser.pem
ssh -i labsuser.pem ec2-user@18.208.110.147
```

> 💡 **หมายเหตุ**: ใช้ `labsuser.pem` ไม่ใช่ `vockey.pem`  
> (แทน IP ด้วย EC2 Public IP ที่ได้จริง)

### 12.2 Clone Repository

```bash
cd /var/www/terraria
git clone https://github.com/SassyxD/Cloud-Terraria.git .
```

### 12.3 สร้างไฟล์ .env

```bash
nano .env
```

**Paste ทุกอย่างจาก Step 11** แล้ว:
- กด `Ctrl+X`
- กด `Y`
- กด `Enter`

### 12.4 Run Deployment Script

```bash
chmod +x scripts/deploy-nextjs-ec2.sh
./scripts/deploy-nextjs-ec2.sh
```

รอ ~10 นาที ระหว่างที่:
- ติดตั้ง dependencies
- Build Next.js
- Setup PM2
- Configure nginx

### 12.5 ตรวจสอบ

```bash
# Check PM2
pm2 status

# Check nginx
sudo systemctl status nginx

# Check logs
pm2 logs terraria-web --lines 20
```

---

## ✅ Step 13: ทดสอบ (5 นาที)

### 13.1 เปิด Browser

```
http://54.123.45.67
```

ควรเห็น Terraria Dashboard

### 13.2 ทดสอบ Sign In

1. คลิก **"Sign In"**
2. คลิก **"Sign in with Cognito"**
3. คลิก **"Sign up"**
4. กรอก:
   - Email: your@email.com
   - Password: Password123!
5. Confirm email (ถ้ามี)
6. Sign in
7. ควรเห็น Dashboard

### 13.3 ทดสอบสร้าง Server

1. คลิก **"Create Server"**
2. กรอก:
   - Server Name: Test
   - World Name: TestWorld
   - World Size: Medium
3. คลิก **"Create"**
4. รอ ~2 นาที
5. ควรเห็น Server card พร้อม IP address

---

## 🎉 เสร็จสมบูรณ์!

### ✅ สิ่งที่ได้:

- [✓] VPC with public/private subnets
- [✓] RDS PostgreSQL database
- [✓] Cognito user authentication
- [✓] Lambda function for server management
- [✓] EC2 instance running Next.js
- [✓] nginx reverse proxy
- [✓] PM2 process manager
- [✓] Full production setup

### 📊 AWS Services ที่ใช้: 7 services

1. **VPC** - Network isolation
2. **EC2** (Web App) - Next.js hosting
3. **RDS** - PostgreSQL database
4. **Cognito** - User authentication
5. **Lambda** - Serverless compute
6. **Security Groups** - Firewall
7. **IAM** - Permissions (LabRole)

---

## 🔧 Troubleshooting

### ปัญหา: เข้า website ไม่ได้

1. เช็ค Security Group allows port 80
2. เช็ค nginx running: `sudo systemctl status nginx`
3. เช็ค PM2 running: `pm2 status`

### ปัญหา: Database connection failed

1. เช็ค RDS Security Group allows port 5432 from webapp SG
2. เช็ค DATABASE_URL ถูกต้อง
3. Test connection: `nc -zv rds-endpoint 5432`

### ปัญหา: RDS สร้างไม่ได้ - AZ coverage error

**Error**: "The DB subnet group doesn't meet Availability Zone (AZ) coverage requirement"

**แก้ไข:**
1. VPC ต้องมี subnet อย่างน้อย **2 AZs**
2. ตอนสร้าง VPC ตั้ง **Number of Availability Zones: 2**
3. RDS DB Subnet Group ต้องเลือก subnet จาก 2 AZs ที่ต่างกัน
   - us-east-1a และ us-east-1b
4. ถ้า VPC มี 1 AZ อยู่แล้ว → ลบแล้วสร้างใหม่ หรือเพิ่ม subnet ใน AZ ใหม่

### ปัญหา: Cognito auth failed

1. เช็ค Callback URL ตรงกับ EC2 IP
2. เช็ค Client ID และ Secret ถูกต้อง
3. ดู error ใน browser console

### ปัญหา: AWS Credentials หมดอายุ

1. ไป AWS Academy → Restart Lab
2. เอา credentials ใหม่
3. แก้ .env บน EC2:
   ```bash
   nano .env
   # แก้ 3 บรรทัด: ACCESS_KEY_ID, SECRET_KEY, SESSION_TOKEN
   pm2 restart terraria-web
   ```

---

## 📚 Next Steps

1. **Optional: Add S3** - World backups
2. **Optional: Add SNS** - Email notifications
3. **Optional: Add CloudWatch** - Monitoring
4. **Optional: Add HTTPS** - Let's Encrypt SSL

ดูเพิ่มที่: [AWS_COMPLETE_SETUP.md](./AWS_COMPLETE_SETUP.md)

---

**🎓 Good luck with your project!**
