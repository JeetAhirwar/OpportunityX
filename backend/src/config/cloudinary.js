const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const PLACEHOLDER_RE = /^replace_/i;

const createCloudinaryConfig = (env = process.env, nodeEnv = env.NODE_ENV || "development") => {
  const cloudName = env.CLOUDINARY_CLOUD_NAME || "";
  const apiKey = env.CLOUDINARY_API_KEY || "";
  const apiSecret = env.CLOUDINARY_API_SECRET || "";
  const missing = [cloudName, apiKey, apiSecret].some((value) => !value || PLACEHOLDER_RE.test(value));

  if (nodeEnv === "production" && missing) {
    throw new Error(
      "Missing required environment variables: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET must be configured in the production environment."
    );
  }

  return Object.freeze({
    cloudName,
    apiKey,
    apiSecret,
    isConfigured: !missing,
    folders: Object.freeze({
      resumes: "opportunityx/resumes",
      chat: "opportunityx/chat",
    }),
  });
};

module.exports = {
  ...createCloudinaryConfig(),
  createCloudinaryConfig,
};
