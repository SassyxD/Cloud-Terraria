# System Diagrams
## Cloud Terraria - Use Case & Sequence Diagrams

---

## 🎯 Use Case Diagram

```mermaid
graph TB
    subgraph "Cloud Terraria System"
        UC1[Sign In]
        UC2[Sign Out]
        UC3[Create Server]
        UC4[View Server List]
        UC5[Start Server]
        UC6[Stop Server]
        UC7[Delete Server]
        UC8[View Server Status]
        UC9[Copy Server IP]
        UC10[Join Game]
        UC11[Monitor Servers]
        UC12[Receive Notifications]
    end
    
    Player((Player))
    Admin((Administrator))
    System((AWS System))
    
    Player --> UC1
    Player --> UC2
    Player --> UC3
    Player --> UC4
    Player --> UC5
    Player --> UC6
    Player --> UC7
    Player --> UC8
    Player --> UC9
    Player --> UC10
    
    Admin --> UC11
    Admin --> UC12
    
    UC3 --> System
    UC5 --> System
    UC6 --> System
    UC7 --> System
    UC8 --> System
    UC11 --> System
    UC12 --> System
    
    style Player fill:#4a90e2
    style Admin fill:#9b59b6
    style System fill:#ff9900
```

---

## 📊 Use Case Descriptions

### UC1: Sign In
**Actor**: Player  
**Precondition**: User has account or uses mock mode  
**Flow**:
1. User navigates to application
2. Clicks "Sign In"
3. Enters credentials (Mock username or Cognito)
4. System authenticates user
5. User redirected to dashboard

**Postcondition**: User is authenticated

---

### UC2: Sign Out
**Actor**: Player  
**Precondition**: User is logged in  
**Flow**:
1. User clicks "Sign Out"
2. System terminates session
3. User redirected to login page

**Postcondition**: User session ended

---

### UC3: Create Server
**Actor**: Player, AWS System  
**Precondition**: User is authenticated  
**Flow**:
1. User clicks "Create Server"
2. Fills in server details (name, version, port)
3. System validates input
4. Lambda function invoked
5. EC2 instance created
6. Server added to database
7. User sees new server in list

**Postcondition**: New server created and running

---

### UC4: View Server List
**Actor**: Player  
**Precondition**: User is authenticated  
**Flow**:
1. User accesses dashboard
2. System queries database for user's servers
3. Server list displayed with status

**Postcondition**: User sees all their servers

---

### UC5: Start Server
**Actor**: Player, AWS System  
**Precondition**: Server exists and is stopped  
**Flow**:
1. User clicks "Start" on server card
2. System invokes Lambda function
3. EC2 instance started
4. Server status updated to "running"
5. IP address displayed

**Postcondition**: Server is running

---

### UC6: Stop Server
**Actor**: Player, AWS System  
**Precondition**: Server is running  
**Flow**:
1. User clicks "Stop" on server card
2. System invokes Lambda function
3. EC2 instance stopped
4. Server status updated to "stopped"

**Postcondition**: Server is stopped

---

### UC7: Delete Server
**Actor**: Player, AWS System  
**Precondition**: Server exists  
**Flow**:
1. User clicks "Delete" on server card
2. System confirms deletion
3. Lambda terminates EC2 instance
4. Server removed from database

**Postcondition**: Server deleted

---

### UC8: View Server Status
**Actor**: Player, AWS System  
**Precondition**: Server exists  
**Flow**:
1. System polls server status
2. Lambda queries EC2 status
3. Status displayed (pending/running/stopped)

**Postcondition**: Current status shown

---

### UC9: Copy Server IP
**Actor**: Player  
**Precondition**: Server is running  
**Flow**:
1. User clicks IP address
2. IP copied to clipboard
3. Toast notification shown

**Postcondition**: IP in clipboard

---

### UC10: Join Game
**Actor**: Player  
**Precondition**: Server is running  
**Flow**:
1. User copies server IP
2. Opens Terraria game
3. Multiplayer → Join via IP
4. Enters server IP:port
5. Connects to server

**Postcondition**: Playing on server

---

