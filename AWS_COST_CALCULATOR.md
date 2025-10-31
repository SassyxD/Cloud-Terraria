# AWS Cost Calculator - Cloud Terraria
**สรุปค่าใช้จ่าย AWS Services ทั้งหมด**

## 📊 Services ที่ใช้งาน

### 1. **Amazon VPC (Virtual Private Cloud)**
- **รายละเอียด**: 
  - 1 VPC (10.0.0.0/16)
  - 2 Public Subnets
  - 1 Internet Gateway
  - 3 Security Groups
- **ค่าใช้จ่าย**: **$0.00/เดือน** (ฟรี)
- **หมายเหตุ**: VPC, Subnets, Internet Gateway, Security Groups ไม่มีค่าใช้จ่าย

---

### 2. **Amazon EC2 (Web Application Server)**
- **รายละเอียด**:
  - Instance Type: **t2.micro** (Amazon Linux 2023)
  - vCPU: 1, RAM: 1 GB
  - Storage: 8 GB GP3 EBS
  - Public IP: 1 elastic IP
- **ค่าใช้จ่าย**:
  - **Instance**: $0.0116/ชั่วโมง = **$8.47/เดือน** (730 ชั่วโมง)
  - **Storage**: 8 GB × $0.08/GB = **$0.64/เดือน**
  - **Data Transfer**: $0.09/GB (50 GB OUT/เดือน) = **$4.50/เดือน**
  - **รวม EC2**: **~$13.61/เดือน**
- **Free Tier**: 750 ชั่วโมง/เดือน (12 เดือนแรก) = **$0.00**

---

### 3. **Amazon EC2 (Terraria Game Servers)**
- **รายละเอียด**:
  - Instance Type: **t2.micro** (on-demand, สร้างตามต้องการ)
  - Docker container: tccr/terraria-server
  - Port: 7777
- **ค่าใช้จ่าย**:
  - **Instance**: $0.0116/ชั่วโมง
  - **ตัวอย่าง**: เล่น 4 ชั่วโมง/วัน × 30 วัน = 120 ชั่วโมง = **$1.39/เดือน**
  - **Storage**: 8 GB = **$0.64/เดือน**
  - **รวม**: **~$2.03/เดือน/เซิร์ฟเวอร์**
- **หมายเหตุ**: ค่าใช้จ่ายขึ้นกับจำนวนชั่วโมงที่เปิดใช้งาน (จ่ายเฉพาะเวลาที่รัน)

---

### 4. **AWS Lambda (Server Manager)**
- **รายละเอียด**:
  - Function: cloud-terraria-server-manager
  - Runtime: Node.js 20.x
  - Memory: 512 MB
  - Timeout: 5 นาที
- **ค่าใช้จ่าย**:
  - **Requests**: $0.20/1M requests
  - **Duration**: $0.0000166667/GB-second
  - **ตัวอย่าง**: 100 requests/เดือน, 2 วินาที/request
    - Requests: 100 × $0.0000002 = **$0.00002**
    - Compute: 100 × 2s × 0.5GB × $0.0000166667 = **$0.0017**
  - **รวม**: **~$0.002/เดือน**
- **Free Tier**: 1M requests + 400,000 GB-seconds/เดือน = **$0.00**

---

### 5. **Amazon RDS PostgreSQL (Database)**
- **รายละเอียด**:
  - Instance: **db.t3.micro** (PostgreSQL 15.10)
  - vCPU: 2, RAM: 1 GB
  - Storage: 20 GB GP3
  - Multi-AZ: No
  - Backup: 7 days retention
- **ค่าใช้จ่าย**:
  - **Instance**: $0.017/ชั่วโมง = **$12.41/เดือน**
  - **Storage**: 20 GB × $0.115/GB = **$2.30/เดือน**
  - **Backup**: 20 GB (within allocated) = **$0.00**
  - **Data Transfer**: ใน same region = **$0.00**
  - **รวม RDS**: **~$14.71/เดือน**
- **Free Tier**: 750 ชั่วโมง db.t2.micro + 20 GB storage (12 เดือนแรก) = **$0.00**

---

### 6. **Amazon S3 (Deployment Storage)**
- **รายละเอียด**:
  - Bucket: cloud-terraria-deployment-4680
  - ใช้เก็บ: deployment packages, scripts, configs
  - ขนาด: ~20 MB
- **ค่าใช้จ่าย**:
  - **Storage**: 0.02 GB × $0.023/GB = **$0.0005/เดือน**
  - **Requests**: ~100 GET/PUT = **$0.0001**
  - **รวม S3**: **~$0.001/เดือน**
- **Free Tier**: 5 GB storage + 20,000 GET + 2,000 PUT = **$0.00**

---

### 7. **AWS Systems Manager (SSM)**
- **รายละเอียด**: ใช้สำหรับ Session Manager และ Run Command
- **ค่าใช้จ่าย**: **$0.00** (SSM Session Manager ฟรี)

---

### 8. **Data Transfer**
- **ค่าใช้จ่าย**:
  - **IN**: ฟรีทั้งหมด
  - **OUT to Internet**: 
    - 100 GB แรก/เดือน = ฟรี (Free Tier)
    - $0.09/GB สำหรับ 100 GB ถัดไป
  - **ประมาณการ**: 50 GB/เดือน = **$0.00** (ภายใน Free Tier)

