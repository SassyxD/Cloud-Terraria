@echo off
REM CloudFormation Deployment Script for Cloud Terraria
REM Windows Batch Script

echo.
echo ===================================================
echo   Cloud Terraria - CloudFormation Deployment
echo ===================================================
echo.

set REGION=us-east-1

REM ============================================
REM Step 1: Deploy VPC and Network
REM ============================================
echo [1/3] Deploying VPC and Network Infrastructure...
echo.

aws cloudformation create-stack ^
  --stack-name cloud-terraria-network ^
  --template-body file://cloudformation/1-vpc-network.yaml ^
  --region %REGION%

if errorlevel 1 (
    echo Checking if stack already exists...
    aws cloudformation update-stack ^
      --stack-name cloud-terraria-network ^
      --template-body file://cloudformation/1-vpc-network.yaml ^
      --region %REGION%
)

echo Waiting for network stack to complete...
aws cloudformation wait stack-create-complete --stack-name cloud-terraria-network --region %REGION% 2>nul
if errorlevel 1 (
    aws cloudformation wait stack-update-complete --stack-name cloud-terraria-network --region %REGION% 2>nul
)

echo [√] Network infrastructure ready!
echo.

REM ============================================
REM Step 2: Deploy RDS Database
REM ============================================
echo [2/3] Deploying RDS PostgreSQL Database...
echo.

aws cloudformation create-stack ^
  --stack-name cloud-terraria-database ^
  --template-body file://cloudformation/2-rds-database.yaml ^
  --parameters ParameterKey=DBPassword,ParameterValue=TerrariaDB2024! ^
  --region %REGION%

if errorlevel 1 (
    echo Checking if stack already exists...
    aws cloudformation update-stack ^
      --stack-name cloud-terraria-database ^
      --template-body file://cloudformation/2-rds-database.yaml ^
      --parameters ParameterKey=DBPassword,ParameterValue=TerrariaDB2024! ^
      --region %REGION%
)

echo Waiting for database stack to complete (this may take 10-15 minutes)...
aws cloudformation wait stack-create-complete --stack-name cloud-terraria-database --region %REGION% 2>nul
if errorlevel 1 (
    aws cloudformation wait stack-update-complete --stack-name cloud-terraria-database --region %REGION% 2>nul
)

echo [√] Database ready!
echo.

REM ============================================
REM Step 3: Deploy Lambda Function
REM ============================================
echo [3/3] Deploying Lambda Function...
echo.

aws cloudformation create-stack ^
  --stack-name cloud-terraria-lambda ^
  --template-body file://cloudformation/3-lambda-function.yaml ^
  --capabilities CAPABILITY_IAM ^
  --region %REGION%

if errorlevel 1 (
    echo Checking if stack already exists...
    aws cloudformation update-stack ^
      --stack-name cloud-terraria-lambda ^
      --template-body file://cloudformation/3-lambda-function.yaml ^
      --capabilities CAPABILITY_IAM ^
      --region %REGION%
)

echo Waiting for Lambda stack to complete...
aws cloudformation wait stack-create-complete --stack-name cloud-terraria-lambda --region %REGION% 2>nul
if errorlevel 1 (
    aws cloudformation wait stack-update-complete --stack-name cloud-terraria-lambda --region %REGION% 2>nul
)

echo [√] Lambda function ready!
echo.

REM ============================================
REM Get Outputs
REM ============================================
echo ===================================================
echo   Deployment Complete!
echo ===================================================
echo.

echo Getting stack outputs...
echo.

echo Database Endpoint:
aws cloudformation describe-stacks --stack-name cloud-terraria-database --query "Stacks[0].Outputs[?OutputKey=='DBEndpoint'].OutputValue" --output text --region %REGION% > temp_db.txt
set /p DB_ENDPOINT=<temp_db.txt
echo %DB_ENDPOINT%
echo.

echo Lambda Function Name:
aws cloudformation describe-stacks --stack-name cloud-terraria-lambda --query "Stacks[0].Outputs[?OutputKey=='LambdaFunctionName'].OutputValue" --output text --region %REGION% > temp_lambda.txt
set /p LAMBDA_NAME=<temp_lambda.txt
echo %LAMBDA_NAME%
echo.

echo ===================================================
echo   Update your .env file:
echo ===================================================
echo.
echo DATABASE_URL="postgresql://postgres:TerrariaDB2024!@%DB_ENDPOINT%:5432/terraria"
echo AWS_LAMBDA_FUNCTION_NAME="%LAMBDA_NAME%"
echo.

REM Cleanup temp files
del temp_db.txt 2>nul
del temp_lambda.txt 2>nul

echo ===================================================
echo   Next Steps:
echo ===================================================
echo.
echo 1. Update .env file with the values above
echo 2. Run: npx prisma migrate dev --name init
echo 3. Run: npm run dev
echo.

pause
