const Notification = require("../models/notification.model");

const recipientFilter = (userId) => ({ $or: [{ user: userId }, { recipient: userId }] });

const normalize = (notification) => {
  if (!notification) return notification;
  const value = notification.toObject ? notification.toObject() : notification;
  const recipient = value.recipient || value.user;
  const isRead = Boolean(value.isRead || value.read);
  return {
    ...value,
    user: value.user || recipient,
    recipient,
    read: isRead,
    isRead,
  };
};

const create = async (payload) => normalize(await Notification.create({
  ...payload,
  user: payload.user || payload.recipient,
  recipient: payload.recipient || payload.user,
  read: Boolean(payload.read || payload.isRead),
  isRead: Boolean(payload.isRead || payload.read),
}));

const findDuplicate = (recipient, dedupeKey) => {
  if (!dedupeKey) return null;
  return Notification.findOne({
    ...recipientFilter(recipient),
    "metadata.dedupeKey": dedupeKey,
  }).lean();
};

const listForRecipient = async (recipient, { page = 1, limit = 20, unreadOnly = false, type } = {}) => {
  const numericPage = Math.max(Number(page) || 1, 1);
  const numericLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const filter = recipientFilter(recipient);
  if (unreadOnly) {
    filter.$and = [{ $or: [{ read: false }, { isRead: false }, { read: { $exists: false } }] }];
  }
  if (type) filter.type = type;

  const [items, total, unreadCount] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip((numericPage - 1) * numericLimit)
      .limit(numericLimit)
      .lean(),
    Notification.countDocuments(filter),
    countUnread(recipient),
  ]);

  return {
    notifications: items.map(normalize),
    pagination: {
      page: numericPage,
      limit: numericLimit,
      total,
      pages: Math.max(Math.ceil(total / numericLimit), 1),
      hasMore: numericPage * numericLimit < total,
    },
    unreadCount,
  };
};

const countUnread = (recipient) => Notification.countDocuments({
  ...recipientFilter(recipient),
  $or: [{ read: false }, { isRead: false }, { read: { $exists: false } }],
});

const markRead = (recipient, id) => Notification.findOneAndUpdate(
  { _id: id, ...recipientFilter(recipient) },
  { $set: { read: true, isRead: true, readAt: new Date() } },
  { new: true }
).lean().then(normalize);

const markAllRead = (recipient) => Notification.updateMany(
  { ...recipientFilter(recipient), $or: [{ read: false }, { isRead: false }] },
  { $set: { read: true, isRead: true, readAt: new Date() } }
);

const deleteOne = (recipient, id) => Notification.findOneAndDelete({
  _id: id,
  ...recipientFilter(recipient),
}).lean().then(normalize);

const clearForRecipient = (recipient) => Notification.deleteMany(recipientFilter(recipient));

module.exports = {
  clearForRecipient,
  countUnread,
  create,
  deleteOne,
  findDuplicate,
  listForRecipient,
  markAllRead,
  markRead,
  normalize,
  recipientFilter,
};
