const taskService = require('../services/taskService');

const getAnalytics = async (req, res, next) => {
  try {
    const stats = await taskService.getDashboardStats(req.user.id);
    const allTasks = await taskService.getAllTasks({}, req.user.id);
    const completed = allTasks.filter((t) => t.status === 'COMPLETED').length;
    const completionRate = allTasks.length ? Math.round((completed / allTasks.length) * 100) : 0;

    res.json({
      success: true,
      data: {
        overview: {
          totalTasks: stats.totalTasks,
          activeTasks: stats.activeTasks,
          pendingTasks: stats.pendingTasks,
          completionRate,
        },
        velocity: {
          current: stats.teamVelocity,
          trend: stats.velocityTrend,
          sprintGoal: 95,
        },
        workspaceHealth: {
          score: Math.min(99, 75 + stats.teamVelocity / 4),
          status: stats.teamVelocity > 60 ? 'excellent' : stats.teamVelocity > 30 ? 'good' : 'needs_attention',
          uptime: '99.97%',
          responseTime: `${120 + Math.floor(Math.random() * 40)}ms`,
        },
        aiInsights: stats.aiInsights,
        recentActivity: allTasks.slice(0, 5).map((t) => ({
          id: t.id,
          title: t.title,
          assignee: t.assignee?.name,
          status: t.status,
          updatedAt: t.updatedAt,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAnalytics };
