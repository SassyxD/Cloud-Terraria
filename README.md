# Cloud Terraria

A modern, scalable Terraria server management platform built with Next.js and AWS. Deploy and manage personal Terraria servers with just a few clicks through an intuitive web interface.

## Overview

Cloud Terraria enables users to create, manage, and access their own dedicated Terraria servers in the cloud. Each authenticated user can deploy EC2 instances running containerized Terraria servers, with full lifecycle management through a web dashboard.

### Key Features

- One‑click deployment of dedicated Terraria servers
- Secure authentication via Discord and/or AWS Cognito
- Server lifecycle: create, start, stop, status, delete
- Cost effective: pay‑per‑use EC2, easy cleanup
- Modern UI with Next.js + Tailwind CSS
- Infrastructure as Code via AWS CloudFormation (Terraform available in an alternate branch)

## Table of Contents

- Getting Started
- Architecture
- RDS Database Deployment
- Technology Stack
- Project Structure
- Deployment
- Environment Variables
- Development
- API Reference
- Infrastructure
- Security and Cost
- Troubleshooting
- Contributing
- License

## Getting Started

### Prerequisites
- Node.js 18+ and pnpm
- AWS CLI configured (or AWS Console access)
- Discord application (optional if using Cognito)

### Quick Start
1) Clone and install
```bash
git clone https://github.com/SassyxD/Cloud-Terraria.git
cd Cloud-Terraria
pnpm install
```
2) Configure environment
```bash
cp .env.example .env
# edit .env to fit your setup
```
3) Deploy infrastructure (CloudFormation)
```bash
cd infra/cloudformation
aws cloudformation create-stack \
  --stack-name terraria-vpc \
  --template-body file://vpc.yaml
```
4) Start dev server
```bash
pnpm dev
```
Visit http://localhost:3000

## RDS Database Deployment

This project uses AWS RDS PostgreSQL in production.

Quick setup:
```bash
# Linux/Mac
chmod +x scripts/deploy-rds.sh
./scripts/deploy-rds.sh

# Windows
scripts\deploy-rds.bat
```

Or via AWS Console:
1. Deploy VPC: upload `infra/cloudformation/vpc.yaml`
2. Deploy RDS: upload `infra/cloudformation/rds.yaml`
3. Copy connection string from stack outputs
4. Set `DATABASE_URL` in `.env`

Guides: docs/RDS_QUICK_START.md, docs/RDS_DEPLOYMENT_GUIDE.md

## Architecture

```
Browser → Next.js (App Router) → tRPC (protected) → AWS Lambda (EC2 manager) → EC2 (Dockerized Terraria)
                                 ↘ Prisma ORM → RDS PostgreSQL (prod) | SQLite (dev)
```

### Key Components
- Frontend: Next.js 15, Tailwind, TypeScript
- Authentication: NextAuth.js with Discord and/or AWS Cognito
- API: tRPC with session-based protection
- Database: Prisma ORM (SQLite dev / PostgreSQL prod)
- Infrastructure: AWS Lambda, EC2, VPC via CloudFormation (Terraform in alt branch)
- Containerization: Docker-based Terraria server

## Technology Stack

Frontend: Next.js 15, TypeScript, Tailwind, tRPC, NextAuth.js

Backend & Infra:
- AWS Lambda, Amazon EC2
- AWS CloudFormation (this branch)
- Terraform (alt branch: `terraform-infrastructure`)
- Prisma ORM, Docker

## Project Structure

```
cloud-terraria/
└─ src/
   ├─ app/                         # Next.js App Router
   │  ├─ auth/signin/page.tsx
   │  └─ auth/signout/page.tsx
   ├─ components/
   ├─ server/
   │  ├─ api/routers/              # tRPC routers (e.g., server.ts)
   │  ├─ api/root.ts               # tRPC root router
   │  ├─ api/trpc.ts               # tRPC setup
   │  ├─ auth/config.ts            # NextAuth providers (Discord/Cognito)
   │  └─ aws/lambdaClient.ts       # Lambda client (with mock fallback)
   ├─ styles/
   ├─ types/
   └─ env.js
└─ aws/
   └─ lambda/
      ├─ index.js                  # EC2 lifecycle
      └─ package.json
└─ infra/
   └─ cloudformation/
      ├─ vpc.yaml
      ├─ rds.yaml
      ├─ lambda.yaml
      ├─ parameters.example.json
      └─ README.md
└─ prisma/
   ├─ schema.prisma
   └─ migrations/
└─ scripts/
└─ docs/
└─ README.md
```

Note: Terraform usage is documented in `docs/INFRASTRUCTURE.md` and the `terraform-infrastructure` branch.

## Deployment

### Scripts
Windows:
```cmd
deploy-aws.bat
```
Unix/macOS:
```bash
chmod +x deploy-aws.sh
./deploy-aws.sh
```
These scripts:
1. Validate prerequisites (AWS CLI)
2. Deploy CloudFormation infrastructure (or guide you via Console)
3. Help update environment variables
4. Provide next steps

### Manual
See `infra/cloudformation/README.md` for stack order and parameters.

## Environment Variables

Sample `.env`:
```env
# App
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=replace-with-random-32-bytes

# Database
DATABASE_URL="file:./dev.db"  # SQLite (dev)
# DATABASE_URL="postgresql://user:password@host:5432/dbname"  # RDS (prod)

# Discord (optional if using Cognito)
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=

# AWS Cognito (optional)
AUTH_COGNITO_ID=
AUTH_COGNITO_SECRET=
AUTH_COGNITO_ISSUER=

# AWS / Lambda
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_LAMBDA_FUNCTION_NAME=
```

## Development

Database (Prisma):
```bash
npx prisma migrate dev
# npx prisma studio   # inspect (optional)
```

Common commands:
```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
pnpm type-check
```

## API Reference

tRPC endpoints:
- `server.create` — Create a new server
- `server.getAll` — List your servers
- `server.start` — Start a server
- `server.stop` — Stop a server
- `server.delete` — Delete record (stops instance first if running)

See: `src/server/api/routers/server.ts`, `src/server/api/trpc.ts`, `src/server/auth/config.ts`, `src/app/auth/signin/page.tsx`.

## Infrastructure

CloudFormation templates: `infra/cloudformation/` (VPC, RDS, Lambda). For a comparison of CloudFormation vs Terraform, see `docs/INFRASTRUCTURE.md`.

## Security and Cost

Security:
- VPC isolation, least‑privilege IAM
- Open only required ports (HTTP/HTTPS, Terraria 7777)
- Use Secrets Manager/SSM for production secrets
- CloudWatch Logs + RDS Performance Insights

Cost:
- RDS db.t3.micro: Free Tier eligible; afterwards ~ $18/mo (20GB)
- EC2: size/hour dependent; stop when idle
- Lambda control plane typically within free tier

## Troubleshooting

```bash
# Verify AWS credentials
aws sts get-caller-identity

# CloudFormation stack status
aws cloudformation describe-stacks --stack-name terraria-vpc

# Lambda logs (replace function name if different)
aws logs tail /aws/lambda/terraria-ec2-manager --follow

# Next.js
pnpm build && pnpm start
```

## Contributing
1. Fork the repo
2. Create a branch (`git checkout -b feat/awesome`)
3. Commit with conventional commits
4. Push and open a PR

## License

MIT — see `LICENSE`.
