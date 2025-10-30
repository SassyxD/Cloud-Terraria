#!/bin/bash
# Self-signed SSL Certificate for nginx (Development/Testing)

set -e

echo "🔐 Setting up self-signed SSL certificate..."

# Create directory for SSL certificates
sudo mkdir -p /etc/nginx/ssl

# Generate self-signed certificate (valid for 365 days)
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/nginx/ssl/nginx.key \
  -out /etc/nginx/ssl/nginx.crt \
  -subj "/C=TH/ST=Bangkok/L=Bangkok/O=Terraria/OU=IT/CN=18.208.110.147"

# Set proper permissions
sudo chmod 600 /etc/nginx/ssl/nginx.key
sudo chmod 644 /etc/nginx/ssl/nginx.crt

echo "✅ SSL certificates created:"
echo "   - Certificate: /etc/nginx/ssl/nginx.crt"
echo "   - Private Key: /etc/nginx/ssl/nginx.key"
echo ""
echo "⚠️  This is a SELF-SIGNED certificate for testing only!"
echo "   Browsers will show security warnings."
echo ""
echo "Next step: Update nginx config to use HTTPS"
