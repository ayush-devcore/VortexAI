const express = require('express');
const memberController = require('../controllers/memberController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

router.use(requireAuth);
router.get('/', memberController.list);
router.post('/', memberController.invite);
router.delete('/:userId', memberController.remove);

module.exports = router;
