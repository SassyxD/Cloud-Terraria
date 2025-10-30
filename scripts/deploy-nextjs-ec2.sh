#!/bin/bash
# Deploy Next.js App to EC2 Instance
# Run this script on your EC2 instance

set -e

echo "======================================"
echo "Next.js EC2 Deployment Script"
echo "======================================"

# Update system
echo "📦 Updating system packages..."
sudo yum update -y

# Install Node.js 20.x
echo "📦 Installing Node.js..."
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

# Install PM2 globally
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Install nginx
echo "📦 Installing nginx..."
sudo amazon-linux-extras install nginx1 -y || sudo yum install nginx -y

# Create app directory
echo "📁 Creating app directory..."
sudo mkdir -p /var/www/terraria
sudo chown -R $USER:$USER /var/www/terraria

# Clone repository (you need to set this up)
echo "📥 Cloning repository..."
cd /var/www/terraria
# Uncomment and modify this line with your repo URL:
# git clone https://github.com/SassyxD/Cloud-Terraria.git .

echo "📦 Installing dependencies..."
npm install

# Copy environment variables
echo "⚙️ Setting up environment..."
if [ ! -f .env ]; then
    echo "⚠️  WARNING: .env file not found!"
    echo "Creating .env template..."
    cat > .env << 'EOF'
# Database (RDS PostgreSQL)
DATABASE_URL="postgresql://postgres:YourPassword123@terraria-db.xxxxx.us-east-1.rds.amazonaws.com:5432/terraria"

# NextAuth.js
NEXTAUTH_URL="http://YOUR_EC2_PUBLIC_IP"
AUTH_SECRET="generate-with-openssl-rand-base64-32"

# AWS Cognito
AUTH_COGNITO_ID=""
AUTH_COGNITO_SECRET=""
AUTH_COGNITO_ISSUER=""

# AWS Credentials (from AWS Academy - expires every 4 hours)
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_SESSION_TOKEN=""

# Lambda
AWS_LAMBDA_FUNCTION_NAME="TerrariaServerManager"

# Environment
NODE_ENV="production"
EOF
    echo ""
    echo "❌ .env file created but empty!"
    echo "Please edit .env with your AWS credentials:"
    echo "   nano .env"
    echo ""
    echo "See docs/AWS_TOKENS_CHECKLIST.md for where to get each value"
    exit 1
fi

# Validate required environment variables
echo "🔍 Validating environment variables..."
source .env

required_vars=(
    "DATABASE_URL"
    "NEXTAUTH_URL"
    "AUTH_SECRET"
    "AWS_REGION"
    "AWS_LAMBDA_FUNCTION_NAME"
)

missing_vars=()
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -gt 0 ]; then
    echo "❌ Missing required environment variables:"
    for var in "${missing_vars[@]}"; do
        echo "   - $var"
    done
    echo ""
    echo "Please update .env file with all required values"
    echo "See docs/AWS_TOKENS_CHECKLIST.md for details"
    exit 1
fi

echo "✅ Environment variables validated"

# Get EC2 public IP for auto-configuration
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
echo "📍 EC2 Public IP: $PUBLIC_IP"

# Auto-update NEXTAUTH_URL if still default
if [[ "$NEXTAUTH_URL" == *"YOUR_EC2_PUBLIC_IP"* ]]; then
    echo "🔧 Auto-updating NEXTAUTH_URL with EC2 IP..."
    sed -i "s|YOUR_EC2_PUBLIC_IP|$PUBLIC_IP|g" .env
fi

# Build Next.js app
echo "🔨 Building Next.js app..."
npm run build

# Run Prisma migrations
echo "🗄️ Running database migrations..."
npx prisma migrate deploy

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
npx prisma generate

# Configure PM2
echo "⚙️ Configuring PM2..."
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'terraria-web',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/var/www/terraria',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/terraria-error.log',
    out_file: '/var/log/pm2/terraria-out.log',
    log_file: '/var/log/pm2/terraria-combined.log',
    time: true
  }]
}
EOF

# Create log directory
sudo mkdir -p /var/log/pm2
sudo chown -R $USER:$USER /var/log/pm2

# Start app with PM2
echo "🚀 Starting Next.js with PM2..."
pm2 delete terraria-web 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup | tail -n 1 | sudo bash

# Configure nginx
echo "⚙️ Configuring nginx..."
sudo tee /etc/nginx/conf.d/terraria.conf > /dev/null << 'EOF'
# HTTP server - redirect to HTTPS (optional, for production with SSL)
server {
    listen 80;
    server_name _;

    # For now, just proxy to Next.js
    # Later you can add SSL with Let's Encrypt

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Test nginx configuration
echo "🔍 Testing nginx configuration..."
sudo nginx -t

# Start nginx
echo "🚀 Starting nginx..."
sudo systemctl enable nginx
sudo systemctl restart nginx

# Configure firewall (if using firewalld)
if command -v firewall-cmd &> /dev/null; then
    echo "🔥 Configuring firewall..."
    sudo firewall-cmd --permanent --add-service=http
    sudo firewall-cmd --permanent --add-service=https
    sudo firewall-cmd --reload
fi

# Get public IP
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)

echo ""
echo "======================================"
echo "✅ Deployment Complete!"
echo "======================================"
echo ""
echo "🌐 Your app is running at:"
echo "   http://$PUBLIC_IP"
echo ""
echo "📊 Useful commands:"
echo "   pm2 status              - Check app status"
echo "   pm2 logs terraria-web   - View logs"
echo "   pm2 restart terraria-web - Restart app"
echo "   pm2 monit               - Monitor resources"
echo "   sudo systemctl status nginx - Check nginx"
echo ""
echo "⚠️  Don't forget to:"
echo "   1. Update Security Group to allow port 80"
echo "   2. Create .env file with production values"
echo "   3. Update NEXTAUTH_URL in .env"
echo ""
