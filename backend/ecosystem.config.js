module.exports = {
    apps: [{
        name: "vehicle-entry-backend",
        script: "./index.js",
        env: {
            NODE_ENV: "production",
            PORT: 5001
        },
        instances: 1,
        autorestart: true,
        watch: false,
        max_memory_restart: '1G'
    }]
};
