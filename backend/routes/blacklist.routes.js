const express = require('express');
const router = express.Router();
const blacklistController = require('../controllers/blacklist.controller');
const verifyToken = require('../middleware/authJwt');

// Middleware to check if user is superadmin
const isSuperAdmin = (req, res, next) => {
    const role = req.userRole ? req.userRole.toLowerCase() : '';
    console.log(`isSuperAdmin check: role=${role}`);
    if (role !== 'cslsuperadmin' && role !== 'superadmin') {
        console.warn(`Access Denied: ${role} is not superadmin`);
        return res.status(403).send({ message: "Require Super Admin Role!" });
    }
    next();
};

router.get('/', [verifyToken, isSuperAdmin], blacklistController.list);
router.get('/check/:vehicle_no', [verifyToken], blacklistController.check); // Accessible to all logged in users
router.post('/', [verifyToken, isSuperAdmin], blacklistController.add);
router.delete('/:id', [verifyToken, isSuperAdmin], blacklistController.remove);

module.exports = router;
