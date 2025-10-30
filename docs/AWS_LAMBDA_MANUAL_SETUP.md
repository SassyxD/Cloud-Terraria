# AWS Lambda Setup Guide (Manual)
## สำหรับสร้าง Terraria Server จริงๆ ใน AWS Academy

### Prerequisites
- AWS Academy Learner Lab (เปิด Lab แล้วเท่านั้น)
- AWS CLI credentials จาก AWS Details

---

## ⚠️ สำคัญ: AWS Academy Limitations

AWS Academy Learner Lab มีข้อจำกัด:
- **ไม่สามารถสร้าง IAM Role ใหม่ได้** - ต้องใช้ `LabRole` ที่มีอยู่
- Lambda function จะถูกลบเมื่อ Lab หมดเวลา (4 ชม.)
- ต้อง redeploy ทุกครั้งที่เปิด Lab ใหม่

---

## Step 1: ~~สร้าง IAM Role~~ (ข้าม - ใช้ LabRole)

❌ **ไม่ต้องทำขั้นตอนนี้** - AWS Academy ไม่อนุญาต

✅ **ใช้ `LabRole` แทน** - มีสิทธิ์ EC2 อยู่แล้ว

---

## Step 2: สร้าง Lambda Function

1. เปิด **AWS Academy Learner Lab** → คลิก **Start Lab**
2. รอ indicator เป็นสีเขียว (ประมาณ 2-3 นาที)
3. คลิก **AWS** เพื่อเข้า AWS Console
4. ไปที่ **Lambda Console** → **Create function**
5. เลือก **Author from scratch**
6. กรอกข้อมูล:
   - **Function name**: `TerrariaServerManager`
   - **Runtime**: **Node.js 20.x**
   - **Architecture**: x86_64
7. ใน **Permissions** → **Change default execution role**:
   - เลือก **Use an existing role**
   - เลือก **LabRole** (มีอยู่แล้วใน Academy)
8. **Create function**

---

## Step 3: ใส่ Code ใน Lambda

1. ในหน้า Lambda function ที่สร้าง ไปที่ tab **Code**
2. ลบ code เดิมทั้งหมด
3. Copy code จากไฟล์ `aws/lambda/index.js` ใส่เข้าไป
4. คลิก **Deploy**

---

## Step 4: กำหนด Environment Variables (สำหรับ AWS Academy)

1. ไปที่ tab **Configuration** → **Environment variables**
2. คลิก **Edit** → **Add environment variable**
3. เพิ่มตัวแปรเหล่านี้:

**สำหรับ AWS Academy Learner Lab:**
```
REGION=us-east-1
INSTANCE_TYPE=t2.micro
SECURITY_GROUP_NAME=terraria-sg
KEY_NAME=vockey
```

**หมายเหตุ:**
- AWS Academy ใช้ **us-east-1** เป็น default
- Key Pair ชื่อ **vockey** มีอยู่แล้วใน Academy
- ไม่ต้องระบุ AMI_ID (Lambda จะหา Ubuntu AMI ล่าสุดเอง)
- ไม่ต้องระบุ SUBNET_ID (ใช้ default VPC)

4. คลิก **Save**

---

## Step 4.5: สร้าง Security Group

1. ไปที่ **EC2 Console** → **Security Groups** → **Create security group**
2. กรอกข้อมูล:
   - **Name**: `terraria-sg`
   - **Description**: `Terraria game server security group`
   - **VPC**: เลือก default VPC
3. **Inbound rules** → **Add rule**:
   - **Type**: Custom TCP
   - **Port**: 7777
   - **Source**: 0.0.0.0/0
   - **Description**: Terraria game port
4. เพิ่ม rule ที่ 2:
   - **Type**: SSH
   - **Port**: 22
   - **Source**: My IP
   - **Description**: SSH access
5. **Create security group**

---

## Step 5: เพิ่ม Timeout และ Memory

1. ไปที่ tab **Configuration** → **General configuration**
2. คลิก **Edit**
3. ตั้งค่า:
   - **Timeout**: 5 minutes
   - **Memory**: 512 MB
4. **Save**

---

## Step 6: Test Lambda Function

1. ไปที่ tab **Test**
2. สร้าง test event ชื่อ `CreateServer`:

```json
{
  "action": "START",
  "worldName": "MyWorld",
  "version": "1.4.4.9",
  "port": 7777
}
```

3. คลิก **Test**
4. ดูผลลัพธ์ว่าสร้าง EC2 instance สำเร็จหรือไม่

---

## Step 7: เชื่อมต่อกับ Application

1. ใน AWS Academy, ไปที่ **AWS Details** → คลิก **Show** ข้าง AWS CLI
2. Copy ข้อมูลทั้งหมด:
   ```
   aws_access_key_id=...
   aws_secret_access_key=...
   aws_session_token=...
   ```

