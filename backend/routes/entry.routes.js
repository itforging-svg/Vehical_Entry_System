const express = require('express');
const router = express.Router();
const entry = require('../controllers/entry.controller');
const authJwt = require('../middleware/authJwt');

// Public endpoint - no auth required for entry creation
router.post('/', entry.create);

// Protected endpoints - require authentication
router.get('/today', [authJwt], entry.findToday);
router.get('/bydate', [authJwt], entry.findByDate);
router.get('/history/:identifier', entry.findHistory);
router.put('/:id/exit', [authJwt], entry.updateExit);
router.put('/:id/approve', [authJwt], entry.approve);
router.put('/:id/reject', [authJwt], entry.reject);
router.put('/:id', [authJwt], entry.update);
router.get('/:id', entry.findOne);
router.delete('/:id', [authJwt], entry.softDelete);

module.exports = router;
