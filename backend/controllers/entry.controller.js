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

client.on('error', err => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

client.connect()
    .then(() => console.log('Connected to PostgreSQL Database'))
    .catch(err => {
        console.error('Database Connection Error:', err.message);
        console.error('Check if PostgreSQL is running and credentials in .env are correct.');
    });

// Register Entry
exports.create = async (req, res) => {
    try {
        const {
            plant,
            vehicle_reg,
            driver_name,
            license_no,
            vehicle_type,
            puc_validity,
            insurance_validity,
            chassis_last_5,
            engine_last_5,
            purpose,
            material_details,
            entry_time,
            transporter,
            photos // Array of dataURLs
        } = req.body;

        // Auto-detect category
        const hvTypes = ['Truck', 'Hydra', 'JCB', 'Dumper'];
        const category = hvTypes.some(type => vehicle_type && vehicle_type.includes(type)) ? 'HV' : 'LV';

        // Generate Code: CSL-[LV/HV]-[DDMMYYYY]-[SEQ]
        const now = new Date();
        // IST Offset is +5:30
        const istOffset = 5.5 * 60 * 60 * 1000;
        const istDate = new Date(now.getTime() + istOffset);
        const dateStr = istDate.toISOString().slice(0, 10).split('-').reverse().join(''); // DDMMYYYY

        // Find next sequence for today
        const countQuery = `
            SELECT COUNT(*) FROM entry_logs 
            WHERE created_at::date = CURRENT_DATE AND deleted_at IS NULL
        `;
        const countRes = await client.query(countQuery);
        const seq = (parseInt(countRes.rows[0].count) + 1).toString().padStart(2, '0');

        const gate_pass_no = `CSL-${category}-${dateStr}-${seq}`;

        // Backend validation for dates
        const today = new Date().toISOString().split('T')[0];
        if (puc_validity && insurance_validity) {
            if (puc_validity < today || insurance_validity < today) {
                return res.status(400).send({ message: "Cannot allow entry. Vehicle documents expired!" });
            }
        }

        const query = `
            INSERT INTO entry_logs (
                plant, vehicle_reg, driver_name, license_no, vehicle_type, 
                puc_validity, insurance_validity, chassis_last_5, 
                engine_last_5, purpose, material_details, gate_pass_no, 
                entry_time, photo_url, status, transporter
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'In', $15)
            RETURNING *
        `;
        const values = [
            plant, vehicle_reg, driver_name, license_no, vehicle_type,
            puc_validity, insurance_validity, chassis_last_5,
            engine_last_5, purpose, material_details, gate_pass_no,
            entry_time, JSON.stringify(photos || []), transporter
        ];
        const result = await client.query(query, values);
        res.status(201).send(result.rows[0]);
    } catch (err) {
        console.error("Error in entry.create:", err);
        res.status(500).send({ message: err.message });
    }
};

// Register Exit
exports.updateExit = async (req, res) => {
    try {
        const id = req.params.id;
        const query = `
            UPDATE entry_logs 
            SET exit_time = CURRENT_TIMESTAMP, status = 'Out'
            WHERE id = $1 AND status = 'In' AND deleted_at IS NULL
            RETURNING *
        `;
        const result = await client.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).send({ message: "Active entry log not found" });
        }
        res.status(200).send(result.rows[0]);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// Get Today's Logs with filtering
exports.findToday = async (req, res) => {
    try {
        let query = `
            SELECT e.* 
            FROM entry_logs e
            WHERE e.created_at::date = CURRENT_DATE AND e.deleted_at IS NULL
        `;
        let values = [];

        // If not superadmin, filter by plant
        if (req.userRole && req.userRole !== 'superadmin' && req.userPlant) {
            query += ` AND e.plant = $1`;
            values.push(req.userPlant);
        }

        query += ` ORDER BY e.created_at DESC`;

        const result = await client.query(query, values);
        res.status(200).send(result.rows);
    } catch (err) {
        console.error("Error in entry.findToday:", err);
        res.status(500).send({ message: err.message });
    }
};

// Get Logs by Date
exports.findByDate = async (req, res) => {
    try {
        const { date } = req.query; // Format: YYYY-MM-DD
        let query = `
            SELECT e.* 
            FROM entry_logs e
            WHERE e.created_at::date = $1 AND e.deleted_at IS NULL
        `;
        let values = [date || new Date().toISOString().split('T')[0]];

        // If not superadmin, filter by plant
        if (req.userRole && req.userRole !== 'superadmin' && req.userPlant) {
            query += ` AND e.plant = $2`;
            values.push(req.userPlant);
        }

        query += ` ORDER BY e.created_at DESC`;

        const result = await client.query(query, values);
        res.status(200).send(result.rows);
    } catch (err) {
        console.error("Error in entry.findByDate:", err);
        res.status(500).send({ message: err.message });
    }
};

// Approve Entry
exports.approve = async (req, res) => {
    try {
        const id = req.params.id;
        const query = `
            UPDATE entry_logs 
            SET approval_status = 'Approved', approved_by = $1
            WHERE id = $2 AND deleted_at IS NULL
            RETURNING *
        `;
        const result = await client.query(query, [req.username || req.userId, id]);
        if (result.rows.length === 0) return res.status(404).send({ message: "Log not found" });
        res.status(200).send(result.rows[0]);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// Reject Entry
exports.reject = async (req, res) => {
    try {
        const id = req.params.id;
        const { reason } = req.body;
        const query = `
            UPDATE entry_logs 
            SET approval_status = 'Rejected', approved_by = $1, rejection_reason = $2
            WHERE id = $3 AND deleted_at IS NULL
            RETURNING *
        `;
        const result = await client.query(query, [req.username || req.userId, reason, id]);
        if (result.rows.length === 0) return res.status(404).send({ message: "Log not found" });
        res.status(200).send(result.rows[0]);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// Update Entry (Minimal)
exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        const {
            driver_name, vehicle_reg, purpose, transporter, plant,
            license_no, vehicle_type, puc_validity, insurance_validity,
            chassis_last_5, engine_last_5, material_details
        } = req.body;

        const query = `
            UPDATE entry_logs 
            SET 
                driver_name = $1, vehicle_reg = $2, purpose = $3, transporter = $4,
                plant = $5, license_no = $6, vehicle_type = $7, puc_validity = $8,
                insurance_validity = $9, chassis_last_5 = $10, engine_last_5 = $11, 
                material_details = $12
            WHERE id = $13 AND deleted_at IS NULL
            RETURNING *
        `;
        const values = [
            driver_name, vehicle_reg, purpose, transporter, plant,
            license_no, vehicle_type, puc_validity, insurance_validity,
            chassis_last_5, engine_last_5, material_details, id
        ];
        const result = await client.query(query, values);
        if (result.rows.length === 0) return res.status(404).send({ message: "Log not found" });
        res.status(200).send(result.rows[0]);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// Soft Delete Entry
exports.softDelete = async (req, res) => {
    try {
        const id = req.params.id;
        // Verify only superadmin can delete
        if (req.userRole !== 'superadmin') {
            return res.status(403).send({ message: "Only superadmin can perform this action" });
        }

        const query = `
            UPDATE entry_logs 
            SET deleted_at = CURRENT_TIMESTAMP
            WHERE id = $1 AND deleted_at IS NULL
            RETURNING *
        `;
        const result = await client.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).send({ message: "Entry not found or already deleted" });
        }

        res.status(200).send({ message: "Entry successfully deleted", entry: result.rows[0] });
    } catch (err) {
        console.error("Error in entry.softDelete:", err);
        res.status(500).send({ message: err.message });
    }
};

// Find One Entry
exports.findOne = async (req, res) => {
    try {
        const id = req.params.id;
        const query = `SELECT * FROM entry_logs WHERE id = $1 AND deleted_at IS NULL`;
        const result = await client.query(query, [id]);
        if (result.rows.length === 0) return res.status(404).send({ message: "Log not found" });
        res.status(200).send(result.rows[0]);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

