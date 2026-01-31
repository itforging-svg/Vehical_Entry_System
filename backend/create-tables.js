const { Client } = require('pg');
require('dotenv').config();

async function initTables() {
    const client = new Client({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: parseInt(process.env.DB_PORT || 5432),
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        await client.connect();
        console.log('Connected to DB for table initialization...');

        // Create vehicle_system_users table
        await client.query(`
            CREATE TABLE IF NOT EXISTS vehicle_system_users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(20) NOT NULL,
                plant VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Table vehicle_system_users created or already exists.');

        // Create entry_logs table
        await client.query(`
            CREATE TABLE IF NOT EXISTS entry_logs (
                id SERIAL PRIMARY KEY,
                plant VARCHAR(100),
                vehicle_reg VARCHAR(20),
                driver_name VARCHAR(100),
                license_no VARCHAR(50),
                vehicle_type VARCHAR(50),
                puc_validity DATE,
                insurance_validity DATE,
                chassis_last_5 VARCHAR(10),
                engine_last_5 VARCHAR(10),
                purpose TEXT,
                material_details TEXT,
                gate_pass_no VARCHAR(50),
                entry_time TIMESTAMP,
                exit_time TIMESTAMP,
                status VARCHAR(20),
                photo_url TEXT,
                transporter VARCHAR(100),
                aadhar_no VARCHAR(20),
                driver_mobile VARCHAR(20),
                challan_no VARCHAR(50),
                security_person_name VARCHAR(100),
                approval_status VARCHAR(20) DEFAULT 'Pending',
                approved_by VARCHAR(50),
                rejection_reason TEXT,
                invoice_no VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                deleted_at TIMESTAMP
            )
        `);
        console.log('Table entry_logs created or already exists.');

        // Create vehicle_blacklist table
        await client.query(`
            CREATE TABLE IF NOT EXISTS vehicle_blacklist (
                id SERIAL PRIMARY KEY,
                vehicle_no VARCHAR(20) UNIQUE NOT NULL,
                reason TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Table vehicle_blacklist created or already exists.');

    } catch (err) {
        console.error('Table Initialization Error:', err);
    } finally {
        await client.end();
    }
}

initTables();
