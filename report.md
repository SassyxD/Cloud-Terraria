# รายงาน Cloud Computing: สถาปัตยกรรมและการปรับใช้ “Cloud Terraria”
## 2) ภาพรวมระบบและส่วนประกอบสำคัญ
อ้างอิงจากซอร์สโค้ดและ `README.md` ระบบประกอบด้วย: (1) เว็บแอป Next.js สำหรับ UI/ตัวยืนยันตัวตน/ติดต่อ API (2) Lambda สำหรับควบคุมอายุการใช้งาน EC2 ที่รันคอนเทนเนอร์ Terraria (3) RDS PostgreSQL สำหรับเก็บข้อมูลผู้ใช้และรายการเซิร์ฟเวอร์ (4) โครงข่าย VPC/Subnet/SG/IAM
- Frontend: Next.js 15, TypeScript, Tailwind, tRPC, NextAuth (Discord/Cognito)
- Backend: tRPC API, Prisma ORM
- Infra: AWS VPC, EC2, Lambda, RDS, IAM, SG, Subnets
- Container: Docker image `tccr/terraria-server`

## 3) โครงสร้างซอร์สโค้ด
- `src/server/api/routers/server.ts` tRPC สำหรับ create/start/stop/delete/status และเชื่อม `callLambda()`
- `src/server/aws/lambdaClient.ts` เรียก Lambda และมี mock response เมื่อไม่ตั้งค่า AWS
- `aws/lambda/index.js` โค้ด Lambda จัดการ EC2 (Run/Start/Stop/Terminate/Describe)
- `prisma/schema.prisma` สคีมาฐานข้อมูล (มี `ServerInstance` ผูกผู้ใช้/สถานะ/instanceId/publicIp)
- `infra/cloudformation/*.yaml` เทมเพลต VPC/RDS/Lambda และ README สำหรับลำดับการ deploy

## 4) สถาปัตยกรรมเชิงลึก
4.1 แอปและ API: ผู้ใช้ล็อกอิน → เรียก tRPC → บันทึก DB → เรียก Lambda เพื่อดำเนินการกับ EC2 → คืนสถานะ/ไอพีแอดเดรสกลับมาบันทึก
4.2 Lambda จัดการ EC2: รองรับ `START/STOP/TERMINATE/STATUS`; เมื่อ `START` แบบไม่มี `instanceId` จะ RunInstances พร้อม `UserData` ที่ติดตั้ง Docker และรัน Terraria บนพอร์ต 7777 (กำหนดได้)
4.3 เครือข่าย/ความปลอดภัย: VPC แยก Subnet, Internet/NAT Gateway, Security Group เปิดเฉพาะพอร์ตจำเป็น (เว็บ/7777), IAM แบบ least‑privilege สำหรับ Lambda และ EC2
4.4 ฐานข้อมูล: Production ใช้ RDS PostgreSQL (เข้ารหัส, Private Subnet, Backup); Dev ใช้ SQLite; บริหารด้วย Prisma migration

## 5) โครงสร้างพื้นฐานเป็นโค้ด (IaC)
- Branch `main`: ใช้ CloudFormation (เหมาะกับ AWS Academy) – ไฟล์ `vpc.yaml`, `rds.yaml`, `lambda.yaml`; มีตัวอย่าง `parameters.json` และแนวทางใช้ master stack (`infra/cloudformation/README.md`)
- สาขา `terraform-infrastructure`: ใช้ Terraform (เหมาะกับ production/CI) – ดู `docs/INFRASTRUCTURE.md`

## 6) ขั้นตอนการปรับใช้แบบย่อ
1) เตรียม `.env` และ AWS CLI/Credentials ให้พร้อม
2) Deploy VPC → RDS → Lambda ด้วย CloudFormation Console หรือใช้ master stack
3) รันเว็บแอป: `pnpm install` → `pnpm dev` (dev) หรือทำตาม `docs/EC2_DEPLOYMENT_GUIDE.md` สำหรับ EC2
4) ทดสอบผ่านหน้าเว็บ: Sign in → Create Server → ตรวจสอบสถานะ/ไอพี
5) Cleanup: ลบ Stack กลับลำดับเพื่อลดค่าใช้จ่าย

