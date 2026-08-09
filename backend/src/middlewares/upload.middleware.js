const multer = require("multer");

const storage = multer.memoryStorage();

const rejectWithStatus = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
};

const fileFilter = (req, file, cb) => {
  if (file.fieldname === "resume") {
    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(rejectWithStatus("Only PDF and DOCX files are allowed for resumes"), false);
  } else if (file.fieldname === "photo") {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(rejectWithStatus("Only image files are allowed for photos"), false);
  } else if (file.fieldname === "attachment") {
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (file.mimetype.startsWith("image/") || allowed.includes(file.mimetype)) cb(null, true);
    else cb(rejectWithStatus("Only images, PDFs, and DOC/DOCX files are allowed for chat attachments"), false);
  } else {
    cb(null, true);
  }
};

exports.uploadResume = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
}).single("resume");

exports.uploadPhoto = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("photo");

exports.uploadChatAttachment = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
}).single("attachment");
