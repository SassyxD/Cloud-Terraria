# 🔑 AWS Tokens & Configuration Checklist

ต้องไปเอา token/ค่า config เหล่านี้จาก **AWS Management Console**:

---

## 📋 สิ่งที่ต้องเอาจาก AWS Console

### 1. 🔐 AWS Credentials (สำหรับ Next.js บน EC2 เรียก AWS Services)

**ที่: AWS Academy → AWS Details → Show AWS CLI Credentials**

```bash
# คัดลอกค่าเหล่านี้:
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="ASIA..."
AWS_SECRET_ACCESS_KEY="..."
AWS_SESSION_TOKEN="FwoGZXIvYXdzE..."
```

⚠️ **หมายเหตุ**: 
- AWS Academy credentials **หมดอายุทุก 4 ชั่วโมง**
- ต้อง copy ใหม่ทุกครั้งที่ session หมดอายุ
- สำหรับ production จริง ใช้ IAM Role แทน (ไม่หมดอายุ)

---

### 2. 🗄️ RDS Database Connection String

**ที่: RDS → Databases → terraria-db → Connectivity & security**

```bash
# Endpoint ตัวอย่าง:
DATABASE_URL="postgresql://postgres:YourPassword123@terraria-db.xxxxx.us-east-1.rds.amazonaws.com:5432/terraria"
```

**ข้อมูลที่ต้องใส่:**
- **Endpoint**: `terraria-db.xxxxx.us-east-1.rds.amazonaws.com`
- **Port**: `5432`
- **Username**: `postgres` (ตอนสร้าง RDS ตั้งไว้)
- **Password**: `YourPassword123` (ตอนสร้าง RDS ตั้งไว้)
- **Database name**: `terraria`

---

### 3. 🔑 AWS Cognito User Pool

**ที่: Cognito → User pools → terraria-users**

#### 3.1 Cognito Client ID
**ที่: App integration → App client list → terraria-web-client**

```bash
AUTH_COGNITO_ID="xxxxxxxxxxxxxxxxxxxxxxxxxx"
```

#### 3.2 Cognito Client Secret
**ที่: App integration → App client list → terraria-web-client → Show client secret**

```bash
AUTH_COGNITO_SECRET="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

#### 3.3 Cognito Issuer URL
**ที่: User pool overview → User pool ID**

```bash
# Format: https://cognito-idp.{region}.amazonaws.com/{UserPoolId}
AUTH_COGNITO_ISSUER="https://cognito-idp.us-east-1.amazonaws.com/us-east-1_xxxxxxxxx"
```

**ตัวอย่าง:**
- User Pool ID: `us-east-1_Abc123`
- Issuer URL: `https://cognito-idp.us-east-1.amazonaws.com/us-east-1_Abc123`

---

### 4. ⚡ Lambda Function Name

**ที่: Lambda → Functions**

```bash
AWS_LAMBDA_FUNCTION_NAME="TerrariaServerManager"
```

---

### 5. 🌐 EC2 Public IP (สำหรับ NEXTAUTH_URL)

**วิธีที่ 1: จาก CloudFormation Stack**
```bash
aws cloudformation describe-stacks \
  --stack-name terraria-webapp \
  --query 'Stacks[0].Outputs[?OutputKey==`PublicIP`].OutputValue' \
  --output text
```

**วิธีที่ 2: จาก EC2 Console**
**ที่: EC2 → Instances → terraria-webapp → Public IPv4 address**

```bash
# ตัวอย่าง:
NEXTAUTH_URL="http://54.123.45.67"

# หรือถ้ามี domain name:
NEXTAUTH_URL="https://terraria.yourdomain.com"
```

---

### 6. 🔒 NextAuth Secret (Generate เอง)

**วิธีสร้าง:**

```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
$bytes = New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

```bash
AUTH_SECRET="your-generated-secret-here"
```

---

## 📝 ไฟล์ .env ที่สมบูรณ์

สร้างไฟล์ `.env` บน EC2 instance ที่ `/var/www/terraria/.env`:

```bash
# Database (RDS PostgreSQL)
DATABASE_URL="postgresql://postgres:YourPassword123@terraria-db.xxxxx.us-east-1.rds.amazonaws.com:5432/terraria"

# NextAuth.js
NEXTAUTH_URL="http://YOUR_EC2_PUBLIC_IP"
AUTH_SECRET="generate-with-openssl-rand-base64-32"

# AWS Cognito Authentication
AUTH_COGNITO_ID="xxxxxxxxxxxxxxxxxxxxxxxxxx"
AUTH_COGNITO_SECRET="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
AUTH_COGNITO_ISSUER="https://cognito-idp.us-east-1.amazonaws.com/us-east-1_xxxxxxxxx"

