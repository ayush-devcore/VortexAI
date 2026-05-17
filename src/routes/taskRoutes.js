// src/routes/taskRoutes.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all active user records
router.get('/', async (req, res, next) => {
    try {
        const tasks = await prisma.task.findMany({
            include: { assignee: { select: { name: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, data: tasks });
    } catch (e) { next(e); }
});

// Post a newly constructed structural tracking object
router.post('/', async (req, res, next) => {
    try {
        const { title, workspaceId } = req.body;
        
        // Dynamically recover active environment tokens
        let ws = await prisma.workspace.findFirst();
        let user = await prisma.user.findFirst();

        const task = await prisma.task.create({
            data: {
                title,
                workspaceId: workspaceId || ws.id,
                creatorId: user.id,
                priority: 'MEDIUM',
                status: 'PENDING'
            },
            include: { assignee: { select: { name: true } } }
        });
        res.status(201).json({ success: true, data: task });
    } catch (e) { next(e); }
});

module.exports = router;
