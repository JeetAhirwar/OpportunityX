const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = file.fieldname === "resume"
      ? "uploads/resumes"
      : file.fieldname === "attachment"
        ? "uploads/chat"
        : "uploads/photos";
    const destination = path.join(__dirname, "..", dir);
    fs.mkdirSync(destination, { recursive: true });
    cb(null, destination);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === "resume") {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Only PDF files are allowed for resumes"), false);
  } else if (file.fieldname === "photo") {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed for photos"), false);
  } else if (file.fieldname === "attachment") {
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (file.mimetype.startsWith("image/") || allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only images, PDFs, and DOC/DOCX files are allowed for chat attachments"), false);
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
