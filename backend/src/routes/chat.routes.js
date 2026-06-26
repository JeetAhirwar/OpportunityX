const express = require("express");
const { protect } = require("../middlewares/auth.middleware");
const { uploadChatAttachment } = require("../middlewares/upload.middleware");
const rateLimit = require("../middlewares/rate-limit.middleware");
const chat = require("../controllers/chat.controller");

const router = express.Router();
router.use(protect, rateLimit({ windowMs: 10 * 60 * 1000, max: 120, keyPrefix: "chat" }));
router.get("/conversations", chat.getConversations);
router.post("/conversations/start", chat.startConversation);
router.get("/messages/:conversationId", chat.getMessages);
router.post("/upload", uploadChatAttachment, chat.uploadAttachment);
router.patch("/conversations/:conversationId/read", chat.markRead);
router.patch("/messages/:messageId", chat.editMessage);
router.delete("/messages/:messageId", chat.deleteMessage);

module.exports = router;
