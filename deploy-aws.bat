@echo off
setlocal enabledelayedexpansion

echo Cloud Terraria Infrastructure Deployment
echo ===========================================

REM Check if we're in the right directory
if not exist "package.json" (
    echo Error: Please run this script from the project root directory
    exit /b 1
)

REM Check if Terraform is installed
terraform version >nul 2>&1
if errorlevel 1 (
    echo Error: Terraform is not installed
    echo Please install Terraform: https://terraform.io/downloads
    exit /b 1
)

REM Check if AWS CLI is configured
aws sts get-caller-identity >nul 2>&1
if errorlevel 1 (
    echo Error: AWS credentials not configured
    echo Please run: aws configure
    exit /b 1
)

echo Prerequisites check passed

REM Navigate to Terraform directory
cd infra\terraform

REM Initialize Terraform
echo Initializing Terraform...
terraform init
if errorlevel 1 exit /b 1

REM Validate configuration
echo Validating Terraform configuration...
terraform validate
if errorlevel 1 exit /b 1

REM Plan deployment
echo Planning deployment...
terraform plan -out=tfplan
if errorlevel 1 exit /b 1

REM Ask for confirmation
set /p confirm="Do you want to deploy this infrastructure? (yes/no): "
if not "%confirm%"=="yes" (
    echo Deployment cancelled
    exit /b 0
)

REM Apply the plan
echo Deploying infrastructure...
terraform apply tfplan
if errorlevel 1 exit /b 1

echo.
echo Deployment completed successfully!
echo.
echo Infrastructure Details:
echo =========================

REM Get outputs
for /f "tokens=*" %%i in ('terraform output -raw lambda_function_name') do set LAMBDA_NAME=%%i
for /f "tokens=*" %%i in ('terraform output -raw lambda_function_url') do set LAMBDA_URL=%%i
for /f "tokens=*" %%i in ('terraform output -raw vpc_id') do set VPC_ID=%%i
for /f "tokens=*" %%i in ('terraform output -raw subnet_id') do set SUBNET_ID=%%i

echo Lambda Function Name: %LAMBDA_NAME%
echo Lambda Function URL:  %LAMBDA_URL%
echo VPC ID:              %VPC_ID%
echo Subnet ID:           %SUBNET_ID%

REM Navigate back to project root
cd ..\..

REM Update .env file
echo.
echo Updating .env file...

REM Backup existing .env
copy .env .env.backup >nul

REM Create a temporary PowerShell script to update .env
echo $content = Get-Content '.env' > update_env.ps1
echo $content = $content -replace '^AWS_LAMBDA_FUNCTION_NAME=.*', 'AWS_LAMBDA_FUNCTION_NAME="%LAMBDA_NAME%"' >> update_env.ps1
echo if ($content -notmatch '^AWS_LAMBDA_FUNCTION_NAME=') { >> update_env.ps1
echo     $content += 'AWS_LAMBDA_FUNCTION_NAME="%LAMBDA_NAME%"' >> update_env.ps1
echo } >> update_env.ps1
echo Set-Content '.env' $content >> update_env.ps1

powershell -ExecutionPolicy Bypass -File update_env.ps1
del update_env.ps1

echo Environment updated with Lambda function name

echo.
echo Setup Complete!
echo ==================
echo.
echo Your Cloud Terraria infrastructure is now deployed and ready to use!
echo.
echo Next Steps:
echo 1. Start your development server: npm run dev
echo 2. Open http://localhost:3000 in your browser
echo 3. Sign in with Discord
echo 4. Create your first Terraria server!
echo.
echo Tips:
echo - Your .env file has been updated with the Lambda function name
echo - Server creation will now work with real AWS infrastructure
echo - Monitor costs in the AWS console
echo - Stop servers when not in use to save money
echo.
echo Need help? Check AWS_SETUP_GUIDE.md for troubleshooting

pause