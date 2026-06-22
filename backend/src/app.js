const express = require("express");
const cors = require("cors");
const path = require("path");
const corsOptions = require("./config/cors");
const { errorHandler } = require("./middlewares/error.middleware");

const app = express();

app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/candidate", require("./routes/profile.routes"));
app.use("/api/jobs", require("./routes/job.routes"));
app.use("/api/applications", require("./routes/application.routes"));
app.use("/api/saved-jobs", require("./routes/saved-job.routes"));
app.use("/api/notifications", require("./routes/notification.routes"));
app.use("/api/recruiter/notes", require("./routes/recruiter-note.routes"));
app.use("/api/admin", require("./routes/admin.routes"));
app.use("/api/public", require("./routes/public.routes"));

app.get("/", (_req, res) => res.json({ status: "OpportunityX API Running" }));
app.get("/api/health", (_req, res) =>
  res.json({ success: true, status: "healthy", service: "opportunityx-api" })
);

app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use(errorHandler);

module.exports = app;
