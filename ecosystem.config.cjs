module.exports = {
  apps: [
    {
      name: 'sipshield-dev',
      script: 'npm',
      args: 'run dev',
      watch: false,
      autorestart: true,
    },
  ],
};
