@echo off
REM Deploy CloudFormation Stack for Next.js Web App on EC2
REM Run this from your local machine (Windows)

echo ======================================
echo Deploying Next.js EC2 Web App Stack
echo ======================================
echo.

REM Check if AWS CLI is installed
aws --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: AWS CLI not found!
    echo Please install: https://aws.amazon.com/cli/
    pause
    exit /b 1
)

REM Get VPC ID
echo Getting VPC ID from terraria-vpc stack...
for /f "delims=" %%i in ('aws cloudformation describe-stacks --stack-name terraria-vpc --query "Stacks[0].Outputs[?OutputKey=='VPCId'].OutputValue" --output text') do set VPC_ID=%%i

if "%VPC_ID%"=="" (
    echo ERROR: Could not get VPC ID from terraria-vpc stack
    echo Make sure you deployed VPC stack first
    pause
    exit /b 1
)

echo VPC ID: %VPC_ID%

REM Get Public Subnet ID
echo Getting Public Subnet ID...
for /f "delims=" %%i in ('aws cloudformation describe-stacks --stack-name terraria-vpc --query "Stacks[0].Outputs[?OutputKey=='PublicSubnetId'].OutputValue" --output text') do set SUBNET_ID=%%i

if "%SUBNET_ID%"=="" (
    echo ERROR: Could not get Subnet ID from terraria-vpc stack
    pause
    exit /b 1
)

echo Subnet ID: %SUBNET_ID%
echo.

REM Deploy stack
echo Deploying CloudFormation stack...
echo This will take 3-5 minutes...
echo.

aws cloudformation create-stack ^
  --stack-name terraria-webapp ^
  --template-body file://aws/cloudformation/nextjs-ec2.yaml ^
  --parameters ^
    ParameterKey=VpcId,ParameterValue=%VPC_ID% ^
    ParameterKey=SubnetId,ParameterValue=%SUBNET_ID% ^
    ParameterKey=KeyName,ParameterValue=vockey ^
    ParameterKey=InstanceType,ParameterValue=t2.small ^
  --capabilities CAPABILITY_NAMED_IAM

if %errorlevel% neq 0 (
    echo ERROR: Stack creation failed!
    pause
    exit /b 1
)

echo.
echo Stack creation initiated!
echo.
echo Waiting for stack to complete...
aws cloudformation wait stack-create-complete --stack-name terraria-webapp

if %errorlevel% neq 0 (
    echo ERROR: Stack creation failed!
    echo Check AWS Console for details
    pause
    exit /b 1
)

echo.
echo ======================================
echo ✅ Stack Deployed Successfully!
echo ======================================
echo.

REM Get outputs
echo Getting instance details...
for /f "delims=" %%i in ('aws cloudformation describe-stacks --stack-name terraria-webapp --query "Stacks[0].Outputs[?OutputKey=='PublicIP'].OutputValue" --output text') do set PUBLIC_IP=%%i

echo.
echo 🌐 Your EC2 Web App Instance:
echo    IP Address: %PUBLIC_IP%
echo    Temporary URL: http://%PUBLIC_IP%
echo.
echo 📋 Next Steps:
echo    1. SSH into instance:
echo       ssh -i vockey.pem ec2-user@%PUBLIC_IP%
echo.
echo    2. Clone repository:
echo       cd /var/www/terraria
echo       git clone https://github.com/SassyxD/Cloud-Terraria.git .
echo.
echo    3. Run deployment script:
echo       chmod +x scripts/deploy-nextjs-ec2.sh
echo       ./scripts/deploy-nextjs-ec2.sh
echo.
echo    4. Create .env file with production values
echo.
echo ⚠️  Don't forget to update Security Group if needed!
echo.

pause
