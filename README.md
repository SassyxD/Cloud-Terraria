# Cloud Terraria

A modern, scalable Terraria server management platform built with Next.js and AWS. Deploy and manage personal Terraria servers with just a few clicks through an intuitive web interface.

## Overview

Cloud Terraria enables users to create, manage, and access their own dedicated Terraria servers in the cloud. Each authenticated user can deploy EC2 instances running containerized Terraria servers, with full lifecycle management through a beautiful web dashboard.

### Key Features

- **One-Click Deployment**: Create dedicated Terraria servers instantly
- **User Authentication**: Secure Discord OAuth integration
- **Server Management**: Start, stop, and monitor server status
- **Cost Effective**: Pay-per-use EC2 instances with automatic scaling
- **Modern UI**: Responsive, Terraria-themed interface
- **Infrastructure as Code**: Fully automated AWS deployment via Terraform

## Table of Contents

- [Getting Started](#getting-started)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Deployment](#deployment)
- [Configuration](#configuration)
- [Development](#development)
- [API Reference](#api-reference)
- [Infrastructure](#infrastructure)
- [Security](#security)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- AWS CLI configured with appropriate credentials
- Terraform 1.0+
- Discord application for OAuth

### Quick Start

1. **Clone and install dependencies**
   ```bash
   git clone https://github.com/SassyxD/Cloud-Terraria.git
   cd Cloud-Terraria
   pnpm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Deploy AWS infrastructure**
   ```bash
   # Windows
   ./deploy-aws.bat
   
   # Unix/Linux/macOS
   ./deploy-aws.sh
   ```

4. **Start development server**
   ```bash
   pnpm dev
   ```

Visit `http://localhost:3000` to access the application.

## Architecture

Cloud Terraria follows a modern serverless architecture pattern:

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐    ┌─────────────┐
│   Browser   │───▶│   Next.js    │───▶│   tRPC API  │───▶│ AWS Lambda  │
│             │    │   Frontend   │    │  (Protected)│    │   (EC2 Mgr) │
└─────────────┘    └──────────────┘    └─────────────┘    └─────────────┘
                           │                                       │
                           ▼                                       ▼
                   ┌──────────────┐                        ┌─────────────┐
                   │   Prisma     │                        │   EC2       │
                   │   Database   │                        │  Instance   │
                   │   (SQLite)   │                        │  (Ubuntu +  │
                   └──────────────┘                        │   Docker)   │
                                                          └─────────────┘
```

### Key Components

- **Frontend**: Next.js 15 with Tailwind CSS and TypeScript
- **Authentication**: NextAuth.js with Discord OAuth
- **API Layer**: tRPC with session-based protection
- **Database**: Prisma ORM with SQLite (dev) / PostgreSQL (prod)
- **Infrastructure**: AWS Lambda, EC2, VPC managed by Terraform
- **Containerization**: Docker-based Terraria server deployment

## Technology Stack

### Frontend
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **tRPC**: End-to-end typesafe APIs
- **NextAuth.js**: Authentication solution

### Backend & Infrastructure
- **AWS Lambda**: Serverless compute for EC2 management
- **Amazon EC2**: Virtual machines for Terraria servers
- **Terraform**: Infrastructure as Code
- **Prisma**: Database ORM and migration tool
- **Docker**: Containerized Terraria server deployment

### Development Tools
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **Husky**: Git hooks for quality gates
- **Conventional Commits**: Standardized commit messages

## Project Structure

```
cloud-terraria/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/   # NextAuth.js routes
│   │   │   └── trpc/[trpc]/          # tRPC API endpoints
│   │   ├── auth/                     # Authentication pages
│   │   ├── _components/              # Page-specific components
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Home page
│   ├── components/                   # Reusable UI components
│   │   ├── CreateServerButton.tsx
│   │   ├── ServerCard.tsx
│   │   ├── EmptyState.tsx
│   │   └── Loading.tsx
│   ├── server/                       # Backend logic
│   │   ├── api/                      # tRPC routers
│   │   ├── auth/                     # Authentication config
│   │   ├── aws/                      # AWS integrations
│   │   └── db.ts                     # Database connection
│   ├── styles/                       # Global styles
│   ├── types/                        # TypeScript definitions
│   └── env.js                        # Environment validation
├── aws/
│   └── lambda/                       # Lambda function code
│       ├── index.js                  # EC2 management logic
│       └── package.json              # Lambda dependencies
├── infra/
│   └── terraform/                    # Infrastructure as Code
│       ├── main.tf                   # Main configuration
│       ├── variables.tf              # Input variables
│       ├── outputs.tf                # Output values
│       ├── vpc.tf                    # VPC and networking
│       ├── sg.tf                     # Security groups
│       ├── iam.tf                    # IAM roles and policies
│       └── lambda.tf                 # Lambda function
├── prisma/
│   ├── schema.prisma                 # Database schema
│   └── migrations/                   # Database migrations
├── scripts/
│   └── validate-standards.sh         # Quality gates
├── deploy-aws.sh                     # Deployment script (Unix)
├── deploy-aws.bat                    # Deployment script (Windows)
└── README.md                         # This file
```

## Deployment

### Automated Deployment

The easiest way to deploy Cloud Terraria is using the provided deployment scripts:

**Windows:**
```cmd
deploy-aws.bat
```

**Unix/Linux/macOS:**
```bash
chmod +x deploy-aws.sh
./deploy-aws.sh
```

These scripts will:
1. Validate prerequisites (Terraform, AWS CLI)
2. Initialize and deploy Terraform infrastructure
3. Update environment variables automatically
4. Provide next steps for development

### Manual Deployment

If you prefer manual deployment:

```bash
# 1. Deploy infrastructure
cd infra/terraform
terraform init
terraform plan
terraform apply

# 2. Update environment variables
# Copy lambda_function_name from Terraform output to .env

# 3. Set up database
npx prisma migrate dev

# 4. Start application
pnpm dev
```

## Environment Variables

Create `.env` from the template below:

```bash
## Configuration

### Environment Variables

Create a `.env` file in the project root with the following variables:

```bash
# Application Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Database Configuration
DATABASE_URL="file:./dev.db"  # SQLite for development
# DATABASE_URL="postgresql://user:password@localhost:5432/cloud_terraria"  # PostgreSQL for production

# Discord OAuth (Required)
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret

# AWS Configuration (Required for production)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_LAMBDA_FUNCTION_NAME=cloud-terraria-ec2-manager

# Optional: Additional OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Discord OAuth Setup

1. Visit the [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to OAuth2 settings
4. Add redirect URI: `http://localhost:3000/api/auth/callback/discord`
5. Copy Client ID and Client Secret to your `.env` file

### AWS Configuration

Ensure your AWS credentials have the following permissions:
- EC2 full access (for server management)
- Lambda invoke permissions
- IAM role creation (for Terraform deployment)
- VPC and Security Group management
```

## Development

### Database Setup

The project uses Prisma as the ORM with support for both SQLite (development) and PostgreSQL (production).

**Initialize the database:**
```bash
npx prisma migrate dev
```

**Reset the database (if needed):**
```bash
npx prisma migrate reset
```

**View the database:**
```bash
npx prisma studio
```

### Key Database Models

- **User**: Stores user authentication data
- **ServerInstance**: Manages Terraria server instances
- **Account/Session**: NextAuth.js authentication tables

### Development Commands

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint

# Run type checking
pnpm type-check

# Validate project standards
./scripts/validate-standards.sh
```

## API Reference

### tRPC Endpoints

The application uses tRPC for type-safe API communication. Key endpoints include:

#### Server Management
- `server.create` - Create a new Terraria server instance
- `server.getAll` - Retrieve all user's server instances
- `server.getById` - Get specific server details
- `server.start` - Start a stopped server
- `server.stop` - Stop a running server
- `server.terminate` - Permanently delete a server

#### Authentication
- All endpoints require user authentication via NextAuth.js
- Session-based protection ensures users can only manage their own servers

### Example Usage

```typescript
// Create a new server
const server = await api.server.create.mutate({
  worldName: "My Adventure World",
  version: "latest",
  port: 7777
});

// Get all user servers
const servers = await api.server.getAll.useQuery();
```

`src/server/auth.ts`:

```ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
export const getServerAuthSession = (ctx?: { req: any; res: any }) =>
  getServerSession(ctx?.req, ctx?.res, authOptions);
```

`src/pages/index.tsx` (sign-in buttons):

```tsx
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";

export default function Home() {
  const { data: session, status } = useSession();
  if (status === "loading") return <main className="p-6">Loading...</main>;

  return (
    <main className="p-6 flex flex-col gap-4">
      {session ? (
        <>
          <div>Hi, {session.user?.name ?? session.user?.email}</div>
          <Link className="underline" href="/dashboard">Go to Dashboard</Link>
          <button onClick={() => signOut()} className="border px-3 py-1 rounded-xl">Sign out</button>
        </>
      ) : (
        <div className="flex gap-3">
          <button onClick={() => signIn("google")} className="border px-3 py-1 rounded-xl">Sign in with Google</button>
          <button onClick={() => signIn("line")} className="border px-3 py-1 rounded-xl">Sign in with LINE</button>
          <button onClick={() => signIn("email")} className="border px-3 py-1 rounded-xl">Sign in with Email</button>
        </div>
      )}
    </main>
  );
}
```

## tRPC and App Wiring

`src/server/api/trpc.ts`:

```ts
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { getServerAuthSession } from "@/server/auth";

export const createTRPCContext = async ({ req, res }: { req: any; res: any }) => {
  const session = await getServerAuthSession({ req, res });
  return { req, res, session };
};

const t = initTRPC.context<typeof createTRPCContext>().create({ transformer: superjson });
export const createTRPCRouter = t.router;

const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) throw new TRPCError({ code: "UNAUTHORIZED" });
  return next({ ctx: { ...ctx, userId: (ctx.session.user as any).id as string } });
});

export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);
```

`src/server/aws/lambdaClient.ts`:

```ts
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
const lambda = new LambdaClient({ region: process.env.AWS_REGION! });
const functionName = process.env.AWS_LAMBDA_FUNCTION_NAME!;

export async function callLambda(payload: unknown) {
  const cmd = new InvokeCommand({
    FunctionName: functionName,
    Payload: Buffer.from(JSON.stringify(payload)),
  });
  const res = await lambda.send(cmd);
  return res.Payload ? JSON.parse(Buffer.from(res.Payload as Uint8Array).toString()) : null;
}
```

`src/server/api/routers/server.ts` (selected operations):

```ts
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { prisma } from "../../db";
import { callLambda } from "../../aws/lambdaClient";

const MAX_SERVERS = Number(process.env.MAX_SERVERS_PER_USER ?? 1);

export const serverRouter = createTRPCRouter({
  listMine: protectedProcedure.query(async ({ ctx }) => {
    return prisma.serverInstance.findMany({ where: { userId: ctx.userId }, orderBy: { createdAt: "desc" } });
  }),

  create: protectedProcedure
    .input(z.object({ worldName: z.string().default("MyWorld"), version: z.string().default("latest"), port: z.number().default(7777) }))
    .mutation(async ({ ctx, input }) => {
      const count = await prisma.serverInstance.count({ where: { userId: ctx.userId, state: { in: ["PENDING","RUNNING","STOPPED"] } } });
      if (count >= MAX_SERVERS) throw new Error("Quota exceeded");

      const rec = await prisma.serverInstance.create({ data: { userId: ctx.userId, ...input } });
      const out = await callLambda({ action: "CREATE", userId: ctx.userId, ...input });
      if (out?.ok && out.instanceId) {
        await prisma.serverInstance.update({ where: { id: rec.id }, data: { instanceId: out.instanceId, state: "PENDING" } });
        return { id: rec.id };
      }
      await prisma.serverInstance.update({ where: { id: rec.id }, data: { state: "ERROR" } });
      throw new Error(out?.error ?? "Lambda CREATE failed");
    }),
});
```

## Infrastructure

### AWS Architecture

The infrastructure is deployed using Terraform and consists of:

- **VPC and Networking**: Isolated network environment with public subnets
- **Security Groups**: Firewall rules allowing Terraria traffic on port 7777
- **IAM Roles**: Permissions for Lambda to manage EC2 instances
- **Lambda Function**: Serverless EC2 lifecycle management
- **EC2 Instances**: On-demand Ubuntu hosts running Dockerized Terraria servers

### Infrastructure Components

**Network Setup:**
```hcl
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
}

resource "aws_security_group" "terraria" {
  ingress {
    from_port   = 7777
    to_port     = 7777
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
```

**Lambda Function:**
```hcl
resource "aws_lambda_function" "ec2_manager" {
  filename         = "lambda-deployment.zip"
  function_name    = "cloud-terraria-ec2-manager"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  runtime         = "nodejs20.x"
  timeout         = 60
}
```

### Deployment Configuration

Create `infra/terraform/terraform.tfvars`:

```hcl
project               = "cloud-terraria"
region               = "us-east-1"
instance_type        = "t3.small"
allow_terraria_cidr  = "0.0.0.0/0"
open_ssh            = false
```

`vpc.tf`:

```hcl
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true
  tags = { Name = "${var.project}-vpc" }
}

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main.id
  tags = { Name = "${var.project}-igw" }
}

resource "aws_subnet" "public_a" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_cidr
  map_public_ip_on_launch = true
  availability_zone       = "${var.region}a"
  tags = { Name = "${var.project}-public-a" }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  tags = { Name = "${var.project}-public-rt" }
}

resource "aws_route" "public_inet" {
  route_table_id         = aws_route_table.public.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.igw.id
}

resource "aws_route_table_association" "public_a" {
  subnet_id      = aws_subnet.public_a.id
  route_table_id = aws_route_table.public.id
}
```

`sg.tf`:

```hcl
resource "aws_security_group" "terraria" {
  name        = "${var.project}-sg"
  description = "Allow Terraria and optional SSH"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "Terraria"
    from_port   = 7777
    to_port     = 7777
    protocol    = "tcp"
    cidr_blocks = [var.allow_terraria_cidr]
  }

  dynamic "ingress" {
    for_each = var.open_ssh ? [1] : []
    content {
      description = "SSH"
      from_port   = 22
      to_port     = 22
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
    }
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project}-sg" }
}
```

`iam.tf`:

```hcl
data "aws_iam_policy_document" "lambda_assume" {
  statement {
    effect = "Allow"
    principals { type = "Service" identifiers = ["lambda.amazonaws.com"] }
    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "lambda_role" {
  name               = "${var.project}-lambda-role"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume.json
}

resource "aws_iam_role_policy_attachment" "logs" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

data "aws_iam_policy_document" "ec2_access" {
  statement {
    effect = "Allow"
    actions = [
      "ec2:RunInstances", "ec2:StartInstances", "ec2:StopInstances",
      "ec2:TerminateInstances", "ec2:DescribeInstances", "ec2:CreateTags",
      "ec2:DescribeImages", "ec2:DescribeSubnets", "ec2:DescribeSecurityGroups",
      "ec2:DescribeInstanceStatus", "ec2:CreateNetworkInterface",
      "ec2:AttachNetworkInterface", "ec2:DeleteNetworkInterface", "ec2:DescribeNetworkInterfaces"
    ]
    resources = ["*"]
  }
}

resource "aws_iam_policy" "ec2_access" {
  name   = "${var.project}-lambda-ec2"
  policy = data.aws_iam_policy_document.ec2_access.json
}

resource "aws_iam_role_policy_attachment" "ec2_attach" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = aws_iam_policy.ec2_access.arn
}
```

`lambda.tf`:

```hcl
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../../aws/lambda"
  output_path = "${path.module}/lambda.zip"
}

resource "aws_lambda_function" "ec2_manager" {
  function_name = var.lambda_name
  role          = aws_iam_role.lambda_role.arn
  runtime       = "nodejs20.x"
  handler       = "index.handler"
  filename      = data.archive_file.lambda_zip.output_path
  timeout       = var.lambda_timeout
  architectures = ["x86_64"]

  environment {
    variables = {
      AWS_REGION        = var.region
      AMI_ID            = var.ami_id
      INSTANCE_TYPE     = var.instance_type
      SECURITY_GROUP_ID = aws_security_group.terraria.id
      SUBNET_ID         = aws_subnet.public_a.id
      KEY_NAME          = var.key_name
    }
  }

  depends_on = [aws_iam_role_policy_attachment.logs, aws_iam_role_policy_attachment.ec2_attach]
}

resource "aws_lambda_function_url" "public" {
  function_name      = aws_lambda_function.ec2_manager.function_name
  authorization_type = "NONE"
  cors {
    allow_origins = ["*"]
    allow_methods = ["POST", "OPTIONS"]
  }
}
```

`outputs.tf`:

```hcl
output "lambda_name"       { value = aws_lambda_function.ec2_manager.function_name }
output "lambda_arn"        { value = aws_lambda_function.ec2_manager.arn }
output "lambda_url"        { value = try(aws_lambda_function_url.public.function_url, "") }
output "security_group_id" { value = aws_security_group.terraria.id }
output "subnet_id"         { value = aws_subnet.public_a.id }
```

`main.tf` can be empty or used to include modules if you split files further.

## Lambda Function

`aws/lambda/index.js`:

```js
import {
  EC2Client, RunInstancesCommand, StartInstancesCommand, StopInstancesCommand,
  TerminateInstancesCommand, DescribeInstancesCommand
} from "@aws-sdk/client-ec2";

const REGION = process.env.AWS_REGION ?? "ap-southeast-1";
const AMI_ID = process.env.AMI_ID;
const INSTANCE_TYPE = process.env.INSTANCE_TYPE ?? "t3.small";
const SECURITY_GROUP_ID = process.env.SECURITY_GROUP_ID;
const SUBNET_ID = process.env.SUBNET_ID;
const KEY_NAME = process.env.KEY_NAME || "";

const ec2 = new EC2Client({ region: REGION });

export const handler = async (event) => {
  const body = typeof event.body === "string" ? JSON.parse(event.body) : (event.body ?? event);
  const { action, instanceId, userId } = body;
  const worldName = body.worldName ?? "MyWorld";
  const version = body.version ?? "latest";
  const serverPort = Number(body.port ?? 7777);

  try {
    if (action === "CREATE") {
      const userData = Buffer.from(`#cloud-config
runcmd:
  - apt-get update -y
  - apt-get install -y docker.io
  - systemctl enable docker
  - systemctl start docker
  - docker run -d --restart always --name terraria -p ${serverPort}:7777 -e WORLD_NAME=${worldName} --volume /opt/terraria:/root/.local/share/Terraria tccr/terraria-server:${version}
`).toString("base64");

      const run = await ec2.send(new RunInstancesCommand({
        ImageId: AMI_ID,
        InstanceType: INSTANCE_TYPE,
        MinCount: 1,
        MaxCount: 1,
        KeyName: KEY_NAME || undefined,
        SecurityGroupIds: [SECURITY_GROUP_ID],
        SubnetId: SUBNET_ID,
        UserData: userData,
        TagSpecifications: [{
          ResourceType: "instance",
          Tags: [
            { Key: "Project", Value: "Terrakit" },
            { Key: "OwnerUserId", Value: userId },
            { Key: "Service", Value: "Terraria" }
          ]
        }]
      }));
      return { ok: true, instanceId: run.Instances?.[0]?.InstanceId };
    }

    if (!instanceId) return { ok: false, error: "instanceId required" };

    if (action === "START")      { await ec2.send(new StartInstancesCommand({ InstanceIds: [instanceId] })); return { ok: true }; }
    if (action === "STOP")       { await ec2.send(new StopInstancesCommand({ InstanceIds: [instanceId] }));  return { ok: true }; }
    if (action === "TERMINATE")  { await ec2.send(new TerminateInstancesCommand({ InstanceIds: [instanceId] })); return { ok: true }; }

    if (action === "STATUS") {
      const d = await ec2.send(new DescribeInstancesCommand({ InstanceIds: [instanceId] }));
      const res = d.Reservations?.[0]?.Instances?.[0];
      return { ok: true, state: res?.State?.Name, publicIp: res?.PublicIpAddress };
    }

    return { ok: false, error: "unknown action" };
  } catch (e) {
    console.error(e);
    return { ok: false, error: e?.message ?? "error" };
  }
};
```

`aws/lambda/package.json`:

```json
{
  "name": "terraria-ec2-manager",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "@aws-sdk/client-ec2": "^3.678.0"
  }
}
```

## Security and Cost Management

### Security Controls
- **Network Isolation**: Dedicated VPC with controlled ingress/egress
- **Port Management**: Only TCP 7777 exposed for game traffic
- **SSH Access**: Disabled by default, enable only when necessary
- **Authentication**: Discord OAuth with NextAuth.js session management
- **Resource Tagging**: All resources tagged for cost tracking and governance

### Cost Controls
- **User Quotas**: Configurable `MAX_SERVERS_PER_USER` limits
- **Instance Types**: t3.micro for cost optimization
- **Auto-Cleanup**: Implement auto-stop/terminate for idle servers
- **Storage**: Use EBS GP3 for cost-effective persistent storage
- **Monitoring**: CloudWatch billing alerts and usage tracking

### Best Practices
- Store world saves on EBS or sync to S3 for persistence
- Use private subnets with NAT Gateway in production
- Implement server TTL and automatic cleanup jobs
- Regular security group audits and access reviews

## Troubleshooting

### Common Issues

#### Server Management
```bash
# Check server status
curl -X POST https://your-api.com/api/servers/status -d '{"instanceId":"i-1234567890abcdef0"}'

# View CloudWatch logs
aws logs tail /aws/lambda/terraria-ec2-manager --follow
```

#### Connection Problems
- **No Public IP**: Verify subnet configuration and `map_public_ip_on_launch = true`
- **Port 7777 Blocked**: Check Security Group ingress rules and local firewall
- **Timeout Issues**: Confirm instance is running and game server is started

#### Authentication Errors
- **Callback Mismatch**: Verify `NEXTAUTH_URL` matches provider redirect URIs
- **Session Issues**: Clear browser cookies and check environment variables
- **Provider Configuration**: Confirm Discord application settings

#### Database Problems
- **Migration Errors**: Run `npx prisma migrate dev` to sync schema
- **Connection Issues**: Verify `DATABASE_URL` format and accessibility
- **Data Corruption**: Use `npx prisma db push --force-reset` for development

### Debug Commands
```bash
# Check AWS credentials
aws sts get-caller-identity

# Validate Terraform configuration
terraform validate
terraform plan

# Test Lambda function locally
aws lambda invoke --function-name terraria-ec2-manager --payload '{"action":"STATUS"}' response.json

# Check Next.js build
npm run build
npm run start
```

### Monitoring and Logs
- **Application Logs**: Check Vercel deployment logs
- **Lambda Logs**: CloudWatch `/aws/lambda/terraria-ec2-manager`
- **Infrastructure**: Terraform state and AWS CloudTrail
- **Database**: Prisma query logs and performance metrics

## Contributing

We welcome contributions to Cloud Terraria! Please follow these guidelines:

### Development Process
1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** using conventional commits (`git commit -m 'feat: add amazing feature'`)
4. **Push** to your branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Standards
- **Formatting**: Use Prettier and ESLint configurations
- **Testing**: Add tests for new features
- **Documentation**: Update README and inline comments
- **Commits**: Follow [Conventional Commits](https://www.conventionalcommits.org/)

### Commit Types
- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Build process or auxiliary tool changes

### Review Process
- All PRs require review from maintainers
- CI checks must pass (linting, testing, build)
- Documentation updates are required for API changes
- Breaking changes require major version bump

### Getting Help
- **Issues**: Report bugs and request features via GitHub Issues
- **Discussions**: Use GitHub Discussions for questions and ideas
- **Security**: Report security issues privately to maintainers

## Roadmap

### Phase 1: Core Stability
- [ ] Enhanced error handling and retry logic
- [ ] Comprehensive testing suite
- [ ] Performance optimization
- [ ] Security audit and hardening

### Phase 2: Advanced Features
- [ ] Payment integration and billing management
- [ ] Multi-region deployment support
- [ ] Advanced server configurations
- [ ] Real-time server monitoring dashboard

### Phase 3: Enterprise Features
- [ ] Team management and sharing
- [ ] Advanced backup and restore
- [ ] Custom mod support
- [ ] API rate limiting and quotas

### Phase 4: Platform Integration
- [ ] Mobile app companion
- [ ] Discord bot integration
- [ ] Community features and server discovery
- [ ] Advanced analytics and reporting

## Support

### Documentation
- [Quick Start Guide](QUICK_START.md)
- [AWS Setup Guide](AWS_SETUP_GUIDE.md)
- [Visual Guide](VISUAL_GUIDE.md)
- [Design System](DESIGN_SYSTEM.md)

### Community
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: Community support and questions
- **Discord**: Real-time community chat (coming soon)

### Commercial Support
For enterprise deployments and commercial support, please contact the maintainers.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Third-Party Licenses
- Next.js: MIT License
- Prisma: Apache License 2.0
- AWS SDK: Apache License 2.0
- Discord OAuth: MIT License

---

**Cloud Terraria** - Self-hosted Terraria server management made simple.

Built with ❤️ for the Terraria community.
