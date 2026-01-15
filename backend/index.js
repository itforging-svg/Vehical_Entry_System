const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001; // Use 5001 to avoid conflict with Visitor_2

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Basic Route
app.get('/', (req, res) => {
    res.send('Stand-alone Vehicle Entry System API is running');
});

// Import Routes
const entryRoutes = require('./routes/entry.routes');
const authRoutes = require('./routes/auth.routes');
app.use('/api/entry', entryRoutes);
app.use('/api/auth', authRoutes);

// Database environment validation
if (!process.env.DB_USER || !process.env.DB_HOST || !process.env.DB_NAME || !process.env.DB_PASSWORD) {
    console.error('FATAL: Database environment variables are missing!');
    process.exit(1);
}

app.listen(PORT, '0.0.0.0', () => {
    const os = require('os');
    const networkInterfaces = os.networkInterfaces();
    let networkIP = 'localhost';

    // Find the first non-internal IPv4 address
    for (const interfaceName in networkInterfaces) {
        for (const iface of networkInterfaces[interfaceName]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                networkIP = iface.address;
                break;
            }
        }
        if (networkIP !== 'localhost') break;
    }

    console.log(`Vehicle Entry Backend Server: http://localhost:${PORT}`);
    console.log(`Network Access: http://${networkIP}:${PORT}`);
});
