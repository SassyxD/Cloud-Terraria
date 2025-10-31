# CloudFormation Deployment Script for Cloud Terraria
# PowerShell script for Windows

param(
    [string]$Action = "deploy",
    [string]$Region = "us-east-1"
)

$ErrorActionPreference = "Continue"

Write-Host "🚀 Cloud Terraria - CloudFormation Deployment" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

function Deploy-Stack {
    param(
        [string]$StackName,
        [string]$TemplateFile,
        [string]$Description,
        [hashtable]$Parameters = @{}
    )
    
    Write-Host "📦 Deploying $Description..." -ForegroundColor Yellow
    Write-Host "   Stack: $StackName" -ForegroundColor Gray
    Write-Host "   Template: $TemplateFile" -ForegroundColor Gray
    
    # Check if stack exists
    $stackExists = $false
    $checkResult = aws cloudformation describe-stacks --stack-name $StackName --region $Region 2>&1
    if ($LASTEXITCODE -eq 0) {
        $stackExists = $true
        Write-Host "   ℹ️  Stack exists, updating..." -ForegroundColor Blue
    } else {
        Write-Host "   ℹ️  Stack doesn't exist, creating..." -ForegroundColor Blue
    }
    
    # Build parameters
    $paramArgs = @()
    foreach ($key in $Parameters.Keys) {
        $paramArgs += "ParameterKey=$key,ParameterValue=$($Parameters[$key])"
    }
    
    if ($stackExists) {
        # Update stack
        if ($paramArgs.Count -gt 0) {
            aws cloudformation update-stack `
                --stack-name $StackName `
                --template-body "file://$TemplateFile" `
                --parameters $paramArgs `
                --capabilities CAPABILITY_IAM `
                --region $Region
        } else {
            aws cloudformation update-stack `
                --stack-name $StackName `
                --template-body "file://$TemplateFile" `
                --capabilities CAPABILITY_IAM `
                --region $Region
        }
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "   ⚠️  Update failed or no changes" -ForegroundColor Yellow
        } else {
            Write-Host "   ⏳ Waiting for update to complete..." -ForegroundColor Yellow
            aws cloudformation wait stack-update-complete --stack-name $StackName --region $Region
            Write-Host "   ✅ Stack updated successfully!" -ForegroundColor Green
        }
    } else {
        # Create stack
        if ($paramArgs.Count -gt 0) {
            aws cloudformation create-stack `
                --stack-name $StackName `
                --template-body "file://$TemplateFile" `
                --parameters $paramArgs `
                --capabilities CAPABILITY_IAM `
                --region $Region
        } else {
            aws cloudformation create-stack `
                --stack-name $StackName `
                --template-body "file://$TemplateFile" `
                --capabilities CAPABILITY_IAM `
                --region $Region
        }
        
        Write-Host "   ⏳ Waiting for creation to complete..." -ForegroundColor Yellow
        aws cloudformation wait stack-create-complete --stack-name $StackName --region $Region
        Write-Host "   ✅ Stack created successfully!" -ForegroundColor Green
    }
    
    Write-Host ""
}

function Get-StackOutputs {
    param([string]$StackName)
    
    Write-Host "📋 Stack Outputs for $StackName:" -ForegroundColor Cyan
    aws cloudformation describe-stacks `
        --stack-name $StackName `
        --query "Stacks[0].Outputs" `
        --region $Region `
        --output table
    Write-Host ""
}

function Delete-Stack {
    param(
        [string]$StackName,
        [string]$Description
    )
    
    Write-Host "🗑️  Deleting $Description..." -ForegroundColor Red
    Write-Host "   Stack: $StackName" -ForegroundColor Gray
    
    aws cloudformation delete-stack --stack-name $StackName --region $Region
    Write-Host "   ⏳ Waiting for deletion to complete..." -ForegroundColor Yellow
    aws cloudformation wait stack-delete-complete --stack-name $StackName --region $Region
    Write-Host "   ✅ Stack deleted successfully!" -ForegroundColor Green
    Write-Host ""
}

