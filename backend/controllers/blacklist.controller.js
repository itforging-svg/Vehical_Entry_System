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

client.connect();

// Get all blacklisted vehicles
exports.list = async (req, res) => {
    try {
        const query = 'SELECT * FROM vehicle_blacklist ORDER BY created_at DESC';
        const result = await client.query(query);
        res.status(200).send(result.rows);
    } catch (err) {
        console.error("Blacklist list error:", err);
        res.status(500).send({ message: err.message });
    }
};

// Add a vehicle to the blacklist
exports.add = async (req, res) => {
    try {
        const { vehicle_no, reason } = req.body;

        if (!vehicle_no) {
            return res.status(400).send({ message: "Vehicle Number is required." });
        }

        const query = 'INSERT INTO vehicle_blacklist (vehicle_no, reason, created_by) VALUES ($1, $2, $3) RETURNING *';
        const values = [vehicle_no.toUpperCase(), reason, req.username || 'admin'];

        const result = await client.query(query, values);
        res.status(201).send(result.rows[0]);
    } catch (err) {
        if (err.code === '23505') { // Unique violation
            console.log("Blacklist: entry already exists for", req.body.vehicle_no);
            const check = await client.query('SELECT * FROM vehicle_blacklist WHERE vehicle_no = $1', [req.body.vehicle_no.toUpperCase()]);
            return res.status(200).send(check.rows[0]);
        }
        console.error("Blacklist add error:", err);
        res.status(500).send({ message: err.message });
    }
};

// Remove a vehicle from the blacklist
exports.remove = async (req, res) => {
    try {
        const { id } = req.params;
        const query = 'DELETE FROM vehicle_blacklist WHERE id = $1 RETURNING *';
        const result = await client.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).send({ message: "Blacklist entry not found." });
        }

        res.status(200).send({ message: "Vehicle removed from blacklist." });
    } catch (err) {
        console.error("Blacklist remove error:", err);
        res.status(500).send({ message: err.message });
    }
};
// Check if a vehicle is blacklisted
exports.check = async (req, res) => {
    try {
        const { vehicle_no } = req.params;
        const query = 'SELECT * FROM vehicle_blacklist WHERE vehicle_no = $1';
        const result = await client.query(query, [vehicle_no.toUpperCase()]);

        if (result.rows.length > 0) {
            return res.status(200).send({
                blacklisted: true,
                reason: result.rows[0].reason
            });
        }
        res.status(200).send({ blacklisted: false });
    } catch (err) {
        console.error("Blacklist check error:", err);
        res.status(500).send({ message: err.message });
    }
};