### UC11: Monitor Servers
**Actor**: Administrator  
**Precondition**: CloudWatch configured  
**Flow**:
1. Admin opens CloudWatch dashboard
2. Views metrics (CPU, memory, network)
3. Checks alarms

**Postcondition**: System health monitored

---

### UC12: Receive Notifications
**Actor**: Administrator  
**Precondition**: SNS configured  
**Flow**:
1. Server event occurs (started/stopped)
2. SNS sends email notification
3. Admin receives alert

**Postcondition**: Admin notified

---

## 🔄 Sequence Diagram: Create Server

```mermaid
sequenceDiagram
    actor Player
    participant UI as Web UI
    participant API as Next.js API
    participant DB as Database
    participant Lambda as AWS Lambda
    participant EC2 as AWS EC2
    participant SNS as AWS SNS
    
    Player->>UI: Click "Create Server"
    UI->>Player: Show create form
    Player->>UI: Enter details & submit
    
    UI->>API: POST /api/trpc/server.create
    activate API
    
    API->>DB: Create server record
    DB-->>API: Server ID
    
    API->>Lambda: Invoke with START action
    activate Lambda
    
    Lambda->>EC2: RunInstances (Terraria AMI)
    activate EC2
    EC2-->>Lambda: Instance ID
    deactivate EC2
    
    Lambda-->>API: Instance created
    deactivate Lambda
    
    API->>DB: Update instance ID & status
    DB-->>API: Success
    
    opt If SNS configured
        API->>SNS: Publish notification
        SNS-->>Player: Email sent
    end
    
    API-->>UI: Server created response
    deactivate API
    
    UI-->>Player: Show new server
    
    Note over EC2: Server boots (2-3 min)
    EC2->>EC2: Install Terraria
    EC2->>EC2: Start game server
    
    Player->>UI: Refresh status
    UI->>API: GET /api/trpc/server.getAll
    API->>Lambda: Check instance status
    Lambda->>EC2: DescribeInstances
    EC2-->>Lambda: Status: running, IP
    Lambda-->>API: Server details
    API-->>UI: Updated status
    UI-->>Player: Show IP address
```

---

## 🔄 Sequence Diagram: Start Existing Server

```mermaid
sequenceDiagram
    actor Player
    participant UI as Web UI
    participant API as Next.js API
    participant DB as Database
    participant Lambda as AWS Lambda
    participant EC2 as AWS EC2
    
    Player->>UI: Click "Start Server"
    UI->>API: POST /api/trpc/server.start
    activate API
    
    API->>DB: Get server details
    DB-->>API: Instance ID
    
    API->>Lambda: Invoke with START action
    activate Lambda
    
    Lambda->>EC2: StartInstances(InstanceId)
    activate EC2
    EC2-->>Lambda: Starting
    deactivate EC2
    
    Lambda-->>API: Success
    deactivate Lambda
    
    API->>DB: Update status to "running"
    DB-->>API: Updated
    
    API-->>UI: Server starting
    deactivate API
    
    UI-->>Player: Show loading state
    
    Note over EC2: Instance boots (30-60s)
    
    Player->>UI: Check status
    UI->>API: GET /api/trpc/server.getAll
    API->>Lambda: DescribeInstances
    Lambda->>EC2: Get status
    EC2-->>Lambda: Running + Public IP
    Lambda-->>API: Status & IP
    API-->>UI: Server ready
    UI-->>Player: Display IP: xxx.xxx.xxx.xxx:7777
```

---

## 🔄 Sequence Diagram: Authentication Flow (Cognito)

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant NextAuth as NextAuth.js
    participant Cognito as AWS Cognito
    participant DB as Database
    
    User->>Browser: Click "Sign in with Cognito"
    Browser->>NextAuth: POST /api/auth/signin/cognito
    
    NextAuth->>Cognito: Redirect to Cognito Hosted UI
    Cognito-->>User: Show login page
    
    User->>Cognito: Enter email & password
    Cognito->>Cognito: Validate credentials
    
    Cognito-->>NextAuth: Redirect with auth code
    NextAuth->>Cognito: Exchange code for tokens
    Cognito-->>NextAuth: Access token + ID token
    
    NextAuth->>NextAuth: Verify JWT signature
    NextAuth->>DB: Find or create user
    DB-->>NextAuth: User record
    
    NextAuth->>NextAuth: Create session
    NextAuth-->>Browser: Set session cookie
    
    Browser-->>User: Redirect to dashboard
    User->>Browser: Access protected page
    Browser->>NextAuth: Verify session
    NextAuth-->>Browser: Session valid
    Browser-->>User: Show dashboard
