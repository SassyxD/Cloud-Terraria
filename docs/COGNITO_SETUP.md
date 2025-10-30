# การตั้งค่า AWS Cognito และการแสดง IP Address

## ✅ สิ่งที่เพิ่มเข้ามา

### 1. การแสดง Public IP Address สำหรับเชื่อมต่อเกม Terraria

เมื่อ server กำลังรันอยู่ (`RUNNING`) ระบบจะแสดง:
- **Public IP Address** และ **Port** สำหรับเชื่อมต่อจากเกม
- ปุ่ม **Copy** เพื่อคัดลอก IP:Port ได้เลย
- คำแนะนำการใช้งาน

**ตัวอย่างที่แสดง:**
```
Connect to Server          [Copy]
┌─────────────────────────────┐
│ 3.25.45.123:7777          │
└─────────────────────────────┘
Use this IP address in Terraria multiplayer menu
```

### 2. AWS Cognito Authentication

เพิ่ม authentication provider ใหม่:
- ✅ **Discord OAuth** (เดิม)
- ✅ **AWS Cognito** (ใหม่)

หน้า Sign In จะแสดงทั้ง 2 ตัวเลือก (ถ้ามี Cognito ที่ตั้งค่าไว้)

## 🔧 การตั้งค่า Environment Variables

### สำหรับ AWS Cognito

เพิ่มใน `.env` ของคุณ:

```env
# AWS Cognito Provider (Optional)
AUTH_COGNITO_ID="your-cognito-app-client-id"
AUTH_COGNITO_SECRET="your-cognito-app-client-secret"
AUTH_COGNITO_ISSUER="https://cognito-idp.ap-southeast-1.amazonaws.com/ap-southeast-1_XXXXXXXXX"
```

### วิธีหา Cognito Credentials

1. **ไปที่ AWS Console** → **Cognito** → **User Pools**

2. **สร้าง User Pool ใหม่** (ถ้ายังไม่มี):
   - Pool name: `terraria-users`
   - Sign-in options: Email, Username
   - Password policy: ตามต้องการ

3. **สร้าง App Client**:
   - App client name: `terraria-web`
   - Authentication flows: ALLOW_USER_PASSWORD_AUTH
   - ✅ Generate client secret
   
4. **ตั้งค่า Callback URLs**:
   - Development: `http://localhost:3000/api/auth/callback/cognito`
   - Production: `https://yourdomain.com/api/auth/callback/cognito`

5. **คัดลอก Credentials**:
   - **Client ID** → `AUTH_COGNITO_ID`
   - **Client Secret** → `AUTH_COGNITO_SECRET`
   - **Issuer URL** → หน้า User Pool Overview จะมี "User pool ID"
     - Format: `https://cognito-idp.{region}.amazonaws.com/{user-pool-id}`
     - ตัวอย่าง: `https://cognito-idp.ap-southeast-1.amazonaws.com/ap-southeast-1_abc123XYZ`

## 📋 ไฟล์ที่เปลี่ยนแปลง

### API Routes
- ✅ `src/app/api/servers/status/route.ts` - API สำหรับดึง server status และ Public IP

### Components
- ✅ `src/components/ServerCard.tsx` - แสดง IP address และปุ่ม copy

### Authentication
- ✅ `src/server/auth/config.ts` - เพิ่ม Cognito provider
- ✅ `src/app/auth/signin/page.tsx` - หน้า login ที่รองรับทั้ง Discord และ Cognito

### AWS Lambda Client
- ✅ `src/server/aws/lambdaClient.ts` - เพิ่ม `publicIp` และ `state` ใน response type

### Configuration
- ✅ `.env.example` - เพิ่มตัวอย่าง Cognito credentials

## 🎮 วิธีเชื่อมต่อเกม Terraria

1. **Login** เข้าระบบ (Discord หรือ Cognito)
2. **สร้าง Server** และรอจนสถานะเป็น `RUNNING`
3. **คัดลอก IP Address** ที่แสดงในกล่อง "Connect to Server"
4. **เปิดเกม Terraria**:
   - เลือก **Multiplayer**
   - เลือก **Join via IP**
   - วาง IP address ที่คัดลอก (เช่น `3.25.45.123:7777`)
   - กด **Accept**

## 🚀 ทดสอบระบบ

### ทดสอบ IP Display (Development)

ถ้าไม่มี Lambda/AWS ตั้งค่าไว้ ระบบจะไม่แสดง IP (ปกติ)

ถ้ามี Lambda ที่ตั้งค่าแล้ว:
```bash
# ตั้งค่า Lambda function name
AWS_LAMBDA_FUNCTION_NAME=terraria-ec2-manager
AWS_REGION=ap-southeast-1
```

### ทดสอบ Cognito Authentication

1. ตั้งค่า environment variables ตามด้านบน
2. Restart dev server:
   ```bash
   npm run dev
   ```
3. ไปที่ `http://localhost:3000/auth/signin`
4. ควรเห็นปุ่ม "Continue with AWS Cognito"

## 🔐 Security Notes

### Cognito Best Practices
- ใช้ **MFA (Multi-Factor Authentication)** สำหรับ production
- ตั้ง **Password Policy** ที่แข็งแรง
- Enable **Advanced Security** สำหรับ detection
- ตั้ง **Session Duration** ตามความเหมาะสม

### IP Address
- Public IP จะแสดงเฉพาะเมื่อ server status = `RUNNING`
- API endpoint มีการตรวจสอบ authentication
- ไม่ควรแชร์ IP กับคนที่ไม่ไว้วางใจ

## 📦 Dependencies ที่เพิ่ม

```json
{
  "dependencies": {
    "amazon-cognito-identity-js": "^6.x.x",
    "next-auth": "5.0.0-beta.x",
    "@auth/core": "^0.x.x"
  }
}
```

## 🎯 Next Steps (Optional)

### สำหรับ Cognito
1. สร้าง User Groups (Admin, Premium, Free tier)
2. เพิ่ม Custom Attributes (server_limit, max_runtime)
3. ตั้งค่า Email Templates
4. เพิ่ม Social Login (Google, Facebook)

### สำหรับ Server Management  
1. เพิ่มปุ่ม Start/Stop server
2. แสดง server metrics (uptime, players)
3. Auto-refresh status ทุก 30 วินาที
4. Notification เมื่อ server พร้อม

## ✅ Commit

```bash
git commit -m "feat(auth): add AWS Cognito authentication and server IP display"
```

**Features Added:**
- AWS Cognito authentication provider
- Public IP display for Terraria server connection
- Copy-to-clipboard functionality
- Multi-provider sign-in page
- Server status API endpoint

---

**พร้อมใช้งานแล้วครับ!** 🎉

ส่ง `.env` ที่มี Cognito credentials มาได้เลย แล้วผมจะช่วยตั้งค่าให้!