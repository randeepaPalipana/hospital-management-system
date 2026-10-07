module.exports = {
  apps: [
    {
      name: 'hms-backend',
      script: 'src/server.js',
      cwd: '/var/www/hms/backend',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: '/var/log/hms/backend-error.log',
      out_file: '/var/log/hms/backend-out.log',
      merge_logs: true,
    },
  ],
};
