const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 5432,
});

async function createTestUser() {
    try {
        await client.connect();
        const hashedPw = await bcrypt.hash('testPassword123', 10);

        // CSL Super Admin role
        const query = `
            INSERT INTO vehicle_system_users (username, password, role, plant) 
            VALUES ('testUser', $1, 'superadmin', 'Main Plant') 
            ON CONFLICT (username) DO UPDATE SET password = $1
        `;

        await client.query(query, [hashedPw]);
        console.log('Test user "testUser" with password "testPassword123" created successfully.');
    } catch (err) {
        console.error('Error creating test user:', err);
    } finally {
        await client.end();
    }
}

createTestUser();
