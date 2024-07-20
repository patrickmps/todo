module.exports = {
  apps: [
    {
      name: 'api-todo',
      script: './dist/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        PORT: 3000,
      }
    }
  ]
};