# AWS Credentials (from AWS Academy)
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="ASIA..."
AWS_SECRET_ACCESS_KEY="..."
AWS_SESSION_TOKEN="FwoGZXIvYXdzE..."

# Lambda Function
AWS_LAMBDA_FUNCTION_NAME="TerrariaServerManager"

# Environment
NODE_ENV="production"
```

---

## 🎯 Step-by-Step: เอา Token ทั้งหมด

### Step 1: AWS Credentials
1. เข้า **AWS Academy**
2. คลิก **Modules** → **Learner Lab**
3. คลิก **Start Lab** (รอ dot เป็นสีเขียว)
4. คลิก **AWS Details**
5. คลิก **Show** ข้อ AWS CLI
6. **Copy ทั้ง 3 บรรทัด** (access key, secret, token)

### Step 2: RDS Endpoint
1. เข้า **AWS Console** → **RDS**
2. คลิก **Databases** → **terraria-db**
3. ดู **Endpoint & port** ใน Connectivity & security
4. Copy endpoint (ไม่รวม :5432)

### Step 3: Cognito
1. เข้า **AWS Console** → **Cognito**
2. คลิก **User pools** → **terraria-users**
3. จด **User pool ID** (us-east-1_xxxx)
4. ไป **App integration** → **App client list**
5. คลิก **terraria-web-client**
6. Copy **Client ID**
7. คลิก **Show client secret** → Copy

### Step 4: Lambda
1. เข้า **AWS Console** → **Lambda**
2. ดู **Function name** ที่สร้างไว้
3. ถ้าตั้งตาม guide จะชื่อ `TerrariaServerManager`

### Step 5: EC2 Public IP
1. เข้า **AWS Console** → **EC2**
2. คลิก **Instances** → **terraria-webapp**
3. Copy **Public IPv4 address**

---

## ✅ Checklist

ก่อน deploy ให้เช็คว่าได้ครบ:

- [ ] AWS_REGION
- [ ] AWS_ACCESS_KEY_ID
- [ ] AWS_SECRET_ACCESS_KEY
- [ ] AWS_SESSION_TOKEN
- [ ] DATABASE_URL (RDS endpoint)
- [ ] AUTH_COGNITO_ID
- [ ] AUTH_COGNITO_SECRET
- [ ] AUTH_COGNITO_ISSUER
- [ ] AWS_LAMBDA_FUNCTION_NAME
- [ ] NEXTAUTH_URL (EC2 IP)
- [ ] AUTH_SECRET (generated)

---

## 🔄 ถ้า AWS Academy Session หมดอายุ

เมื่อเห็น error: `ExpiredToken` หรือ `InvalidToken`

1. ไป AWS Academy → Restart Lab
2. เอา AWS Credentials ใหม่ (3 บรรทัด)
3. SSH เข้า EC2:
   ```bash
   ssh -i vockey.pem ec2-user@YOUR_EC2_IP
   ```
4. แก้ไฟล์ .env:
   ```bash
   cd /var/www/terraria
   nano .env
   # แก้แค่ 3 บรรทัด: ACCESS_KEY_ID, SECRET_ACCESS_KEY, SESSION_TOKEN
   ```
5. Restart app:
   ```bash
   pm2 restart terraria-web
   ```

---

## 🚨 Common Issues

### Issue 1: Database connection failed
**Error:** `Can't reach database server`

**Fix:**
- เช็ค RDS Security Group allow port 5432 from EC2 security group
- เช็ค DATABASE_URL ถูกต้อง (endpoint, password)

### Issue 2: Lambda invoke failed
**Error:** `AccessDenied` or `InvalidClientTokenId`

**Fix:**
- เช็ค AWS Credentials ยังไม่หมดอายุ (4 ชม)
- เช็ค EC2 IAM Role มี permission เรียก Lambda

### Issue 3: Cognito auth failed
**Error:** `invalid_client` or `redirect_uri_mismatch`

**Fix:**
- เช็ค AUTH_COGNITO_ID และ SECRET ถูกต้อง
- เช็ค Cognito Callback URL = `http://YOUR_EC2_IP/api/auth/callback/cognito`

---

## 📚 Related Docs

- [EC2 Deployment Guide](./EC2_DEPLOYMENT_GUIDE.md) - Complete EC2 setup
- [AWS Complete Setup](./AWS_COMPLETE_SETUP.md) - All AWS services
- [RDS Deployment](./RDS_DEPLOYMENT_GUIDE.md) - Database setup
- [Cognito Setup](./COGNITO_SETUP.md) - Authentication setup
