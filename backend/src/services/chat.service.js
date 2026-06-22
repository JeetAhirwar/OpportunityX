const Application = require("../models/application.model");
const Conversation = require("../models/conversation.model");
const Message = require("../models/message.model");
const Notification = require("../models/notification.model");

const userFields = "name email role";

const assertConversationAccess = async (conversationId, userId) => {
  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: userId,
  });
  if (!conversation) {
    const error = new Error("Conversation not found or access denied");
    error.statusCode = 403;
    throw error;
  }
  return conversation;
};

const formatConversation = (conversation, userId) => {
  const value = conversation.toObject ? conversation.toObject() : conversation;
  const unreadMap = conversation.unreadCounts;
  return {
    ...value,
    unreadCount: Number(unreadMap?.get?.(String(userId)) || value.unreadCounts?.[String(userId)] || 0),
  };
};

const getUserConversations = async (userId) => {
  const conversations = await Conversation.find({ participants: userId })
    .populate("participants", userFields)
    .populate("job", "title company")
    .populate("application", "status")
    .sort({ lastMessageAt: -1 });
  return conversations.map((conversation) => formatConversation(conversation, userId));
};

const startApplicationConversation = async (currentUser, applicationId) => {
  if (!applicationId) {
    const error = new Error("applicationId is required");
    error.statusCode = 400;
    throw error;
  }
  if (currentUser.role === "admin") {
    const error = new Error("Administrators cannot access private conversations");
    error.statusCode = 403;
    throw error;
  }

  // The application is the permission boundary: it proves the candidate applied
  // and identifies the recruiter who owns the corresponding job.
  const application = await Application.findById(applicationId).populate("job");
  if (!application || !application.job || application.status === "withdrawn") {
    const error = new Error("Eligible application not found");
    error.statusCode = 404;
    throw error;
  }

  const candidateId = String(application.candidate);
  const recruiterId = String(application.job.postedBy);
  const currentId = String(currentUser._id);
  if (currentId !== candidateId && currentId !== recruiterId) {
    const error = new Error("You cannot start this conversation");
    error.statusCode = 403;
    throw error;
  }

  let conversation = await Conversation.findOne({ application: application._id });
  if (!conversation) {
    conversation = await Conversation.create({
      participants: [application.candidate, application.job.postedBy],
      job: application.job._id,
      application: application._id,
      unreadCounts: { [candidateId]: 0, [recruiterId]: 0 },
    });
  }

  return Conversation.findById(conversation._id)
    .populate("participants", userFields)
    .populate("job", "title company")
    .populate("application", "status");
};

const createMessage = async ({ conversationId, senderId, content, attachments = [] }) => {
  const conversation = await assertConversationAccess(conversationId, senderId);
  const cleanContent = String(content || "").trim();
  if (!cleanContent && !attachments.length) {
    const error = new Error("Message content or attachment is required");
    error.statusCode = 400;
    throw error;
  }

  const message = await Message.create({
    conversation: conversation._id,
    sender: senderId,
    content: cleanContent,
    attachments,
    readBy: [senderId],
  });
  const recipientId = conversation.participants.find((id) => String(id) !== String(senderId));
  const count = Number(conversation.unreadCounts.get(String(recipientId)) || 0);
  conversation.unreadCounts.set(String(recipientId), count + 1);
  conversation.lastMessage = message._id;
  conversation.lastMessageText = cleanContent || attachments[0]?.name || "Attachment";
  conversation.lastMessageAt = message.createdAt;
  await conversation.save();

  const populatedMessage = await Message.findById(message._id).populate("sender", userFields);
  const notification = await Notification.create({
    user: recipientId,
    title: "New Message",
    message: `${populatedMessage.sender.name}: ${conversation.lastMessageText}`,
    type: "info",
    link: "/messages",
  });
  return { message: populatedMessage, conversation, recipientId, notification };
};

const markConversationRead = async (conversationId, userId) => {
  const conversation = await assertConversationAccess(conversationId, userId);
  conversation.unreadCounts.set(String(userId), 0);
  await conversation.save();
  await Message.updateMany(
    { conversation: conversationId, sender: { $ne: userId }, readBy: { $ne: userId } },
    { $addToSet: { readBy: userId }, $set: { status: "seen" } }
  );
  return conversation;
};

module.exports = {
  assertConversationAccess,
  createMessage,
  formatConversation,
  getUserConversations,
  markConversationRead,
  startApplicationConversation,
};