# Main deployment logic
if ($Action -eq "deploy") {
    Write-Host "Starting deployment..." -ForegroundColor Green
    Write-Host ""
    
    # 1. Deploy Network
    Deploy-Stack `
        -StackName "cloud-terraria-network" `
        -TemplateFile "cloudformation/1-vpc-network.yaml" `
        -Description "VPC and Network Infrastructure"
    
    # 2. Deploy Database
    Deploy-Stack `
        -StackName "cloud-terraria-database" `
        -TemplateFile "cloudformation/2-rds-database.yaml" `
        -Description "RDS PostgreSQL Database" `
        -Parameters @{
            DBPassword = "TerrariaDB2024!"
        }
    
    # 3. Deploy Lambda
    Deploy-Stack `
        -StackName "cloud-terraria-lambda" `
        -TemplateFile "cloudformation/3-lambda-function.yaml" `
        -Description "Lambda Function"
    
    Write-Host "🎉 Deployment Complete!" -ForegroundColor Green
    Write-Host ""
    
    # Show outputs
    Get-StackOutputs -StackName "cloud-terraria-database"
    Get-StackOutputs -StackName "cloud-terraria-lambda"
    
    # Get Lambda function name for .env
    $lambdaName = aws cloudformation describe-stacks `
        --stack-name cloud-terraria-lambda `
        --query "Stacks[0].Outputs[?OutputKey=='LambdaFunctionName'].OutputValue" `
        --output text `
        --region $Region
    
    # Get DB endpoint
    $dbEndpoint = aws cloudformation describe-stacks `
        --stack-name cloud-terraria-database `
        --query "Stacks[0].Outputs[?OutputKey=='DBEndpoint'].OutputValue" `
        --output text `
        --region $Region
    
    Write-Host "📝 Update your .env file with these values:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "DATABASE_URL=`"postgresql://postgres:TerrariaDB2024!@$dbEndpoint:5432/terraria`"" -ForegroundColor White
    Write-Host "AWS_LAMBDA_FUNCTION_NAME=`"$lambdaName`"" -ForegroundColor White
    Write-Host ""
    
} elseif ($Action -eq "delete") {
    Write-Host "⚠️  WARNING: This will delete ALL resources!" -ForegroundColor Red
    Write-Host ""
    $confirm = Read-Host "Type 'yes' to confirm deletion"
    
    if ($confirm -eq "yes") {
        # Delete in reverse order
        Delete-Stack -StackName "cloud-terraria-lambda" -Description "Lambda Function"
        Delete-Stack -StackName "cloud-terraria-database" -Description "RDS Database"
        Delete-Stack -StackName "cloud-terraria-network" -Description "Network Infrastructure"
        
        Write-Host "🎉 All resources deleted!" -ForegroundColor Green
    } else {
        Write-Host "❌ Deletion cancelled" -ForegroundColor Yellow
    }
    
} elseif ($Action -eq "status") {
    Write-Host "Checking stack status..." -ForegroundColor Yellow
    Write-Host ""
    
    aws cloudformation list-stacks `
        --stack-status-filter CREATE_COMPLETE CREATE_IN_PROGRESS UPDATE_COMPLETE UPDATE_IN_PROGRESS `
        --query "StackSummaries[?contains(StackName, 'cloud-terraria')].[StackName,StackStatus,CreationTime]" `
        --region $Region `
        --output table
        
} else {
    Write-Host "❌ Unknown action: $Action" -ForegroundColor Red
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "  .\deploy-cloudformation.ps1 -Action deploy   # Deploy all stacks"
    Write-Host "  .\deploy-cloudformation.ps1 -Action delete   # Delete all stacks"
    Write-Host "  .\deploy-cloudformation.ps1 -Action status   # Check status"
    Write-Host ""
}
