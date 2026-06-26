const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth.middleware");
const { getNotifications, markRead, markAllRead } = require("../controllers/notification.controller");

router.get("/", protect, getNotifications);
router.patch("/read-all", protect, markAllRead);
router.patch("/:id/read", protect, markRead);

module.exports = router;