```

---

## 🔄 Sequence Diagram: Mock Authentication

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant NextAuth as NextAuth.js
    participant DB as Database
    
    User->>Browser: Enter username "demo"
    Browser->>NextAuth: POST /api/auth/signin/credentials
    
    NextAuth->>DB: SELECT * FROM User WHERE email = 'demo@demo.local'
    
    alt User exists
        DB-->>NextAuth: User found
    else User not exists
        NextAuth->>DB: INSERT INTO User (name, email)
        DB-->>NextAuth: User created
    end
    
    NextAuth->>NextAuth: Generate JWT token
    NextAuth-->>Browser: Set session cookie
    Browser-->>User: Redirect to dashboard
```

---

## 📐 Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[Web Browser]
    end
    
    subgraph "Application Layer - EC2 Instance"
        NextJS[Next.js Server<br/>nginx:80 → PM2:3000]
        NextAuth[NextAuth.js]
        Prisma[Prisma ORM]
        tRPC[tRPC API]
    end
    
    subgraph "AWS Authentication"
        Cognito[AWS Cognito<br/>User Pool]
    end
    
    subgraph "AWS Data Layer"
        RDS[(RDS PostgreSQL<br/>Database)]
        S3[S3 Bucket<br/>Backups]
    end
    
    subgraph "AWS Compute Layer"
        Lambda[Lambda Function<br/>Server Manager]
        EC2Game[EC2 Instances<br/>Terraria Servers]
    end
    
    subgraph "AWS Monitoring"
        CloudWatch[CloudWatch<br/>Metrics & Logs]
        SNS[SNS<br/>Notifications]
        Alarms[CloudWatch Alarms]
    end
    
    subgraph "AWS Network"
        VPC[VPC]
        SG1[Security Group<br/>Database]
        SG2[Security Group<br/>Game Servers]
    end
    
    Browser --> NextJS
    NextJS --> NextAuth
    NextJS --> tRPC
    NextAuth --> Cognito
    tRPC --> Prisma
    Prisma --> RDS
    
    tRPC --> Lambda
    Lambda --> EC2Game
    Lambda --> S3
    
    NextJS --> CloudWatch
    EC2Game --> CloudWatch
    Lambda --> CloudWatch
    CloudWatch --> Alarms
    Alarms --> SNS
    
    RDS -.->|protected by| SG1
    EC2Game -.->|protected by| SG2
    RDS -.->|inside| VPC
    EC2Game -.->|inside| VPC
    
    style Browser fill:#4a90e2
    style NextJS fill:#ff9900
    style Cognito fill:#ff9900
    style RDS fill:#527FFF
    style Lambda fill:#ff9900
    style EC2Game fill:#ff9900
    style CloudWatch fill:#ff9900
```

---

## 🏗️ Component Diagram

```mermaid
graph LR
    subgraph "Frontend Components"
        Page[page.tsx]
        ServerList[ServerList.tsx]
        ServerCard[ServerCard.tsx]
        CreateButton[CreateServerButton.tsx]
        SignIn[SignIn Page]
    end
    
    subgraph "tRPC Router"
        ServerRouter[server.ts]
    end
    
    subgraph "AWS Client"
        LambdaClient[lambdaClient.ts]
    end
    
    subgraph "Database"
        PrismaDB[(Prisma + DB)]
    end
    
    subgraph "Authentication"
        AuthConfig[auth/config.ts]
        AuthIndex[auth/index.ts]
    end
    
    Page --> ServerList
    ServerList --> ServerCard
    Page --> CreateButton
    
    ServerCard --> ServerRouter
    CreateButton --> ServerRouter
    
    ServerRouter --> LambdaClient
    ServerRouter --> PrismaDB
    
    SignIn --> AuthConfig
    AuthConfig --> AuthIndex
    
    style Page fill:#61dafb
    style ServerRouter fill:#2596be
    style LambdaClient fill:#ff9900
    style PrismaDB fill:#527FFF
