const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 5432,
});

async function check() {
    await client.connect();
    const res = await client.query("SELECT username, role FROM vehicle_system_users WHERE username = 'cslsuperadmin'");
    console.log(JSON.stringify(res.rows, null, 2));
    await client.end();
}
check();
