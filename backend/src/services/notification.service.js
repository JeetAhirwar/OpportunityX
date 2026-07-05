const User = require("../models/user.model");
const repository = require("../repositories/notification.repository");
const gateway = require("../socket/notificationGateway");

const TYPES = Object.freeze({
  APPLICATION_SUBMITTED: "application_submitted",
  APPLICATION_VIEWED: "application_viewed",
  APPLICATION_SHORTLISTED: "application_shortlisted",
  INTERVIEW_SCHEDULED: "interview_scheduled",
  INTERVIEW_UPDATED: "interview_updated",
  OFFER_RECEIVED: "offer_received",
  APPLICATION_REJECTED: "application_rejected",
  MESSAGE_RECEIVED: "message_received",
  PROFILE_VERIFICATION: "profile_verification",
  ACCOUNT_UPDATE: "account_update",
  NEW_APPLICATION: "new_application",
  APPLICATION_WITHDRAWN: "application_withdrawn",
  JOB_MODERATION: "job_moderation",
  ADMIN_ANNOUNCEMENT: "admin_announcement",
  RECRUITER_REGISTERED: "recruiter_registered",
  RECRUITER_APPROVAL_PENDING: "recruiter_approval_pending",
  ABUSE_REPORT: "abuse_report",
  FAILED_UPLOAD: "failed_upload",
  SYSTEM_ALERT: "system_alert",
});

const severityFor = (type) => {
  if ([TYPES.APPLICATION_REJECTED, TYPES.FAILED_UPLOAD, TYPES.SYSTEM_ALERT].includes(type)) return "high";
  if ([TYPES.OFFER_RECEIVED, TYPES.INTERVIEW_SCHEDULED, TYPES.RECRUITER_APPROVAL_PENDING].includes(type)) return "high";
  return "normal";
};

const iconFor = (type) => {
  if (type.includes("message")) return "message";
  if (type.includes("application") || type.includes("job")) return "briefcase";
  if (type.includes("profile") || type.includes("recruiter")) return "user-check";
  if (type.includes("alert") || type.includes("failed") || type.includes("abuse")) return "alert";
  return "bell";
};

const createNotification = async ({
  io,
  recipient,
  sender = null,
  type = "info",
  title,
  message,
  entityType = "",
  entityId = null,
  link = "",
  icon,
  priority,
  metadata = {},
  dedupeKey,
}) => {
  if (!recipient || !title || !message) return null;
  const finalDedupeKey = dedupeKey || metadata.dedupeKey;
  if (finalDedupeKey) {
    const duplicate = await repository.findDuplicate(recipient, finalDedupeKey);
    if (duplicate) return repository.normalize(duplicate);
  }
  const notification = await repository.create({
    recipient,
    sender,
    type,
    title,
    message,
    entityType,
    entityId,
    link,
    icon: icon || iconFor(type),
    priority: priority || severityFor(type),
    metadata: { ...metadata, ...(finalDedupeKey ? { dedupeKey: finalDedupeKey } : {}) },
  });
  await gateway.deliver(io, notification);
  return notification;
};

const notifyAdmins = async (payload) => {
  const admins = await User.find({ role: "admin", isActive: true }).select("_id").lean();
  return Promise.all(admins.map((admin) => createNotification({ ...payload, recipient: admin._id })));
};

const getNotifications = (recipient, options) => repository.listForRecipient(recipient, options);
const getUnreadCount = (recipient) => repository.countUnread(recipient);

const markRead = async ({ io, recipient, id }) => {
  const notification = await repository.markRead(recipient, id);
  await gateway.emitUnreadCount(io, recipient);
  return notification;
};

const markAllRead = async ({ io, recipient }) => {
  const result = await repository.markAllRead(recipient);
  await gateway.emitUnreadCount(io, recipient);
  return result;
};

const deleteNotification = async ({ io, recipient, id }) => {
  const notification = await repository.deleteOne(recipient, id);
  await gateway.emitUnreadCount(io, recipient);
  return notification;
};

const clearNotifications = async ({ io, recipient }) => {
  const result = await repository.clearForRecipient(recipient);
  await gateway.emitUnreadCount(io, recipient);
  return result;
};

module.exports = {
  TYPES,
  clearNotifications,
  createNotification,
  deleteNotification,
  getNotifications,
  getUnreadCount,
  markAllRead,
  markRead,
  notifyAdmins,
};
