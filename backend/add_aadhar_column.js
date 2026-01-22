const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 5432,
});

const addColumn = async () => {
    try {
        await client.connect();
        await client.query(`
            ALTER TABLE entry_logs 
            ADD COLUMN IF NOT EXISTS aadhar_no VARCHAR(20),
            ADD COLUMN IF NOT EXISTS driver_mobile VARCHAR(20);
        `);
        console.log("Columns 'aadhar_no' and 'driver_mobile' ensured.");
    } catch (err) {
        console.error("Error adding column:", err);
    } finally {
        await client.end();
    }
};

addColumn();
