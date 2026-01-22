const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 5432,
});

async function migrate() {
    try {
        await client.connect();
        console.log('Connected to DB for migration...');

        await client.query(`
            ALTER TABLE entry_logs ADD COLUMN IF NOT EXISTS challan_no VARCHAR(50);
            ALTER TABLE entry_logs ADD COLUMN IF NOT EXISTS invoice_no VARCHAR(50);
            ALTER TABLE entry_logs ADD COLUMN IF NOT EXISTS security_person_name VARCHAR(100);
        `);
        console.log('Migration successful: challan_no, invoice_no, and security_person_name columns added.');
    } catch (err) {
        console.error('Migration Error:', err);
    } finally {
        await client.end();
    }
}

migrate();
