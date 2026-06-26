const Message = require("../models/message.model");
const {
  assertConversationAccess,
  createMessage,
  getUserConversations,
  markConversationRead,
} = require("../services/chat.service");

const onlineSockets = new Map();
const addOnline = (userId, socketId) => {
  const sockets = onlineSockets.get(userId) || new Set();
  sockets.add(socketId);
  onlineSockets.set(userId, sockets);
};
const removeOnline = (userId, socketId) => {
  const sockets = onlineSockets.get(userId);
  if (!sockets) return;
  sockets.delete(socketId);
  if (!sockets.size) onlineSockets.delete(userId);
};
const emitNotification = (io, userId, notification) => {
  io.to(String(userId)).emit("notification_created", notification);
  io.to(String(userId)).emit("notification_received", notification);
};

module.exports = (io) => {
  const emitConversations = async (userId) => {
    io.to(String(userId)).emit("conversations_updated", await getUserConversations(userId));
  };
  const error = (socket, message) => socket.emit("message_action_error", { message });
  const requireAccess = (conversationId, userId) =>
    assertConversationAccess(conversationId, userId);

  io.on("connection", (socket) => {
    const userId = String(socket.user._id);
    socket.join(userId);
    addOnline(userId, socket.id);
    io.emit("online_users", [...onlineSockets.keys()]);

    socket.on("join_conversation", async (conversationId) => {
      try {
        // Room membership is granted only after a database participant check.
        await requireAccess(conversationId, userId);
        socket.join(String(conversationId));
      } catch (err) {
        error(socket, err.message);
      }
    });

    socket.on("send_message", async (payload = {}) => {
      try {
        const result = await createMessage({
          conversationId: payload.conversationId,
          senderId: userId,
          content: payload.content ?? payload.message,
          attachments: payload.attachments || [],
        });
        if (onlineSockets.has(String(result.recipientId))) {
          result.message.status = "delivered";
          await result.message.save();
        }
        const room = String(result.conversation._id);
        io.to([room, String(result.recipientId)]).emit("receive_message", result.message);
        socket.emit("message_sent", result.message);
        emitNotification(io, result.recipientId, result.notification);
        await Promise.all([emitConversations(userId), emitConversations(result.recipientId)]);
      } catch (err) {
        error(socket, err.message);
      }
    });

    socket.on("mark_conversation_read", async ({ conversationId } = {}) => {
      try {
        await markConversationRead(conversationId, userId);
        io.to(String(conversationId)).emit("message_seen", { conversationId, userId });
        await emitConversations(userId);
      } catch (err) {
        error(socket, err.message);
      }
    });
    socket.on("message_seen", async (payload) => {
      try {
        await markConversationRead(payload?.conversationId, userId);
        io.to(String(payload.conversationId)).emit("message_seen", {
          conversationId: payload.conversationId,
          userId,
        });
        await emitConversations(userId);
      } catch (err) {
        error(socket, err.message);
      }
    });

    socket.on("message_reaction", async ({ messageId, emoji } = {}) => {
      try {
        const message = await Message.findById(messageId);
        if (!message) throw new Error("Message not found");
        await requireAccess(message.conversation, userId);
        const index = message.reactions.findIndex((item) => String(item.user) === userId);
        if (!emoji && index >= 0) message.reactions.splice(index, 1);
        else if (index >= 0) message.reactions[index].emoji = emoji;
        else message.reactions.push({ user: userId, emoji });
        await message.save();
        io.to(String(message.conversation)).emit("message_reaction_updated", {
          messageId,
          conversationId: message.conversation,
          reactions: message.reactions,
        });
      } catch (err) {
        error(socket, err.message);
      }
    });

    socket.on("edit_message", async ({ messageId, content, newMessage } = {}) => {
      try {
        const message = await Message.findOne({ _id: messageId, sender: userId, isDeleted: false });
        if (!message) throw new Error("You can only edit your own messages");
        await requireAccess(message.conversation, userId);
        message.content = String(content ?? newMessage ?? "").trim();
        if (!message.content) throw new Error("Message content is required");
        message.editedAt = new Date();
        await message.save();
        io.to(String(message.conversation)).emit("message_updated", message);
        io.to(String(message.conversation)).emit("message_edited", message);
      } catch (err) {
        error(socket, err.message);
      }
    });

    socket.on("delete_message", async ({ messageId } = {}) => {
      try {
        const message = await Message.findOne({ _id: messageId, sender: userId });
        if (!message) throw new Error("You can only delete your own messages");
        await requireAccess(message.conversation, userId);
        message.isDeleted = true;
        message.deletedAt = new Date();
        message.content = "";
        message.attachments = [];
        await message.save();
        io.to(String(message.conversation)).emit("message_deleted", {
          messageId,
          conversationId: message.conversation,
        });
      } catch (err) {
        error(socket, err.message);
      }
    });

    for (const eventName of ["typing_start", "typing_stop"]) {
      socket.on(eventName, async ({ conversationId } = {}) => {
        try {
          await requireAccess(conversationId, userId);
          socket.to(String(conversationId)).emit(eventName, { conversationId, senderId: userId });
        } catch (err) {
          error(socket, err.message);
        }
      });
    }

    socket.on("disconnect", () => {
      removeOnline(userId, socket.id);
      io.emit("online_users", [...onlineSockets.keys()]);
    });
  });
};
