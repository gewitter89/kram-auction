// PM2 Configuration for production
module.exports = {
    apps: [{
        name: 'auction',
        script: 'server.js',
        cwd: '/var/www/auction',
        instances: 'max', // Use all CPU cores
        exec_mode: 'cluster',
        env_production: {
            NODE_ENV: 'production',
            PORT: 3000
        },
        // Auto-restart on crash
        autorestart: true,
        watch: false,
        max_memory_restart: '500M',
        // Logging
        error_file: '/var/www/auction/logs/error.log',
        out_file: '/var/www/auction/logs/output.log',
        log_date_format: 'YYYY-MM-DD HH:mm:ss',
        // Graceful restart
        kill_timeout: 5000,
        listen_timeout: 10000
    }]
};
