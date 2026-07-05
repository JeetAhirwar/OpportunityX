const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth.middleware");
const {
  clearNotifications,
  deleteNotification,
  getNotifications,
  getUnreadCount,
  markAllRead,
  markRead,
} = require("../controllers/notification.controller");

router.get("/", protect, getNotifications);
router.get("/unread-count", protect, getUnreadCount);
router.patch("/read-all", protect, markAllRead);
router.patch("/:id/read", protect, markRead);
router.delete("/clear", protect, clearNotifications);
router.delete("/:id", protect, deleteNotification);

module.exports = router;
