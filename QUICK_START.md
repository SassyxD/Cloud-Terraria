# 🚀 Quick Start Guide - Cloud Terraria

## วิธีใช้งาน (ไม่ต้อง ngrok!)

### 1. เริ่มแอปพลิเคชัน

```powershell
# ที่โฟลเดอร์ d:\terraria
npm run dev
```

เว็บจะเปิดที่ **http://localhost:3000**

---

### 2. ใช้งานบนเครื่องตัวเอง

1. เปิดเบราว์เซอร์: http://localhost:3000
2. Sign In (หรือใช้ Mock Credentials)
3. คลิก **"Create New Server"**
4. รอ Lambda สร้าง EC2 Terraria server
5. Copy IP:Port ที่แสดง (เช่น `3.89.217.47:7777`)
6. เปิด Terraria game → Multiplayer → Join via IP → Paste IP

---

### 3. ระบบทำงานอย่างไร

```
[localhost:3000] → [tRPC API] → [AWS Lambda] → [สร้าง EC2 Terraria Server]
                                                      ↓
                                              [Return Public IP:7777]
```

**ไม่ต้องใช้ ngrok** เพราะ:
- ✅ localhost:3000 เป็นแค่ UI ควบคุม (ใช้บนเครื่องตัวเอง)
- ✅ Lambda ทำงานบน AWS (เข้าถึงจาก localhost ผ่าน AWS SDK)
- ✅ Terraria server รันบน EC2 (มี Public IP ให้เชื่อมต่อได้จากภายนอก)

---

## 🎮 การเล่นกับเพื่อน

### เครื่องของคุณ (localhost)
1. เปิด http://localhost:3000
2. สร้าง Terraria server
3. ได้ Public IP (เช่น 3.89.217.47:7777)

### เครื่องเพื่อน
1. เปิด Terraria game
2. Multiplayer → Join via IP
3. ใส่ `3.89.217.47:7777`
4. เล่นได้เลย!

**ไม่ต้อง ngrok** เพราะเพื่อนต่อไปที่ **Terraria Server IP** โดยตรง ไม่ได้ต่อมาที่เว็บของคุณ!

---

## 📋 Checklist

### ✅ ที่ต้องทำ (ครั้งเดียว)
- [x] AWS CLI ติดตั้งแล้ว
- [x] CloudFormation stacks deploy แล้ว
  - [x] cloud-terraria-network
  - [x] cloud-terraria-database  
  - [x] cloud-terraria-lambda
- [x] RDS PostgreSQL ทำงานแล้ว
- [x] `.env.local` มี DATABASE_URL ถูกต้อง

### ✅ ทุกครั้งที่ใช้งาน
1. รัน `npm run dev`
2. เปิด http://localhost:3000
3. สร้าง server
4. เล่นได้!

---

## 🔧 Troubleshooting

### ปัญหา: "Lambda function not found"
```bash
# ตรวจสอบ Lambda
aws lambda get-function --function-name cloud-terraria-server-manager --region us-east-1
```

### ปัญหา: "Database connection failed"
```bash
# ตรวจสอบ .env.local
cat .env.local | grep DATABASE_URL

# ทดสอบ connection
npx prisma db push --skip-generate
```

### ปัญหา: Port 3000 ใช้ไม่ได้
```powershell
# หา process ที่ใช้ port 3000
Get-NetTCPConnection -LocalPort 3000

# ปิด process
Stop-Process -Id <PID> -Force
```

---

## 💡 Tips

### เปิดหลาย servers
- สร้างได้เท่าที่ต้องการ
- แต่ละ server มี IP เป็นของตัวเอง
- ค่าใช้จ่าย: ~$0.0116/ชั่วโมง/server

### ประหยัดเงิน
```bash
# ปิด server เมื่อเลิกเล่น (ผ่าน UI หรือ AWS Console)
aws ec2 stop-instances --instance-ids <instance-id> --region us-east-1

# ลบ server (ผ่าน UI)
คลิกปุ่ม "Delete" ใน web UI
```

---

## 📦 Services ที่ใช้

| Service | Purpose | Access |
|---------|---------|--------|
| localhost:3000 | Web UI (ควบคุม) | เครื่องคุณเท่านั้น |
| Lambda | สร้าง/จัดการ EC2 | เรียกจาก localhost ผ่าน AWS SDK |
| RDS PostgreSQL | เก็บข้อมูล users/servers | เครื่องคุณ + Lambda |
| EC2 Terraria | Game server | **ทุกคนเข้าได้** (Public IP) |

---

## ✨ สรุป

**ไม่ต้อง ngrok!**
- localhost:3000 = ใช้บนเครื่องคุณเอง (ควบคุม servers)
- Lambda = ทำงานบน AWS (สร้าง EC2)
- EC2 Terraria = Public IP (เพื่อนต่อได้เลย)

**เริ่มใช้งาน**: `npm run dev` แล้วเปิด http://localhost:3000

---

*Last Updated: October 31, 2025*
