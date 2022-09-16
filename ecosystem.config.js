module.exports = {
  apps: [
    {
      name: "wooah-backend",
      cwd: "./",
      script: "./dist/src/main.js",
      instances: 0,
      exec_mode: "cluster",
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
        TZ: "Asia/Seoul",
      },
    },
  ],
};
