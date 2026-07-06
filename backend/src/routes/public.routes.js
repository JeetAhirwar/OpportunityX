const express = require("express");
const router = express.Router();
const { getPublicProfile, getPublicJob } = require("../controllers/public.controller");
const { getPublicCareerPage } = require("../controllers/organization.controller");

router.get("/profile/:username", getPublicProfile);
router.get("/jobs/:id", getPublicJob);
router.get("/careers/:slug", getPublicCareerPage);

module.exports = router;

