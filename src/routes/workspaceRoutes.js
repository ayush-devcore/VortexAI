// ─────────────────────────────────────────────────────────────
// Workspace Routes
// ─────────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();
const workspaceController = require('../controllers/workspaceController');

router.get('/', workspaceController.getAll);
router.get('/:id', workspaceController.getById);
router.post('/', workspaceController.create);
router.put('/:id', workspaceController.update);
router.delete('/:id', workspaceController.remove);

module.exports = router;
