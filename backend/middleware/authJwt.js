const jwt = require("jsonwebtoken");
const dotenv = require('dotenv');

dotenv.config();

const verifyToken = (req, res, next) => {
    let token = req.headers["x-access-token"] || req.headers["authorization"];

    if (!token) {
        return res.status(403).send({ message: "No token provided!" });
    }

    // Handle 'Bearer <token>' format
    if (token.startsWith('Bearer ')) {
        token = token.slice(7, token.length);
    }

    jwt.verify(token, process.env.JWT_SECRET || 'secret-key', (err, decoded) => {
        if (err) {
            console.error("JWT Verification Error:", err.message);
            return res.status(401).send({ message: "Unauthorized!" });
        }
        req.userId = decoded.id;
        req.userRole = decoded.role;
        req.userPlant = decoded.plant;
        req.username = decoded.username; // Added this
        console.log(`VerifyToken: User=${req.username}, Role=${req.userRole}`);
        next();
    });
};

module.exports = verifyToken;
