const express = require("express");
const cors = require("cors");
const path = require("path");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();

// ──────────────────────────────────────────
// Global middleware
// ──────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Static file serving for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ──────────────────────────────────────────
// Routes
// ──────────────────────────────────────────
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/candidate", require("./routes/profileRoutes"));
app.use("/api/jobs", require("./routes/jobRoutes"));
app.use("/api/applications", require("./routes/applicationRoutes"));
app.use("/api/saved-jobs", require("./routes/savedJobRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/recruiter/notes", require("./routes/recruiterNoteRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/public", require("./routes/publicRoutes"));

// Health check
app.get("/", (_req, res) => res.json({ status: "OpportunityX API Running" }));

// ──────────────────────────────────────────
// 404 handler
// ──────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ──────────────────────────────────────────
// Global error handler (must be last)
// ──────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
