# AWS TOKENS REQUIRED - Quick List

## 🔴 REQUIRED (ต้องมี)

### 1. AWS Credentials (หมดอายุทุก 4 ชม)
```
ที่: AWS Academy → AWS Details → Show AWS CLI
─────────────────────────────────────────────
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="ASIA..."
AWS_SECRET_ACCESS_KEY="..."
AWS_SESSION_TOKEN="FwoG..."
```

### 2. RDS Database
```
ที่: RDS → Databases → terraria-db → Endpoint
─────────────────────────────────────────────
DATABASE_URL="postgresql://postgres:PASSWORD@ENDPOINT:5432/terraria"

ตัวอย่าง:
DATABASE_URL="postgresql://postgres:YourPassword123@terraria-db.c9a8x7y6z5w4.us-east-1.rds.amazonaws.com:5432/terraria"
```

### 3. EC2 Public IP
```
ที่: EC2 → Instances → terraria-webapp → Public IPv4
─────────────────────────────────────────────
NEXTAUTH_URL="http://54.123.45.67"
```

### 4. Lambda Function Name
```
ที่: Lambda → Functions
─────────────────────────────────────────────
AWS_LAMBDA_FUNCTION_NAME="TerrariaServerManager"
```

### 5. NextAuth Secret (สร้างเอง)
```
คำสั่ง: openssl rand -base64 32
─────────────────────────────────────────────
AUTH_SECRET="random-32-byte-string-here"
```

---

## 🟡 OPTIONAL (ถ้าใช้ Cognito)

### 6. Cognito User Pool
```
ที่: Cognito → User pools → terraria-users
─────────────────────────────────────────────
User Pool ID: us-east-1_Abc123

ที่: App integration → App client list → terraria-web-client
─────────────────────────────────────────────
AUTH_COGNITO_ID="xxxxxxxxxxxxxxxxxxxxxxxxxx"
AUTH_COGNITO_SECRET="xxxxxxxxxxxxxxxxxx..." (Show client secret)
AUTH_COGNITO_ISSUER="https://cognito-idp.us-east-1.amazonaws.com/us-east-1_Abc123"
```

---

## 📋 Complete .env File

```bash
# === REQUIRED ===
DATABASE_URL="postgresql://postgres:YourPassword123@terraria-db.xxx.us-east-1.rds.amazonaws.com:5432/terraria"
NEXTAUTH_URL="http://54.123.45.67"
AUTH_SECRET="your-random-secret"
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="ASIA..."
AWS_SECRET_ACCESS_KEY="..."
AWS_SESSION_TOKEN="FwoG..."
AWS_LAMBDA_FUNCTION_NAME="TerrariaServerManager"
NODE_ENV="production"

# === OPTIONAL (Cognito) ===
AUTH_COGNITO_ID="xxxxxxxxxxxxxxxxxxxxxxxxxx"
AUTH_COGNITO_SECRET="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
AUTH_COGNITO_ISSUER="https://cognito-idp.us-east-1.amazonaws.com/us-east-1_xxxxxxxxx"
```

---

## ⚡ Quick Commands

### Generate AUTH_SECRET
```bash
openssl rand -base64 32
```

### Get EC2 IP from CloudFormation
```bash
aws cloudformation describe-stacks --stack-name terraria-webapp --query 'Stacks[0].Outputs[?OutputKey==`PublicIP`].OutputValue' --output text
```

### Test RDS Connection
```bash
nc -zv your-rds-endpoint 5432
```

### Test Lambda
```bash
aws lambda invoke --function-name TerrariaServerManager --payload '{"action":"LIST"}' response.json
```

---

## 🔄 Update Credentials (Every 4 Hours)

```bash
# 1. Get new credentials from AWS Academy
# 2. SSH to EC2
ssh -i vockey.pem ec2-user@YOUR_EC2_IP

# 3. Edit .env
cd /var/www/terraria
nano .env

# 4. Update only these 3 lines:
AWS_ACCESS_KEY_ID="NEW_ACCESS_KEY"
AWS_SECRET_ACCESS_KEY="NEW_SECRET"
AWS_SESSION_TOKEN="NEW_TOKEN"

# 5. Restart
pm2 restart terraria-web
```

---

## ✅ Validation

```bash
# All required vars set?
grep -E "DATABASE_URL|NEXTAUTH_URL|AUTH_SECRET|AWS_ACCESS_KEY_ID|AWS_LAMBDA_FUNCTION_NAME" .env

# No empty values?
grep "=\"\"" .env
# (should have no output for required vars)
```

---

**💡 Tip**: Copy all values to a text file first, then paste into .env to avoid typos!
