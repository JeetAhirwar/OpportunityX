const repository = require("../repositories/notification.repository");

const emitUnreadCount = async (io, recipient) => {
  if (!io || !recipient) return;
  const unreadCount = await repository.countUnread(recipient);
  io.to(String(recipient)).emit("notifications_unread_count", { unreadCount });
};

const deliver = async (io, notification) => {
  if (!io || !notification?.recipient) return;
  const normalized = repository.normalize(notification);
  const room = String(normalized.recipient);
  io.to(room).emit("notification_created", normalized);
  io.to(room).emit("notification_received", normalized);
  await emitUnreadCount(io, normalized.recipient);
};

module.exports = {
  deliver,
  emitUnreadCount,
};
