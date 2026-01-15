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
    try {
        await client.connect();
        const res = await client.query(`
            SELECT table_name, column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'entry_logs'
        `);
        console.log("COLUMNS_JSON_START");
        console.log(JSON.stringify(res.rows, null, 2));
        console.log("COLUMNS_JSON_END");
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}
check();
