// ─────────────────────────────────────────────────────────────
// Vortex Workspace — Main Server Entry Point
// ─────────────────────────────────────────────────────────────

const express = require('express');
const cors = require('cors');
const path = require('path');

// Route Imports
const workspaceRoutes = require('./src/routes/workspaceRoutes');
const taskRoutes = require('./src/routes/taskRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ───────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// ── API Routes ──────────────────────────────────────────────
app.use('/api/v1/workspace', workspaceRoutes);
app.use('/api/v1/tasks', taskRoutes);

// ── Health Check ────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'operational',
    service: 'Vortex Workspace API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// ── Catch-all: serve frontend for any non-API route ─────────
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Start Server ────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n  ⚡ Vortex Workspace API`);
  console.log(`  ───────────────────────`);
  console.log(`  → Server:    http://localhost:${PORT}`);
  console.log(`  → API Base:  http://localhost:${PORT}/api/v1`);
  console.log(`  → Health:    http://localhost:${PORT}/api/health`);
  console.log(`  → Status:    Running ✓\n`);
});

module.exports = app;
