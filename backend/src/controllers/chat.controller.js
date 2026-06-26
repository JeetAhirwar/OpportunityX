const Message = require("../models/message.model");
const {
  assertConversationAccess,
  formatConversation,
  getUserConversations,
  markConversationRead,
  startApplicationConversation,
} = require("../services/chat.service");

const fail = (res, error) =>
  res.status(error.statusCode || 500).json({ success: false, message: error.message });

exports.getConversations = async (req, res) => {
  try {
    const conversations = await getUserConversations(req.user._id);
    res.json({ success: true, conversations });
  } catch (error) {
    fail(res, error);
  }
};

exports.startConversation = async (req, res) => {
  try {
    const conversation = await startApplicationConversation(req.user, req.body.applicationId);
    res.json({ success: true, conversation: formatConversation(conversation, req.user._id) });
  } catch (error) {
    fail(res, error);
  }
};

exports.getMessages = async (req, res) => {
  try {
    await assertConversationAccess(req.params.conversationId, req.user._id);
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);
    const page = Math.max(Number(req.query.page) || 1, 1);
    const filter = { conversation: req.params.conversationId, isDeleted: false };
    const [rows, total] = await Promise.all([
      Message.find(filter)
        .populate("sender", "name email role")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Message.countDocuments(filter),
    ]);
    res.json({
      success: true,
      messages: rows.reverse(),
      page,
      total,
      hasMore: page * limit < total,
    });
  } catch (error) {
    fail(res, error);
  }
};

exports.markRead = async (req, res) => {
  try {
    await markConversationRead(req.params.conversationId, req.user._id);
    res.json({ success: true });
  } catch (error) {
    fail(res, error);
  }
};

exports.uploadAttachment = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "Attachment is required" });
    res.json({
      success: true,
      attachment: {
        url: `/uploads/chat/${req.file.filename}`,
        name: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
      },
    });
  } catch (error) {
    fail(res, error);
  }
};

exports.editMessage = async (req, res) => {
  try {
    const message = await Message.findOne({
      _id: req.params.messageId,
      sender: req.user._id,
      isDeleted: false,
    });
    if (!message) return res.status(404).json({ success: false, message: "Message not found" });
    await assertConversationAccess(message.conversation, req.user._id);
    const content = String(req.body.content || "").trim();
    if (!content) return res.status(400).json({ success: false, message: "Content is required" });
    message.content = content;
    message.editedAt = new Date();
    await message.save();
    req.app.get("io")?.to(String(message.conversation)).emit("message_edited", message);
    res.json({ success: true, message });
  } catch (error) {
    fail(res, error);
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findOne({ _id: req.params.messageId, sender: req.user._id });
    if (!message) return res.status(404).json({ success: false, message: "Message not found" });
    await assertConversationAccess(message.conversation, req.user._id);
    message.isDeleted = true;
    message.deletedAt = new Date();
    message.content = "";
    message.attachments = [];
    await message.save();
    req.app.get("io")?.to(String(message.conversation)).emit("message_deleted", {
      messageId: message._id,
      conversationId: message.conversation,
    });
    res.json({ success: true });
  } catch (error) {
    fail(res, error);
  }
};