## 7) ความปลอดภัยและแนวทางที่ดี
- ยืนยันตัวตน: NextAuth + Discord OAuth (เก็บบัญชี/เซสชันใน DB ผ่าน Prisma)
- เครือข่าย: วาง RDS ใน Private Subnet; เปิด SG เฉพาะ HTTP/HTTPS และพอร์ตเกมที่จำเป็น
- ความลับ: ใช้ `.env` สำหรับ dev และพิจารณา Secrets Manager/Parameter Store ใน production
- สิทธิ์: จำกัด IAM สำหรับ Lambda/EC2 ตามหลัก least‑privilege และติด Tag ทรัพยากรเพื่อ audit/cost
- บันทึก/มอนิเตอร์: CloudWatch Logs, Performance Insights (RDS), เสริม Alarm (CPU/Network/Cost)

## 8) ค่าใช้จ่ายโดยประมาณและการควบคุม

### ค่าใช้จ่ายรายเดือน (หลัง Free Tier)
- **EC2 Web Server** (t2.micro, Amazon Linux 2023): ~$13.61/เดือน
  - Instance: $8.47 (730 ชม. × $0.0116/ชม.)
  - Storage 8GB: $0.64
  - Data Transfer: $4.50
- **RDS PostgreSQL** (db.t3.micro, 20GB): ~$14.71/เดือน
  - Instance: $12.41 (730 ชม. × $0.017/ชม.)
  - Storage: $2.30 (20GB × $0.115/GB)
- **EC2 Game Servers** (on-demand): ~$2.03/เดือน/เซิร์ฟเวอร์
  - ตัวอย่าง: 4 ชม./วัน × 30 วัน = 120 ชม. = $1.39 + Storage $0.64
- **Lambda**: ~$0.00 (ภายใน Free Tier 1M requests/เดือน)
- **S3**: ~$0.00 (ภายใน Free Tier 5GB)
- **VPC, SSM**: $0.00 (ฟรี)

### สรุป
- **ใน Free Tier (12 เดือนแรก)**: ~$2/เดือน (เฉพาะ game servers ที่รัน)
- **หลัง Free Tier**: ~$30-35/เดือน (web + db + game servers)
- **รายละเอียดเพิ่มเติม**: ดูไฟล์ `AWS_COST_CALCULATOR.md`

### แนวทาง FinOps
- **ลดค่าใช้จ่าย**: Stop EC2 เมื่อไม่ใช้, ใช้ Spot Instances, Reserved Instances (ลด 30-60%)
- **Monitoring**: ติด Cost Tags, ตั้ง CloudWatch Billing Alerts, Budget $50/เดือน
- **Optimization**: Auto Scaling, right-sizing instances, ลบ resources ที่ไม่ใช้

## 9) ข้อจำกัดและโอกาสพัฒนา
- การสเกล: ปัจจุบันรัน Terraria ต่อ EC2 หนึ่งเครื่อง; อาจพิจารณา ECS/Fargate สำหรับการจัดสรรคอนเทนเนอร์แบบยืดหยุ่น
- ความลับ/คอนฟิก: ย้ายค่าลับจาก `.env` ไป Secrets Manager/SSM เพื่อความปลอดภัยที่ดีกว่า
- HA/DR: เพิ่ม Multi‑AZ/Backup/Restore ชัดเจนทั้งฝั่งเว็บและเกม
- Observability: เพิ่ม Metrics/Tracing/Alert ครอบคลุมเส้นทางสำคัญ

## 10) แผนงานต่อยอด
- เพิ่มกำหนดการเปิด/ปิดอัตโนมัติและแจ้งเตือนค่าใช้จ่ายรายผู้ใช้
- สำรอง/กู้คืนโลกเกมไปยัง S3 อัตโนมัติ
- ย้าย workload เกมไป ECS/Fargate และพิจารณา Autoscaling
- รองรับหลาย Region/เลือก Instance Type อัตโนมัติ

## 11) บรรณานุกรม/อ้างอิงภายใน
- เอกสารภายใน: `README.md`, `docs/INFRASTRUCTURE.md`, `docs/EC2_DEPLOYMENT_GUIDE.md`, `infra/cloudformation/README.md`, เอกสาร RDS/AWS Setup อื่น ๆ ใน `docs/`
- โค้ดอ้างอิง: `src/server/api/routers/server.ts`, `src/server/aws/lambdaClient.ts`, `aws/lambda/index.js`, `prisma/schema.prisma`

