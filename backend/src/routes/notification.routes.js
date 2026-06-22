const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth.middleware");
const { getNotifications, markRead, markAllRead } = require("../controllers/notification.controller");

router.get("/", protect, getNotifications);
router.patch("/:id/read", protect, markRead);
router.patch("/read-all", protect, markAllRead);

module.exports = router;

