cd /opt/terraria-app
aws s3 cp s3://cloud-terraria-deployment-4680/deploy-app.tar.gz /tmp/
tar -xzf /tmp/deploy-app.tar.gz -C /opt/terraria-app
npm ci --omit=dev
npx prisma generate
npx prisma db push --skip-generate
systemctl restart terraria-app
sleep 3
systemctl status terraria-app --no-pager