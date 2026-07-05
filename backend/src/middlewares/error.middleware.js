const logger = require("../utils/logger");
const notificationService = require("../services/notification.service");

/**
 * Custom error class with status code support.
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handling middleware.
 * Catches controller errors and sends a clean JSON response.
 */
const errorHandler = async (err, req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  if (err.name === "CastError" && err.kind === "ObjectId") {
    statusCode = 400;
    message = "Resource not found - invalid ID format";
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue).join(", ");
    statusCode = 409;
    message = `Duplicate value for: ${field}`;
  }

  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(". ");
  }

  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  if (err.code === "LIMIT_FILE_SIZE") {
    statusCode = 413;
    message = "File too large";
  }

  if (err.name === "MulterError" || err.code === "LIMIT_FILE_SIZE" || /file|upload/i.test(message)) {
    notificationService.notifyAdmins({
      io: req.app?.get("io"),
      sender: req.user?._id || null,
      type: notificationService.TYPES.FAILED_UPLOAD,
      title: "Failed Upload",
      message: `${req.user?.email || "Unknown user"} encountered an upload failure: ${message}`,
      entityType: "upload",
      link: "/admin/reports",
      priority: "high",
      dedupeKey: `failed-upload:${req.user?._id || req.ip}:${message}:${Math.floor(Date.now() / 60000)}`,
    }).catch((notifyError) => logger.warn("failed_upload_notification_failed", { error: notifyError }));
  }

  logger.error("request_failed", { statusCode, message, error: err });

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

module.exports = { AppError, errorHandler };
