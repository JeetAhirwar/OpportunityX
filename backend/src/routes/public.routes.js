const express = require("express");
const router = express.Router();
const { getPublicProfile, getPublicJob } = require("../controllers/public.controller");

router.get("/profile/:username", getPublicProfile);
router.get("/jobs/:id", getPublicJob);

module.exports = router;

