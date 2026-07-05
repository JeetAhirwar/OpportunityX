const logger = require("../utils/logger");

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
const errorHandler = (err, _req, res, _next) => {
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

  logger.error("request_failed", { statusCode, message, error: err });

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

module.exports = { AppError, errorHandler };
