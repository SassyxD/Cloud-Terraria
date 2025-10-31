# 🚀 Cloud Terraria - Deployment Summary

**วันที่**: October 31, 2025  
**Status**: ✅ **DEPLOYED SUCCESSFULLY**

---

## ✅ สิ่งที่ทำสำเร็จ

### 1. **AWS Infrastructure (CloudFormation)**
- ✅ **VPC Stack** (cloud-terraria-network)
  - VPC: vpc-0a7fda64e33ae5be2
  - Public Subnets: 2 subnets
  - Security Groups: 3 groups
  
- ✅ **RDS Stack** (cloud-terraria-database)
  - Database: PostgreSQL 15.10
  - Endpoint: `cloud-terraria-db.cmjajxf2zbex.us-east-1.rds.amazonaws.com:5432`
  - Database name: `terraria`
  - Instance: db.t3.micro (20 GB)
  
- ✅ **Lambda Stack** (cloud-terraria-lambda)
  - Function: `cloud-terraria-server-manager`
  - Runtime: Node.js 20.x
  - Memory: 512 MB
  - Actions: START, STOP, TERMINATE, STATUS
  
- ✅ **WebApp EC2 Stack** (cloud-terraria-webapp)
  - Instance: i-0890af38ef5b52e21
  - IP: 13.221.157.248
  - OS: Amazon Linux 2023
  - Node.js: v18.20.2

### 2. **Database Migration**
- ✅ Migrated from SQLite to PostgreSQL
- ✅ Prisma schema updated
- ✅ Migration applied: `20251031073213_init_postgresql`
- ✅ All tables created successfully

### 3. **Application**
- ✅ Next.js 15.5.4 built successfully
- ✅ Deployed to EC2 via SSM
- ✅ Dependencies installed (npm ci)
- ✅ Prisma Client generated

### 4. **Security Groups**
- ✅ Port 7777 opened for Terraria game servers
- ✅ Port 3000 opened for web application
- ✅ Port 80/443 configured for nginx

### 5. **Terraria Servers**
- ✅ Lambda can create EC2 instances
- ✅ Public IP returned and displayed in UI
- ✅ Example server created: 3.89.217.47:7777

---

## 📁 โครงสร้างไฟล์ที่จัดระเบียบแล้ว

```
d:/terraria/
├── src/                    # Application source code
├── prisma/                 # Database schema & migrations
├── docs/                   # Documentation
├── cloudformation/         # AWS CloudFormation templates
│   ├── 1-vpc-network.yaml
│   ├── 2-rds-database.yaml
│   ├── 3-lambda-function.yaml
│   └── 4-webapp-ec2.yaml
├── aws/lambda/             # Lambda function code
├── deployment/             # Deployment scripts & keys
│   ├── deploy-to-ec2.ps1
│   ├── deploy-to-ec2.sh
│   ├── labsuser.pem
│   └── labsuser.pub
├── config/                 # Configuration files
│   ├── nginx.conf
│   ├── nginx-ssl.conf
│   └── ecosystem.config.js
├── public/                 # Static assets
├── .env.local              # Local environment variables
├── package.json
├── next.config.js
├── report.md               # รายงาน Cloud Computing
└── AWS_COST_CALCULATOR.md  # คำนวณค่าใช้จ่าย AWS
```

---

## 🌐 URLs & Endpoints

### **Production (EC2)**
- **Web Application**: http://13.221.157.248:3000 (port 3000)
- **Alternative**: http://13.221.157.248 (port 80 via nginx - ยังไม่ทำงาน)

### **Development**
- **Local**: http://localhost:3000
- **ngrok** (ถ้าใช้): https://b7b0a3de01a0.ngrok-free.app

### **Database**
- **RDS Endpoint**: cloud-terraria-db.cmjajxf2zbex.us-east-1.rds.amazonaws.com:5432
- **Database**: terraria
- **User**: postgres

### **AWS Lambda**
- **Function**: cloud-terraria-server-manager
- **Region**: us-east-1

---

## 🎮 วิธีใช้งาน

### 1. **เข้าเว็บแอป**
```
http://13.221.157.248:3000
```

### 2. **Sign In**
- Discord OAuth (ถ้า configure แล้ว)
- หรือ Mock Credentials (สำหรับ demo)

### 3. **Create Terraria Server**
- คลิก "Create New Server"
- รอ Lambda สร้าง EC2 instance
- Copy IP:Port ที่แสดง (เช่น 3.89.217.47:7777)

