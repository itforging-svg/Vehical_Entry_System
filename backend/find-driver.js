const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 5432,
});

async function findAtharv() {
    try {
        await client.connect();
        const res = await client.query("SELECT id, driver_name, driver_mobile, aadhar_no FROM entry_logs WHERE driver_name LIKE '%Atharv%'");
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}
findAtharv();
