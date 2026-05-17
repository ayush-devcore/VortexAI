const express = require('express');
const summarizeController = require('../controllers/summarizeController');
const { requireAuth } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/', requireAuth, aiLimiter, summarizeController.summarize);

module.exports = router;