---

## 💰 สรุปค่าใช้จ่ายรวม

### **ภายใน AWS Free Tier (12 เดือนแรก)**
| Service | ค่าใช้จ่าย/เดือน |
|---------|-----------------|
| VPC & Networking | $0.00 |
| EC2 - Web Server (t2.micro) | $0.00 |
| EC2 - Game Servers | ~$2.00 |
| Lambda | $0.00 |
| RDS PostgreSQL | $0.00 |
| S3 | $0.00 |
| SSM | $0.00 |
| Data Transfer | $0.00 |
| **รวม** | **~$2.00/เดือน** |

### **หลังจาก Free Tier หมดอายุ (เดือนที่ 13+)**
| Service | ค่าใช้จ่าย/เดือน |
|---------|-----------------|
| VPC & Networking | $0.00 |
| EC2 - Web Server | $13.61 |
| EC2 - Game Servers (4 ชม./วัน) | $2.03 |
| Lambda | $0.00 |
| RDS PostgreSQL | $14.71 |
| S3 | $0.00 |
| Data Transfer | $0.00 |
| **รวม** | **~$30.35/เดือน** |

---

## 📉 วิธีลดค่าใช้จ่าย

### 1. **ปิด EC2 เมื่อไม่ใช้งาน**
- Stop instances แทนที่จะปล่อยรันตลอด
- ประหยัดได้: **50-90%** ของค่า EC2

### 2. **ใช้ Reserved Instances (RI)**
- จอง EC2/RDS แบบ 1 ปี = ลดได้ **30-40%**
- จอง 3 ปี = ลดได้ **50-60%**

### 3. **ใช้ Spot Instances สำหรับ Game Servers**
- ราคาถูกกว่า on-demand **70-90%**
- เหมาะกับเซิร์ฟเวอร์เกมที่รับการหยุดชั่วคราวได้

### 4. **ลดขนาด RDS Storage**
- ใช้ 10 GB แทน 20 GB (ถ้าข้อมูลน้อย)
- ประหยัด: **$1.15/เดือน**

### 5. **ใช้ Aurora Serverless v2 (ทางเลือก)**
- จ่ายตาม usage จริง
- เหมาะกับ traffic ไม่สม่ำเสมอ

### 6. **ตั้ง Budget Alert**
- แจ้งเตือนเมื่อค่าใช้จ่ายเกิน threshold
- ป้องกันค่าใช้จ่ายเกินคาด

---

## 🎯 Cost Optimization Best Practices

### **Development Environment**
```
RDS: ใช้ SQLite แทน (ฟรี)
EC2: Stop เมื่อไม่ dev
Lambda: ใช้ใน Free Tier
รวม: ~$0-5/เดือน
```

### **Production Environment (Small)**
```
Web: EC2 t2.micro
RDS: db.t3.micro
Game Servers: on-demand (ปิดเมื่อไม่เล่น)
รวม: ~$15-20/เดือน
```

### **Production Environment (Medium)**
```
Web: EC2 t3.small (RI 1 year)
RDS: db.t3.small Multi-AZ
Game Servers: Mix of RI + Spot
Auto Scaling: เปิดตาม traffic
รวม: ~$80-120/เดือน
```

---

## 📊 Cost Tags & Monitoring

### **แนะนำให้ติด Tags**
```
Project: Cloud-Terraria
Environment: Production/Development
Owner: [Your-Name]
CostCenter: [Department]
AutoShutdown: Yes/No
```

### **CloudWatch Billing Alerts**
1. ตั้ง alert เมื่อค่าใช้จ่ายเกิน $10, $20, $30
2. ตั้ง budget $50/เดือน พร้อม notification
3. Review cost รายสัปดาห์

---

## 📅 ตัวอย่างค่าใช้จ่ายรายเดือน

### **Scenario 1: Solo Developer (12 เดือนแรก)**
- Web server รันตลอด (Free Tier)
- เล่นเกม 2 ชม./วัน
- **ค่าใช้จ่าย**: ~$1-2/เดือน

### **Scenario 2: Small Team (หลัง Free Tier)**
- Web server + RDS รันตลอด
- 3 เซิร์ฟเวอร์เกม เปิดเฉพาะเล่น (รวม 10 ชม./วัน)
- **ค่าใช้จ่าย**: ~$35-40/เดือน

### **Scenario 3: Public Service**
- Web server + RDS HA Multi-AZ
- 10 game servers, autoscaling
- High traffic
- **ค่าใช้จ่าย**: ~$200-300/เดือน

---

## 🔗 AWS Pricing Calculator
ใช้เครื่องมือนี้คำนวณค่าใช้จ่ายแบบละเอียด:
https://calculator.aws

**เพิ่มเติม**:
- [EC2 Pricing](https://aws.amazon.com/ec2/pricing/)
- [RDS Pricing](https://aws.amazon.com/rds/postgresql/pricing/)
- [Lambda Pricing](https://aws.amazon.com/lambda/pricing/)

---

**อัพเดทล่าสุด**: October 31, 2025  
**Region**: us-east-1 (N. Virginia)  
**สกุลเงิน**: USD

**หมายเหตุ**: ราคาอาจเปลี่ยนแปลงได้ ควรตรวจสอบจาก AWS Pricing Calculator เสมอ
