const express = require('express');
const workspaceController = require('../controllers/workspaceController');
const memberRoutes = require('./memberRoutes');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);
router.get('/', workspaceController.getAll);
router.get('/:id', workspaceController.getById);
router.post('/', workspaceController.create);
router.put('/:id', workspaceController.update);
router.delete('/:id', workspaceController.remove);
router.use('/:workspaceId/members', memberRoutes);

module.exports = router;
