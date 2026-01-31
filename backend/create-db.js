const { Client } = require('pg');
require('dotenv').config();

async function createDatabase() {
    const dbName = process.env.DB_NAME || 'Vehical_Entry_pass';
    const client = new Client({
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        database: 'postgres', // Connect to default postgres DB
        password: process.env.DB_PASSWORD || 'postgres',
        port: 5432,
    });

    try {
        await client.connect();

        // Check if DB exists
        const res = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", [dbName]);

        if (res.rowCount === 0) {
            console.log(`Creating database ${dbName}...`);
            await client.query(`CREATE DATABASE "${dbName}"`);
            console.log(`Database ${dbName} created successfully.`);
        } else {
            console.log(`Database ${dbName} already exists.`);
        }
    } catch (err) {
        console.error('Error creating database:', err);
    } finally {
        await client.end();
    }
}

createDatabase();
