# PowerShell script to update .env file with CloudFormation outputs

$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

Write-Host "`n=== Getting CloudFormation Outputs ===" -ForegroundColor Cyan

# Get Database Endpoint
Write-Host "`nGetting RDS endpoint..." -ForegroundColor Yellow
$dbEndpoint = aws cloudformation describe-stacks `
    --stack-name cloud-terraria-database `
    --query "Stacks[0].Outputs[?OutputKey=='DBEndpoint'].OutputValue" `
    --output text `
    --region us-east-1

Write-Host "Database Endpoint: $dbEndpoint" -ForegroundColor White

# Get Lambda Function Name
Write-Host "`nGetting Lambda function name..." -ForegroundColor Yellow
$lambdaName = aws cloudformation describe-stacks `
    --stack-name cloud-terraria-lambda `
    --query "Stacks[0].Outputs[?OutputKey=='LambdaFunctionName'].OutputValue" `
    --output text `
    --region us-east-1

Write-Host "Lambda Function: $lambdaName" -ForegroundColor White

# Build connection string
$dbUrl = "postgresql://postgres:TerrariaDB2024!@${dbEndpoint}:5432/terraria"

Write-Host "`n=== Updating .env file ===" -ForegroundColor Cyan

# Read current .env
$envContent = Get-Content .env -Raw

# Update DATABASE_URL
if ($envContent -match 'DATABASE_URL="[^"]*"') {
    $envContent = $envContent -replace 'DATABASE_URL="[^"]*"', "DATABASE_URL=`"$dbUrl`""
    Write-Host "[√] Updated DATABASE_URL" -ForegroundColor Green
} else {
    $envContent += "`nDATABASE_URL=`"$dbUrl`"`n"
    Write-Host "[√] Added DATABASE_URL" -ForegroundColor Green
}

# Update AWS_LAMBDA_FUNCTION_NAME
if ($envContent -match 'AWS_LAMBDA_FUNCTION_NAME="[^"]*"') {
    $envContent = $envContent -replace 'AWS_LAMBDA_FUNCTION_NAME="[^"]*"', "AWS_LAMBDA_FUNCTION_NAME=`"$lambdaName`""
    Write-Host "[√] Updated AWS_LAMBDA_FUNCTION_NAME" -ForegroundColor Green
} else {
    # Find AWS section and add Lambda function name
    if ($envContent -match '# AWS LAMBDA') {
        $envContent = $envContent -replace '(# AWS LAMBDA[^\n]*\n# ============================================\n)', "`$1AWS_LAMBDA_FUNCTION_NAME=`"$lambdaName`"`n"
    } else {
        $envContent += "`nAWS_LAMBDA_FUNCTION_NAME=`"$lambdaName`"`n"
    }
    Write-Host "[√] Added AWS_LAMBDA_FUNCTION_NAME" -ForegroundColor Green
}

# Save updated .env
$envContent | Set-Content .env -NoNewline

Write-Host "`n=== .env file updated! ===" -ForegroundColor Green
Write-Host "`nUpdated values:" -ForegroundColor Yellow
Write-Host "  DATABASE_URL=`"$dbUrl`"" -ForegroundColor White
Write-Host "  AWS_LAMBDA_FUNCTION_NAME=`"$lambdaName`"" -ForegroundColor White

Write-Host "`n=== Next Steps ===" -ForegroundColor Cyan
Write-Host "1. Run: npx prisma migrate dev --name init" -ForegroundColor White
Write-Host "2. Run: npm run dev" -ForegroundColor White
Write-Host "3. Open: http://localhost:3000" -ForegroundColor White
Write-Host ""
