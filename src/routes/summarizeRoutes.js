const express = require('express');
const router = express.Router();
const summarizeController = require('../controllers/summarizeController');
const { aiLimiter } = require('../middleware/rateLimiter');

router.post('/', aiLimiter, summarizeController.summarize);

module.exports = router;
