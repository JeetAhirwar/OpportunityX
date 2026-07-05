const notificationService = require("../services/notification.service");

const getIo = (req) => req.app.get("io");

exports.getNotifications = async (req, res) => {
  try {
    const hasPagination = req.query.page || req.query.limit || req.query.unreadOnly || req.query.type;
    const result = await notificationService.getNotifications(req.user._id, {
      page: req.query.page,
      limit: req.query.limit,
      unreadOnly: req.query.unreadOnly === "true",
      type: req.query.type,
    });

    if (!hasPagination) return res.json(result.notifications);
    return res.json({ success: true, ...result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const unreadCount = await notificationService.getUnreadCount(req.user._id);
    return res.json({ success: true, unreadCount });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.markRead = async (req, res) => {
  try {
    const notification = await notificationService.markRead({
      io: getIo(req),
      recipient: req.user._id,
      id: req.params.id,
    });
    if (!notification) return res.status(404).json({ success: false, message: "Notification not found" });
    return res.json({ success: true, message: "Marked as read", notification });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.markAllRead = async (req, res) => {
  try {
    const result = await notificationService.markAllRead({ io: getIo(req), recipient: req.user._id });
    return res.json({ success: true, message: "All marked as read", modifiedCount: result.modifiedCount || 0 });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const notification = await notificationService.deleteNotification({
      io: getIo(req),
      recipient: req.user._id,
      id: req.params.id,
    });
    if (!notification) return res.status(404).json({ success: false, message: "Notification not found" });
    return res.json({ success: true, message: "Notification deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.clearNotifications = async (req, res) => {
  try {
    const result = await notificationService.clearNotifications({ io: getIo(req), recipient: req.user._id });
    return res.json({ success: true, message: "Notifications cleared", deletedCount: result.deletedCount || 0 });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
