# 📚 Documentation

Complete documentation for Cloud Terraria project deployment on AWS.

---

## 🚀 Quick Start

**New to this project?** Start here:
1. Read [AWS_COMPLETE_SETUP.md](./AWS_COMPLETE_SETUP.md) for full AWS setup

**Already familiar?** Jump to specific guides:
- [Lambda Setup](./AWS_LAMBDA_MANUAL_SETUP.md) - Function deployment only
- [RDS Setup](./RDS_DEPLOYMENT_GUIDE.md) - Database only  
- [Cognito Setup](./COGNITO_SETUP.md) - Authentication only

---

## 📖 Documentation Index

### Main Guides

| Document | Description | Use When |
|----------|-------------|----------|
| **[AWS_COMPLETE_SETUP.md](./AWS_COMPLETE_SETUP.md)** | ✨ Complete AWS setup with all 12 services | Setting up production environment |
| **[AWS_LAMBDA_MANUAL_SETUP.md](./AWS_LAMBDA_MANUAL_SETUP.md)** | Lambda function deployment for AWS Academy | Need EC2 management only |
| **[RDS_DEPLOYMENT_GUIDE.md](./RDS_DEPLOYMENT_GUIDE.md)** | PostgreSQL RDS database setup | Moving from SQLite to production DB |
| **[COGNITO_SETUP.md](./COGNITO_SETUP.md)** | AWS Cognito user authentication | Adding real user management |

### Additional Resources

| Document | Description |
|----------|-------------|
| **[RDS_QUICK_START.md](./RDS_QUICK_START.md)** | Quick reference for RDS |
| **[RDS_MIGRATION_GUIDE.md](./RDS_MIGRATION_GUIDE.md)** | Migrate from SQLite to RDS |
| **[PROJECT_SUBMISSION_GUIDE.md](./PROJECT_SUBMISSION_GUIDE.md)** | Thai language guide for course submission |

---

## 🏗️ AWS Services Used

This project uses **12+ AWS services** for a production-ready architecture:

### Core Services
- **Lambda** - Serverless compute for EC2 management
- **EC2** - Virtual machines running Terraria servers
- **RDS PostgreSQL** - Managed relational database
- **Cognito** - User authentication & management
- **VPC** - Network isolation & security

### Additional Services  
- **S3** - World backup storage
- **CloudWatch** - Monitoring & logging
- **CloudWatch Alarms** - Automated alerting
- **SNS** - Email notifications
- **Secrets Manager** - Secure credential storage
- **Parameter Store** - Configuration management
- **Security Groups** - Network firewall rules

---

## 🎯 Deployment Scenarios

### Scenario 1: Demo Mode (No AWS)
**Perfect for**: Local development, UI testing, demos

- ✅ No AWS account needed
- ✅ No cost
- ✅ Works immediately
- ❌ Can't create real servers

**Setup**: Leave AWS credentials empty in `.env`, use mock authentication

---

### Scenario 2: Basic AWS (Lambda + EC2)
**Perfect for**: Testing real server creation

**Services needed**:
- Lambda function
- EC2 instances
- Security Groups

**Cost**: ~$0.01/hour when running

**Guide**: [AWS_LAMBDA_MANUAL_SETUP.md](./AWS_LAMBDA_MANUAL_SETUP.md)

---

### Scenario 3: Production (All Services)
**Perfect for**: Course project submission, production deployment

**Services needed**:
- All 12 AWS services
- RDS database
- Cognito authentication
- CloudWatch monitoring
- S3 backups
- SNS notifications

**Cost**: ~$25/month (or free tier for 12 months)

**Guide**: [AWS_COMPLETE_SETUP.md](./AWS_COMPLETE_SETUP.md)

---

## 🔧 Environment Configuration

### Development (.env for local)
```env
DATABASE_URL="file:./dev.db"
# No AWS credentials = Mock mode
```

### Testing (Lambda + EC2)
```env
DATABASE_URL="file:./dev.db"
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_SESSION_TOKEN="..."
AWS_LAMBDA_FUNCTION_NAME="TerrariaServerManager"
```

### Production (Full AWS)
```env
DATABASE_URL="postgresql://postgres:pwd@rds-endpoint:5432/terraria"
AUTH_COGNITO_ID="..."
AUTH_COGNITO_SECRET="..."
AUTH_COGNITO_ISSUER="..."
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_SESSION_TOKEN="..."
AWS_LAMBDA_FUNCTION_NAME="TerrariaServerManager"
```

---

## 📊 Architecture Overview

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌──────────────┐
│  Next.js    │────▶│   Cognito    │ Authentication
│   Server    │     └──────────────┘
└──────┬──────┘
       │
       ├────▶ ┌──────────────┐
       │      │ RDS PostgreSQL│ Database
       │      └──────────────┘
       │
       ├────▶ ┌──────────────┐     ┌──────────────┐
       │      │    Lambda    │────▶│     EC2      │ Game Servers
       │      └──────────────┘     └──────────────┘
       │
       ├────▶ ┌──────────────┐
       │      │      S3      │ Backups
       │      └──────────────┘
       │
       └────▶ ┌──────────────┐     ┌──────────────┐
              │  CloudWatch  │────▶│     SNS      │ Monitoring & Alerts
              └──────────────┘     └──────────────┘
```

---

## 🎓 For Students (AWS Academy)

### Important Notes
- AWS Academy Learner Lab has 4-hour sessions
- Credentials expire when lab stops
- Some resources are deleted automatically
- Cannot create new IAM roles (use LabRole)

### Recommended Workflow
1. Start with **Demo Mode** to test locally
2. Move to **Lambda + EC2** to test server creation
3. Add **RDS + Cognito** for full production setup
4. Take screenshots of everything for submission
5. Record demo video before stopping lab

### Grading Rubric Coverage
- ✅ Use of multiple AWS services (12 services)
- ✅ Serverless architecture (Lambda)
- ✅ Database (RDS)
- ✅ Authentication (Cognito)
- ✅ Monitoring (CloudWatch)
- ✅ Security (VPC, Security Groups, Secrets Manager)
- ✅ Scalability (Auto-create EC2 on demand)
- ✅ Cost optimization (Stop instances when not needed)

---

## 🐛 Troubleshooting

### Common Issues

**Authentication fails**
- Check Cognito callback URL matches your app
- Verify CLIENT_ID and CLIENT_SECRET are correct

**Database connection fails**
- Check RDS security group allows your IP
- Verify connection string is correct
- Ensure RDS is publicly accessible (for dev)

**Lambda can't create EC2**
- Check IAM role (use LabRole in Academy)
- Verify security group exists
- Check CloudWatch logs for errors

**AWS credentials expired**
- In AWS Academy, get new credentials from AWS Details
- Update .env file
- Restart Next.js server

---

## 📞 Support

### Resources
- [AWS Documentation](https://docs.aws.amazon.com/)
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth.js Docs](https://next-auth.js.org/)

### Project Repository
- GitHub: [Cloud-Terraria](https://github.com/SassyxD/Cloud-Terraria)
- Issues: Report bugs and request features

---

## 📝 License

This project is for educational purposes.

---

**Last Updated**: October 30, 2025  
**Version**: 2.0 (Complete AWS Integration)
