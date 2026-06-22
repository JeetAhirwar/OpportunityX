const express = require("express");
const { protect } = require("../middlewares/auth.middleware");
const chat = require("../controllers/chat.controller");

const router = express.Router();
router.use(protect);
router.get("/conversations", chat.getConversations);
router.post("/conversations/start", chat.startConversation);
router.get("/messages/:conversationId", chat.getMessages);
router.patch("/conversations/:conversationId/read", chat.markRead);
router.patch("/messages/:messageId", chat.editMessage);
router.delete("/messages/:messageId", chat.deleteMessage);

module.exports = router;
