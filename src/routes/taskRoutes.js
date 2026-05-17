const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { optionalAuth } = require('../middleware/auth');

router.use(optionalAuth);
router.get('/', taskController.getAll);
router.get('/stats', taskController.getStats);
router.get('/:id', taskController.getById);
router.post('/', taskController.create);
router.put('/:id', taskController.update);
router.delete('/:id', taskController.remove);

module.exports = router;
