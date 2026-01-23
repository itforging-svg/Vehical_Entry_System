const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 5432,
});

async function debug() {
    try {
        await client.connect();

        console.log("--- Schema ---");
        const schema = await client.query(`
            SELECT column_name, data_type, character_maximum_length 
            FROM information_schema.columns 
            WHERE table_name = 'entry_logs' AND column_name IN ('driver_mobile', 'aadhar_no')
        `);
        console.log(JSON.stringify(schema.rows, null, 2));

        console.log("\n--- Latest Data ---");
        const data = await client.query(`
            SELECT id, driver_name, '|' || driver_mobile || '|' as mobile, '|' || aadhar_no || '|' as aadhar 
            FROM entry_logs 
            WHERE deleted_at IS NULL 
            ORDER BY created_at DESC 
            LIMIT 5
        `);
        console.log(JSON.stringify(data.rows, null, 2));

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}
debug();
