const express = require("express");
const { protect, authorize } = require("../middlewares/auth.middleware");
const { getCompany, saveCompany, submitVerification } = require("../controllers/company.controller");

const router = express.Router();
router.get("/", protect, authorize("recruiter"), getCompany);
router.put("/", protect, authorize("recruiter"), saveCompany);
router.post("/submit-verification", protect, authorize("recruiter"), submitVerification);

module.exports = router;
