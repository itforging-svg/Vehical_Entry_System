const express = require('express');
const router = express.Router();
const entry = require('../controllers/entry.controller');

router.post('/', entry.create);
router.get('/today', entry.findToday);
router.put('/:id/exit', entry.updateExit);

module.exports = router;