## สรุป
Cloud Terraria แสดงตัวอย่างสถาปัตยกรรมคลาวด์ที่ผสานเว็บแอปสมัยใหม่ (Next.js+tRPC) เข้ากับงานโครงสร้างพื้นฐานบน AWS (VPC/EC2/Lambda/RDS) ผ่านแนวทาง IaC ทำให้การสร้าง/บริหารเซิร์ฟเวอร์เกมบนคลาวด์เป็นไปอย่างเป็นระบบ ปลอดภัย และทำซ้ำได้ง่าย เอกสารฉบับนี้รวบรวมแนวปฏิบัติ การปรับใช้ และประเด็นด้านความปลอดภัย/ค่าใช้จ่าย เพื่อใช้เป็นฐานความรู้สำหรับพัฒนา/ต่อยอดระบบต่อไป

---

## ภาคผนวก: การตั้งค่า AWS Cognito สำหรับการยืนยันตัวตน

ระบบรองรับ Cognito ผ่าน NextAuth เป็นผู้ให้บริการยืนยันตัวตนเพิ่มเติมจากผู้ให้บริการอื่น ๆ (multi‑provider). ใช้งานได้เมื่อกำหนดตัวแปรแวดล้อมครบถ้วน และตั้งค่า Callback URL ใน Cognito App client

- ตัวแปรใน `.env` (ตัวอย่าง):
  - AUTH_COGNITO_ID="your-cognito-app-client-id"
  - AUTH_COGNITO_SECRET="your-cognito-app-client-secret"
  - AUTH_COGNITO_ISSUER="https://cognito-idp.{region}.amazonaws.com/{user-pool-id}"
  - NEXTAUTH_SECRET="<random-32-bytes>"
  - NEXTAUTH_URL="http://localhost:3000" (หรือ URL โปรดักชัน)

- Callback URL ที่ต้องเพิ่มใน Cognito App client:
  - Development: http://localhost:3000/api/auth/callback/cognito
  - Production: https://<your-domain>/api/auth/callback/cognito

- ตำแหน่งโค้ดที่เกี่ยวข้อง:
  - src/server/auth/config.ts: การเปิดใช้ Cognito provider แบบมีเงื่อนไขด้วยตัวแปรแวดล้อม
  - src/app/auth/signin/page.tsx: หน้าเลือกผู้ให้บริการลงชื่อเข้าใช้ (กรณีรองรับหลายผู้ให้บริการ)

- ข้อแนะนำความปลอดภัย:
  - เปิดใช้ MFA และกำหนด Password policy ใน User Pool
  - จำกัดโดเมน Callback/Logout ให้ตรงกับสภาพแวดล้อมจริง
  - จัดเก็บ Credential ผ่าน Secrets Manager/Parameter Store สำหรับโปรดักชัน
ผู้จัดทำ: (เติมชื่อผู้จัดทำ)
วิชา: Cloud Computing
วันที่: (เติมวันที่ส่ง)
## บทคัดย่อ
เอกสารฉบับนี้สรุปสถาปัตยกรรม โครงสร้างพื้นฐาน (IaC) ขั้นตอนการปรับใช้ ความปลอดภัย ค่าใช้จ่าย และแนวทางปฏิบัติของระบบ “Cloud Terraria” ซึ่งเป็นแพลตฟอร์มสำหรับสร้างและจัดการเซิร์ฟเวอร์เกม Terraria บน AWS โดยรวบรวมจากซอร์สโค้ดและเอกสารภายใน repository นี้
## 1) บทนำ
Cloud Computing ช่วยให้ใช้งานทรัพยากรคอมพิวต์ผ่านเครือข่ายแบบออนดีมานด์ โครงการนี้ประยุกต์ใช้ AWS (VPC/EC2/Lambda/RDS) และเว็บแอป Next.js เพื่อให้ผู้ใช้สร้าง/จัดการเซิร์ฟเวอร์ Terraria ส่วนตัวได้อย่างสะดวก ปลอดภัย และคุ้มค่า
