export default {
  apps: [{
    name: 'terraria-web',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/var/www/terraria',
    instances: 2, // 2 instances for load balancing
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    // Auto-restart on crashes
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    
    // Memory management
    max_memory_restart: '500M',
    
    // Logs
    error_file: '/var/log/pm2/terraria-error.log',
    out_file: '/var/log/pm2/terraria-out.log',
    log_file: '/var/log/pm2/terraria-combined.log',
    time: true,
    
    // Graceful shutdown
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000
  }]
};
