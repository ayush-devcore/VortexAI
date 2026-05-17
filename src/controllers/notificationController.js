const notificationService = require('../services/notificationService');

const list = async (req, res, next) => {
  try {
    const notifications = await notificationService.getForUser(req.user.id, {
      unreadOnly: req.query.unread === 'true',
    });
    const unreadCount = await notificationService.getUnreadCount(req.user.id);
    res.json({ success: true, data: notifications, unreadCount });
  } catch (e) {
    next(e);
  }
};

const markRead = async (req, res, next) => {
  try {
    await notificationService.markRead(req.params.id, req.user.id);
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
};

const markAllRead = async (req, res, next) => {
  try {
    await notificationService.markAllRead(req.user.id);
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
};

module.exports = { list, markRead, markAllRead };