3. เปิดไฟล์ `.env` ในโปรเจค
4. เพิ่มค่าเหล่านี้ (⚠️ **ข้อมูลเหล่านี้หมดอายุเมื่อ Lab หมดเวลา!**):

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<paste-from-academy>
AWS_SECRET_ACCESS_KEY=<paste-from-academy>
AWS_SESSION_TOKEN=<paste-from-academy>
AWS_LAMBDA_FUNCTION_NAME=TerrariaServerManager
```

5. Restart server: 
   - กด Ctrl+C ใน terminal
   - รัน `npm run dev` ใหม่

⚠️ **สำคัญ**: Credentials จาก AWS Academy หมดอายุเมื่อ:
- Lab timeout (4 ชั่วโมง)
- กด Stop Lab
- ต้อง copy credentials ใหม่ทุกครั้งที่เปิด Lab

---

## Step 8: สร้าง Server

1. เข้า http://localhost:3000
2. Sign in ด้วย username อะไรก็ได้
3. คลิก **Create Server**
4. รอประมาณ 2-3 นาที
5. เมื่อ status เป็น **running** จะเห็น IP address
6. เปิด Terraria → Multiplayer → Join via IP
7. ใส่ IP:7777

---

## Security Group Rules

สร้าง Security Group ด้วย rules เหล่านี้:

**Inbound Rules:**
- Type: Custom TCP
- Port: 7777
- Source: 0.0.0.0/0 (หรือ IP ของคุณเท่านั้น)
- Description: Terraria Game Port

- Type: SSH
- Port: 22
- Source: My IP
- Description: SSH Access

**Outbound Rules:**
- Type: All traffic
- Destination: 0.0.0.0/0

---

## Troubleshooting

### Lambda fails with "User: ... is not authorized"
✅ **แก้ไข**: ใช้ **LabRole** แทนการสร้าง role ใหม่
- AWS Academy ไม่อนุญาตให้สร้าง IAM Role
- LabRole มีสิทธิ์ EC2 ครบอยู่แล้ว

### Credentials หมดอายุ (Session expired)
✅ **แก้ไข**: Copy credentials ใหม่จาก AWS Details
- Credentials หมดอายุทุก 4 ชั่วโมง หรือเมื่อ Stop Lab
- ต้อง Start Lab ใหม่ และ copy credentials ใหม่
- อัพเดทใน `.env` และ restart server

### EC2 instance ไม่สร้าง
- ตรวจสอบ CloudWatch Logs ใน Lambda (tab Monitor → View logs in CloudWatch)
- ตรวจสอบว่า Security Group ชื่อ `terraria-sg` มีอยู่จริง
- ตรวจสอบว่าใช้ region `us-east-1`

### ไม่สามารถเชื่อมต่อ Terraria
- ตรวจสอบ Security Group inbound rules (port 7777 เปิดหรือยัง)
- รอให้ server boot เสร็จ (2-3 นาที)
- ตรวจสอบว่า EC2 instance status check passed

### Lambda หายไปหลัง Stop Lab
- เป็นปกติของ AWS Academy Learner Lab
- ต้อง redeploy Lambda ใหม่ทุกครั้งที่เปิด Lab
- แนะนำ: เก็บ Lambda code ไว้ใน text file เพื่อ copy ง่าย

---

## AWS Academy Workflow Summary

**ทุกครั้งที่ต้องการใช้งาน:**

1. ✅ Start Lab (รอ indicator เป็นสีเขียว)
2. ✅ เปิด AWS Console
3. ✅ สร้าง Lambda function ใหม่ (ใช้ LabRole)
4. ✅ Paste code จากไฟล์ `aws/lambda/index.js`
5. ✅ ตั้งค่า Environment Variables
6. ✅ Copy AWS credentials จาก AWS Details
7. ✅ อัพเดท `.env` ในโปรเจค
8. ✅ Restart Next.js server
9. ✅ สร้าง Terraria server ได้!

**เมื่อเล่นเสร็จ:**

1. ลบ EC2 instances (ประหยัด credits)
2. Stop Lab
3. Lambda function จะหายไป (ปกติ)

---

## Cost Estimation

- **Lambda**: Free tier (1M requests/month)
- **EC2 t2.micro**: ~$8-10/month (ถ้าเปิดตลอด)
- **เปิดเฉพาะเล่น**: ~$0.0116/hour

**คำแนะนำ**: หยุด EC2 instance เมื่อไม่ใช้งาน เพื่อประหยัดค่าใช้จ่าย!

---

## Alternative: ใช้ Mock Mode

ถ้าไม่อยากใช้เงิน สามารถใช้ **Mock Mode** เพื่อทดสอบ UI:

- ไม่ต้อง deploy Lambda
- ไม่ต้องกรอก AWS credentials
- Server จะแสดง mock IP: `203.0.113.42:7777`
- เหมาะสำหรับ demo และทดสอบ UI

Mock mode จะทำงานอัตโนมัติเมื่อไม่มี AWS credentials ใน `.env`