```

---

## 🔐 Security Flow Diagram

```mermaid
graph TB
    subgraph "Security Layers"
        A[User Request] --> B{Authenticated?}
        B -->|No| C[Redirect to Sign In]
        B -->|Yes| D{Session Valid?}
        D -->|No| C
        D -->|Yes| E{Has Permission?}
        E -->|No| F[403 Forbidden]
        E -->|Yes| G[Process Request]
        
        G --> H{AWS Credentials?}
        H -->|No| I[Mock Mode]
        H -->|Yes| J{Valid Session Token?}
        J -->|No| K[Refresh Credentials]
        J -->|Yes| L[Invoke Lambda]
        
        L --> M{EC2 Action}
        M --> N[Security Group Check]
        N --> O{Port 7777 Open?}
        O -->|Yes| P[Allow Connection]
        O -->|No| Q[Block Connection]
        
        I --> R[Return Mock Data]
    end
    
    style B fill:#ff6b6b
    style D fill:#ff6b6b
    style E fill:#ff6b6b
    style H fill:#4ecdc4
    style J fill:#4ecdc4
    style O fill:#95e1d3
```

---

## 📊 Data Flow Diagram

```mermaid
graph LR
    subgraph "User Actions"
        U1[Create Server]
        U2[Start Server]
        U3[Stop Server]
        U4[View Status]
    end
    
    subgraph "Application"
        API[tRPC API]
        DB[(Database)]
    end
    
    subgraph "AWS Services"
        L[Lambda]
        E[EC2]
        CW[CloudWatch]
    end
    
    U1 -->|Server Config| API
    U2 -->|Server ID| API
    U3 -->|Server ID| API
    U4 -->|User ID| API
    
    API -->|Store| DB
    API -->|Query| DB
    API -->|Invoke| L
    
    L -->|Create/Start/Stop| E
    E -->|Metrics| CW
    E -->|Logs| CW
    
    DB -->|Read| API
    L -->|Instance Info| API
    CW -->|Status| API
    
    API -->|Response| U1
    API -->|Response| U2
    API -->|Response| U3
    API -->|Response| U4
```

---

## 🎮 Player Journey Map

```mermaid
journey
    title Player Using Cloud Terraria
    section Authentication
      Visit website: 5: Player
      Click sign in: 5: Player
      Enter credentials: 4: Player, Cognito
      Access dashboard: 5: Player
    section Create Server
      Click create button: 5: Player
      Fill server details: 4: Player
      Submit form: 5: Player
      Wait for creation: 3: Player, Lambda, EC2
      See server in list: 5: Player
    section Start & Play
      Click start button: 5: Player
      Wait for startup: 3: Player, EC2
      Copy IP address: 5: Player
      Open Terraria game: 5: Player
      Join server: 5: Player
      Play with friends: 5: Player, Player
    section Management
      Check server status: 5: Player
      Stop server when done: 5: Player
      Delete old servers: 4: Player
```

---

## 🔄 State Diagram: Server Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Creating: Create Server
    Creating --> Pending: EC2 Launching
    Pending --> Running: Instance Ready
    Running --> Stopping: Stop Server
    Stopping --> Stopped: Instance Stopped
    Stopped --> Running: Start Server
    Running --> Terminating: Delete Server
    Stopped --> Terminating: Delete Server
    Terminating --> [*]: Cleanup Complete
    
    Creating --> Failed: Creation Error
    Failed --> [*]: Cleanup
    
    note right of Running
        IP Address Available
        Port 7777 Open
        Players Can Join
    end note
    
    note right of Stopped
        Instance Exists
        No Charges (storage only)
        Can Restart
    end note
```

---

## 📈 Deployment Diagram