### 4. **เชื่อมต่อจาก Terraria Game**
- เปิด Terraria
- Multiplayer → Join via IP
- Paste IP:Port ที่ copy มา
- เล่นได้เลย!

---

## ⚠️ ปัญหาที่พบและวิธีแก้

### 1. **Web App ไม่ทำงานบน EC2 (Port 80)**
**ปัญหา**: Nginx configuration failed
**Workaround**: ใช้ port 3000 โดยตรง (http://13.221.157.248:3000)
**แก้ไขถาวร**: 
```bash
# SSH เข้า EC2 (ต้องใช้ vockey.pem หรือ SSM)
sudo systemctl restart nginx
```

### 2. **SSH ไม่ได้**
**ปัญหา**: labsuser.pem ≠ vockey key pair
**วิธีแก้**: ใช้ AWS Systems Manager Session Manager แทน
```bash
aws ssm start-session --target i-0890af38ef5b52e21 --region us-east-1
```

### 3. **App Crashes**
**วิธีเช็ค logs**:
```bash
# Via SSM
aws ssm send-command \
  --instance-ids i-0890af38ef5b52e21 \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=["tail -100 /tmp/next.log"]' \
  --region us-east-1
```

---

## 🔧 การบำรุงรักษา

### **Start Web Server**
```bash
cd /opt/terraria-app
export DATABASE_URL="postgresql://postgres:TerrariaDB2024!@cloud-terraria-db.cmjajxf2zbex.us-east-1.rds.amazonaws.com:5432/terraria"
nohup npm start > /tmp/next.log 2>&1 &
```

### **Update Application**
```powershell
# Local machine
.\deployment\deploy-to-ec2.ps1 -EC2_IP 13.221.157.248
```

### **Stop Resources (ประหยัดค่าใช้จ่าย)**
```bash
# Stop EC2 web server
aws ec2 stop-instances --instance-ids i-0890af38ef5b52e21 --region us-east-1

# Stop RDS (ถ้าไม่ใช้)
aws rds stop-db-instance --db-instance-identifier cloud-terraria-db --region us-east-1
```

---

## 💰 ค่าใช้จ่ายปัจจุบัน

### **ใน Free Tier (12 เดือนแรก)**
- EC2 Web: $0
- RDS: $0
- Lambda: $0
- Game Servers: ~$2/เดือน (4 ชม./วัน)
- **รวม**: ~$2/เดือน

### **หลัง Free Tier**
- EC2 Web: ~$13.61/เดือน
- RDS: ~$14.71/เดือน
- Game Servers: ~$2.03/เดือน/server
- **รวม**: ~$30-35/เดือน

**รายละเอียด**: ดู `AWS_COST_CALCULATOR.md`

---

## 📝 Next Steps (ถ้าต้องการพัฒนาต่อ)

### **ลำดับความสำคัญสูง**
- [ ] แก้ nginx configuration ให้ทำงานบน port 80
- [ ] ตั้ง systemd service สำหรับ Next.js app (auto-restart)
- [ ] Setup SSL certificate (Let's Encrypt)
- [ ] Configure domain name

### **ลำดับความสำคัญกลาง**
- [ ] Implement Auto Scaling สำหรับ game servers
- [ ] Add CloudWatch monitoring & alerts
- [ ] Setup automated backups (RDS snapshots)
- [ ] Create S3 bucket สำหรับ game world saves

### **ลำดับความสำคัญต่ำ**
- [ ] Migrate to ECS/Fargate
- [ ] Multi-region deployment
- [ ] CDN (CloudFront) สำหรับ static assets
- [ ] Advanced monitoring (X-Ray, Datadog)

---

## 🎓 สิ่งที่ได้เรียนรู้

1. **CloudFormation**: จัดการ infrastructure แบบ declarative
2. **RDS Migration**: ย้ายจาก SQLite → PostgreSQL
3. **Lambda Integration**: เรียก Lambda จาก Next.js API
4. **EC2 Management**: Deploy, configure, และ troubleshoot
5. **SSM**: ใช้ Systems Manager แทน SSH
6. **Cost Optimization**: คำนวณและควบคุมค่าใช้จ่าย

---

## 📞 Contact & Resources

- **GitHub Repo**: https://github.com/SassyxD/Cloud-Terraria
- **Branch**: terraform-infrastructure
- **Documentation**: `/docs` folder
- **AWS Region**: us-east-1

---

**✅ STATUS: READY TO USE**

Application พร้อมใช้งานที่ http://13.221.157.248:3000  
สามารถสร้าง Terraria servers และเล่นกับเพื่อนได้แล้ว! 🎮

---

*Last Updated: October 31, 2025*
