module.exports = {
  apps: [
    {
      name: "revisaacmpamaugo",
      script: "server.js",
      cwd: "./",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: "0.0.0.0",
      },
      env_file: ".env.production",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",
      merge_logs: true,
      max_restarts: 10,
      restart_delay: 4000,
    },
  ],

  deploy: {
    production: {
      user: "deploy",
      host: "revisaacmpamaugo.online",
      ref: "origin/main",
      repo: "git@github.com:username/revisaacmpamaugo.git",
      path: "/var/www/revisaacmpamaugo",
      "pre-deploy": "git fetch --all",
      "post-deploy": [
        "cd website",
        "npm ci --omit=dev",
        "npm run build",
        "cp -r public .next/standalone/",
        "cp -r .next/static .next/standalone/.next/",
        "cp .env.production .next/standalone/",
        "cd .next/standalone && pm2 start ../../ecosystem.config.js --env production",
      ].join(" && "),
    },
  },
};