```mermaid
graph TB
    subgraph "Development"
        Dev[Developer Machine<br/>SQLite + Mock]
    end
    
    subgraph "Version Control"
        GitHub[GitHub Repository]
    end
    
    subgraph "Production - AWS Cloud us-east-1"
        subgraph "VPC"
            subgraph "Public Subnet"
                EC2Web[EC2 Instance<br/>nginx + Next.js + PM2]
            end
            
            subgraph "Private Subnet"
                RDS[(RDS PostgreSQL<br/>Database)]
            end
        end
        
        Cognito[AWS Cognito<br/>User Pool]
        Lambda[Lambda Function<br/>Server Manager]
        EC2Game[EC2 Instances<br/>Terraria Servers]
        S3[S3 Bucket<br/>Backups]
        CloudWatch[CloudWatch<br/>Monitoring]
    end
    
    subgraph "Players"
        Browser[Web Browser<br/>Port 80/443]
        Game[Terraria Client<br/>Port 7777]
    end
    
    Dev -->|Push Code| GitHub
    GitHub -->|Pull & Deploy| EC2Web
    
    Browser -->|HTTPS| EC2Web
    EC2Web --> Cognito
    EC2Web --> RDS
    EC2Web --> Lambda
    
    Lambda --> EC2Game
    Lambda --> S3
    EC2Game --> S3
    
    Game -.->|Game Traffic| EC2Game
    
    EC2Web --> CloudWatch
    EC2Game --> CloudWatch
    Lambda --> CloudWatch
    
    style Dev fill:#4a90e2
    style EC2Web fill:#ff9900
    style GitHub fill:#333
    style Lambda fill:#ff9900
    style EC2Game fill:#ff9900
    style RDS fill:#527fff
    style S3 fill:#569a31
    style Browser fill:#4ae290
    style Game fill:#90ee90
```

---

## 📊 Summary

This document contains comprehensive system diagrams for the Cloud Terraria project:

1. **Use Case Diagram** - Shows all 12 use cases for Player, Admin, and AWS System actors
2. **Use Case Descriptions** - Detailed flows for each use case
3. **Sequence Diagrams** - Step-by-step flows for Create Server, Start Server, Cognito Auth, and Mock Auth
4. **Architecture Diagram** - Complete AWS architecture with all 12 services on EC2
5. **Component Diagram** - Frontend and backend code structure
6. **Security Flow** - Authentication and authorization decision flow
7. **Data Flow** - User actions to AWS services
8. **Player Journey** - End-to-end player experience
9. **State Diagram** - Server lifecycle states
10. **Deployment Diagram** - Development to production pipeline with EC2 hosting

**How to view:**
- GitHub: Automatically renders Mermaid diagrams
- VS Code: Install "Markdown Preview Mermaid Support" extension
- Browser: Open `http://localhost:3000/diagrams.html` for interactive version

**Architecture Highlights:**
- 🌐 Next.js web app runs on EC2 with nginx reverse proxy
- 🔐 AWS Cognito for authentication (optional mock mode)
- 🗄️ RDS PostgreSQL for production database
- ⚡ Lambda functions manage EC2 game servers
- 🎮 Dedicated EC2 instances for Terraria servers
- 💾 S3 for world backups
- 📊 CloudWatch + SNS for monitoring and alerts
- 🔒 VPC with security groups for network isolation
    
    Dev -->|Push Code| Repo
    Repo -->|Deploy| Vercel
    
    Vercel -->|Auth| Cognito
    Vercel -->|Database| RDS
    Vercel -->|Invoke| Lambda
    
    Lambda -->|Manage| EC2
    Lambda -->|Store Backups| S3
    
    EC2 -->|Logs| CW
    Lambda -->|Logs| CW
    CW -->|Alerts| SNS
    
    style Dev fill:#4a90e2
    style Vercel fill:#000000,color:#fff
    style EC2 fill:#ff9900
    style Lambda fill:#ff9900
    style RDS fill:#527FFF
```

---

**สรุป**: ครบทุก diagram ที่ต้องการสำหรับนำเสนอโปรเจค! 🎉
