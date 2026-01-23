const { Client } = require('pg');
const jwt = require('jsonwebtoken');
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

client.connect();

exports.signin = async (req, res) => {
    try {
        const { identifier, username, password } = req.body;
        const loginId = identifier || username;
        console.log("Signin attempt:", loginId);

        const query = 'SELECT * FROM vehicle_system_users WHERE username = $1';
        const result = await client.query(query, [loginId]);

        if (result.rows.length === 0) {
            console.log("User not found:", identifier);
            return res.status(404).send({ message: "User Not found." });
        }

        const user = result.rows[0];
        console.log("User found:", user.username, "Role:", user.role);

        if (!password || !user.password) {
            console.error("Missing password for comparison:", password ? "input-ok" : "input-missing", user.password ? "db-ok" : "db-missing");
        }

        const passwordIsValid = await bcrypt.compare(password, user.password);

        if (!passwordIsValid) {
            return res.status(401).send({
                accessToken: null,
                message: "Invalid Password!"
            });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role, plant: user.plant },
            process.env.JWT_SECRET || 'secret-key',
            { expiresIn: 86400 } // 24 hours
        );

        res.status(200).send({
            id: user.id,
            username: user.username,
            roles: [user.role], // Array to match frontend expectations
            plant: user.plant,
            accessToken: token
        });

    } catch (err) {
        console.error("Signin error:", err);
        res.status(500).send({ message: err.message });
    }
};
