// ─────────────────────────────────────────────────────────────
// Analytics Controller — Dashboard Statistics & Insights
// ─────────────────────────────────────────────────────────────

const taskService = require('../services/taskService');

/**
 * GET /v1/api/analytics
 * Returns mock dashboard analytics & workspace health metrics.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const getAnalytics = async (req, res, next) => {
  try {
    const stats = await taskService.getDashboardStats(req.user?.id);
    const allTasks = await taskService.getAllTasks({}, req.user?.id);

    res.json({
      success: true,
      data: {
        overview: {
          totalTasks: stats.totalTasks,
          activeTasks: stats.activeTasks,
          pendingTasks: stats.pendingTasks,
          completionRate: Math.round((stats.activeTasks / stats.totalTasks) * 100)
        },
        velocity: {
          current: stats.teamVelocity,
          trend: '+8%',
          sprintGoal: 95
        },
        workspaceHealth: {
          score: 92,
          status: 'excellent',
          uptime: '99.97%',
          responseTime: '142ms'
        },
        aiInsights: stats.aiInsights,
        recentActivity: allTasks.slice(0, 3).map(t => ({
          id: t.id,
          title: t.title,
          assignee: t.assignee,
          status: t.status,
          updatedAt: t.updatedAt
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAnalytics };
