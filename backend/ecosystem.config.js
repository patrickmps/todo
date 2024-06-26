module.exports = {
  apps: [
    {
      name: 'api',
      script: './dist/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
      }
    }
  ]
};
