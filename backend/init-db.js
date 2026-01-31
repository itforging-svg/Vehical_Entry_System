const { Client } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

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

async function init() {
    try {
        await client.connect();
        console.log('Connected to DB for initialization...');

        // Create entry_logs table if not exists (adding approval columns)
        await client.query(`
            ALTER TABLE entry_logs ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) DEFAULT 'Pending';
            ALTER TABLE entry_logs ADD COLUMN IF NOT EXISTS approved_by VARCHAR(50);
            ALTER TABLE entry_logs ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
        `);
        console.log('Entry logs table updated with approval columns.');

        // Helper to add user
        const addUser = async (username, password, role, plant) => {
            if (!password) {
                console.error(`Skipping ${username}: Password is undefined`);
                return;
            }
            const hashedPassword = await bcrypt.hash(password, 8);
            await client.query(`
                INSERT INTO vehicle_system_users (username, password, role, plant) 
                VALUES ($1, $2, $3, $4) 
                ON CONFLICT (username) 
                DO UPDATE SET password = EXCLUDED.password, role = EXCLUDED.role, plant = EXCLUDED.plant`,
                [username, hashedPassword, role, plant]
            );
            console.log(`User ${username} initialized.`);
        };

        // Seed Users
        await addUser('cslsuperadmin', 'cslsuperadmin', 'superadmin', null);
        await addUser('admin_seamless', 'admin123', 'admin', 'Seamless Division');
        await addUser('admin_forging', 'admin123', 'admin', 'Forging Division');
        await addUser('admin_main', 'admin123', 'admin', 'Main Plant');
        await addUser('admin_bright', 'admin123', 'admin', 'Bright Bar');
        await addUser('admin_flat', 'admin123', 'admin', 'Flat Bar');
        await addUser('admin_wire', 'admin123', 'admin', 'Wire Plant');
        await addUser('admin_main2', 'admin123', 'admin', 'Main Plant 2 ( SMS 2 )');
        await addUser('admin_40inch', 'admin123', 'admin', '40"Inch Mill');

        console.log('Database initialization complete.');
    } catch (err) {
        console.error('Initialisation Error:', err);
    } finally {
        await client.end();
    }
}

init();
