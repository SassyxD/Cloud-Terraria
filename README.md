# README — Terrakit (t3 + NextAuth + Lambda + Terraform)

Per-user Terraria server spawner. Users log in (Google/LINE/Email), press create, and get their own EC2 instance running a Dockerized Terraria server on TCP 7777. Infrastructure via Terraform. AWS Lambda controls EC2 lifecycle. tRPC protects endpoints with session.

## Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Database and Prisma](#database-and-prisma)
- [Auth Setup](#auth-setup)
- [tRPC and App Wiring](#trpc-and-app-wiring)
- [Terraform Infrastructure](#terraform-infrastructure)
- [Lambda Function](#lambda-function)
- [Security and Cost Controls](#security-and-cost-controls)
- [Troubleshooting](#troubleshooting)
- [Roadmap](#roadmap)
- [License](#license)

## Overview

- Each authenticated user controls their own Terraria server.
- Next.js (t3) frontend calls tRPC mutations and queries.
- The server invokes an AWS Lambda which creates/starts/stops/terminates EC2.
- EC2 boots Ubuntu, installs Docker via cloud-init, and runs a Terraria container.
- Prisma persists server metadata (instanceId, state, publicIp, port).

## Architecture

```
[Browser]
   │
   ▼
Next.js (t3) + NextAuth  ──>  tRPC (protected)  ──>  AWS SDK  ──> Lambda
                                       │                          │
                                       │                          ▼
                                   Prisma/Postgres             EC2 (Ubuntu)
                                                                └─ Docker: tccr/terraria-server
```

## Tech Stack

- App: Next.js (t3), tRPC, Tailwind, NextAuth
- Data: Prisma + PostgreSQL
- AWS: Lambda (Node.js 20), EC2, VPC, Security Group, IAM
- IaC: Terraform

## Repository Structure

```
terrakit/
├─ .env
├─ .env.example
├─ package.json
├─ prisma/
│  ├─ schema.prisma
│  └─ migrations/...
├─ src/
│  ├─ server/
│  │  ├─ db.ts
│  │  ├─ auth.ts
│  │  ├─ aws/lambdaClient.ts
│  │  └─ api/
│  │     ├─ trpc.ts
│  │     ├─ root.ts
│  │     └─ routers/server.ts
│  ├─ pages/
│  │  ├─ index.tsx
│  │  └─ dashboard.tsx
│  └─ components/
│     ├─ CreateServerButton.tsx
│     └─ ServerCard.tsx
├─ aws/
│  └─ lambda/
│     ├─ index.js
│     └─ package.json
└─ infra/terraform/
   ├─ versions.tf
   ├─ variables.tf
   ├─ vpc.tf
   ├─ sg.tf
   ├─ iam.tf
   ├─ lambda.tf
   ├─ outputs.tf
   └─ main.tf
```

## Quick Start

1) Bootstrap app

```bash
pnpm create t3-app@latest terrakit
cd terrakit
pnpm i
pnpm add @prisma/client next-auth @next-auth/prisma-adapter @aws-sdk/client-lambda zod
pnpm add -D prisma
npx prisma init
```

2) Copy `.env.example` to `.env` and fill values (see below).

3) Migrate database

```bash
npx prisma migrate dev -n init
```

4) Provision infrastructure

```bash
cd infra/terraform
terraform init
terraform apply -var="ami_id=ami-xxxxxxxx" -var="open_ssh=false"
```

Copy `lambda_name` output into `.env` as `AWS_LAMBDA_FUNCTION_NAME`.

5) Run app

```bash
pnpm dev
```

## Environment Variables

Create `.env` from the template below:

```bash
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev_super_secret

# Providers
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
LINE_CLIENT_ID=xxxxx
LINE_CLIENT_SECRET=xxxxx
EMAIL_SERVER=smtp://user:pass@smtp.yourhost.com:587
EMAIL_FROM=noreply@example.com

# AWS (server-side SDK invoke Lambda)
AWS_REGION=ap-southeast-1
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_SESSION_TOKEN=xxx

# Terraform output -> copy here after apply
AWS_LAMBDA_FUNCTION_NAME=terraria-ec2-manager

# App policy
MAX_SERVERS_PER_USER=1

# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

## Database and Prisma

`prisma/schema.prisma` (key models only):

```prisma
datasource db { provider = "postgresql"; url = env("DATABASE_URL") }
generator client { provider = "prisma-client-js" }

model User {
  id        String           @id @default(cuid())
  email     String?          @unique
  name      String?
  createdAt DateTime         @default(now())
  accounts  Account[]
  sessions  Session[]
  servers   ServerInstance[]
}

model ServerInstance {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  instanceId String?  @unique
  state      String   @default("PENDING")
  publicIp   String?
  port       Int      @default(7777)
  region     String   @default("ap-southeast-1")
  worldName  String   @default("MyWorld")
  version    String   @default("latest")
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  @@unique([identifier, token])
}
```

Run migrations:

```bash
npx prisma migrate dev -n init
```

## Auth Setup

`src/pages/api/auth/[...nextauth].ts`:

```ts
import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import LineProvider from "next-auth/providers/line";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/server/db";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({ clientId: process.env.GOOGLE_CLIENT_ID!, clientSecret: process.env.GOOGLE_CLIENT_SECRET! }),
    LineProvider({ clientId: process.env.LINE_CLIENT_ID!, clientSecret: process.env.LINE_CLIENT_SECRET! }),
    EmailProvider({ server: process.env.EMAIL_SERVER!, from: process.env.EMAIL_FROM! }),
  ],
  callbacks: {
    session: async ({ session, user }) => {
      if (session.user) (session.user as any).id = user.id;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
export default NextAuth(authOptions);
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

## Terraform Infrastructure

Files are in `infra/terraform`.

`versions.tf`:

```hcl
terraform {
  required_version = ">= 1.6.0"
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.55" }
    archive = { source = "hashicorp/archive", version = "~> 2.5" }
  }
}
provider "aws" { region = var.region }
```

`variables.tf`:

```hcl
variable "project"     { type = string  default = "terrakit" }
variable "region"      { type = string  default = "ap-southeast-1" }
variable "vpc_cidr"    { type = string  default = "10.0.0.0/16" }
variable "public_cidr" { type = string  default = "10.0.1.0/24" }

variable "allow_terraria_cidr" { type = string  default = "0.0.0.0/0" }
variable "open_ssh"            { type = bool    default = false }

variable "ami_id"        { type = string }
variable "instance_type" { type = string  default = "t3.small" }
variable "key_name"      { type = string  default = "" }

variable "lambda_name"    { type = string  default = "terraria-ec2-manager" }
variable "lambda_timeout" { type = number  default = 60 }
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

## Security and Cost Controls

- Security Group exposes TCP 7777. Keep SSH closed unless necessary.
- Quota via `MAX_SERVERS_PER_USER`. Enforce per plan.
- Add an auto-stop/auto-terminate Lambda (cron) for idle servers.
- Store world save on EBS or sync to S3 to persist across re-creates.
- Prefer private subnets and NAT in production; public subnet is acceptable for MVP.

## Troubleshooting

- Unknown or error state: check Lambda CloudWatch logs and EC2 console.
- No public IP: ensure subnet is public and `map_public_ip_on_launch = true`.
- Cannot connect to 7777: verify Security Group ingress and local firewall.
- Auth callback mismatch: confirm `NEXTAUTH_URL` and provider console redirect URIs.
- Prisma errors: verify `DATABASE_URL`, rerun `npx prisma migrate dev`.

## Roadmap

- Payment gating per user server runtime.
- S3 backups and automatic restore.
- API Gateway in front of Lambda with auth header checks.
- Auto-stop and TTL cleanup jobs.

## License

MIT
