@echo off
REM Deploy RDS Infrastructure for Cloud Terraria
REM This script automates the deployment of VPC and RDS using CloudFormation

setlocal enabledelayedexpansion

echo ==========================================
echo Cloud Terraria - RDS Deployment Script
echo ==========================================
echo.

REM Configuration
set STACK_PREFIX=terraria
if "%AWS_REGION%"=="" set AWS_REGION=ap-southeast-1
if "%ENVIRONMENT%"=="" set ENVIRONMENT=production

echo Configuration:
echo   Region: %AWS_REGION%
echo   Environment: %ENVIRONMENT%
echo   Stack Prefix: %STACK_PREFIX%
echo.

REM Check AWS CLI
where aws >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] AWS CLI is not installed. Please install it first.
    exit /b 1
)
echo [OK] AWS CLI is installed
echo.

REM Navigate to cloudformation directory
cd /d "%~dp0..\infra\cloudformation"

REM Get database password
echo.
set /p DB_PASSWORD="Enter database password (min 8 characters): "

if not defined DB_PASSWORD (
    echo [ERROR] Password is required
    exit /b 1
)

REM Step 1: Deploy VPC
echo.
echo ==========================================
echo Step 1: Deploying VPC Infrastructure
echo ==========================================
echo.

set VPC_STACK_NAME=%STACK_PREFIX%-vpc

echo [INFO] Creating VPC stack: %VPC_STACK_NAME%

aws cloudformation create-stack ^
    --stack-name %VPC_STACK_NAME% ^
    --template-body file://vpc.yaml ^
    --parameters ParameterKey=Environment,ParameterValue=%ENVIRONMENT% ^
    --region %AWS_REGION% ^
    --tags Key=Project,Value=CloudTerraria Key=Environment,Value=%ENVIRONMENT% Key=ManagedBy,Value=Script

if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to create VPC stack
    exit /b 1
)

echo [INFO] Waiting for VPC stack to complete...
aws cloudformation wait stack-create-complete ^
    --stack-name %VPC_STACK_NAME% ^
    --region %AWS_REGION%

if %ERRORLEVEL% neq 0 (
    echo [ERROR] VPC stack creation failed
    aws cloudformation describe-stack-events ^
        --stack-name %VPC_STACK_NAME% ^
        --region %AWS_REGION% ^
        --max-items 10 ^
        --query "StackEvents[?ResourceStatus=='CREATE_FAILED'].[LogicalResourceId,ResourceStatusReason]" ^
        --output table
    exit /b 1
)

echo [OK] VPC stack created successfully
echo.

REM Step 2: Deploy RDS
echo.
echo ==========================================
echo Step 2: Deploying RDS Database
echo ==========================================
echo.

set RDS_STACK_NAME=%STACK_PREFIX%-rds

echo [INFO] Creating RDS stack: %RDS_STACK_NAME%
echo [INFO] This will take 10-15 minutes...
echo.

aws cloudformation create-stack ^
    --stack-name %RDS_STACK_NAME% ^
    --template-body file://rds.yaml ^
    --parameters ^
        ParameterKey=Environment,ParameterValue=%ENVIRONMENT% ^
        ParameterKey=VpcStackName,ParameterValue=%VPC_STACK_NAME% ^
        ParameterKey=DBName,ParameterValue=terraria ^
        ParameterKey=DBUsername,ParameterValue=postgres ^
        ParameterKey=DBPassword,ParameterValue=%DB_PASSWORD% ^
        ParameterKey=DBInstanceClass,ParameterValue=db.t3.micro ^
        ParameterKey=DBAllocatedStorage,ParameterValue=20 ^
        ParameterKey=EnablePerformanceInsights,ParameterValue=true ^
        ParameterKey=MultiAZ,ParameterValue=false ^
    --region %AWS_REGION% ^
    --tags Key=Project,Value=CloudTerraria Key=Environment,Value=%ENVIRONMENT% Key=Component,Value=Database Key=ManagedBy,Value=Script

if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to create RDS stack
    exit /b 1
)

echo [INFO] Waiting for RDS stack to complete (this takes 10-15 minutes)...
aws cloudformation wait stack-create-complete ^
    --stack-name %RDS_STACK_NAME% ^
    --region %AWS_REGION%

if %ERRORLEVEL% neq 0 (
    echo [ERROR] RDS stack creation failed
    aws cloudformation describe-stack-events ^
        --stack-name %RDS_STACK_NAME% ^
        --region %AWS_REGION% ^
        --max-items 10 ^
        --query "StackEvents[?ResourceStatus=='CREATE_FAILED'].[LogicalResourceId,ResourceStatusReason]" ^
        --output table
    exit /b 1
)

echo [OK] RDS stack created successfully
echo.

REM Get outputs
echo.
echo ==========================================
echo Deployment Complete!
echo ==========================================
echo.

echo Getting database connection details...
aws cloudformation describe-stacks ^
    --stack-name %RDS_STACK_NAME% ^
    --region %AWS_REGION% ^
    --query "Stacks[0].Outputs[?OutputKey=='DatabaseURL'].OutputValue" ^
    --output text > temp_db_url.txt

set /p DATABASE_URL=<temp_db_url.txt
del temp_db_url.txt

echo.
echo [OK] Database deployed successfully!
echo.
echo Add this to your .env file:
echo DATABASE_URL="%DATABASE_URL%"
echo.
echo Next steps:
echo 1. Update your .env file with the DATABASE_URL above
echo 2. Run: npx prisma migrate deploy
echo 3. Run: pnpm dev
echo.

echo Press any key to exit...
pause >nul
