const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 5432,
});

async function list() {
    try {
        await client.connect();
        const res = await client.query(`SELECT id, gate_pass_no, vehicle_reg, driver_name FROM entry_logs ORDER BY created_at DESC LIMIT 5`);
        console.log("Recent Entries:");
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}
list();
