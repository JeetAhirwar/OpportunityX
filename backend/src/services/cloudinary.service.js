const crypto = require("crypto");
const cloudinary = require("cloudinary").v2;
const cloudinaryConfig = require("../config/cloudinary");

if (cloudinaryConfig.isConfigured) {
  cloudinary.config({
    cloud_name: cloudinaryConfig.cloudName,
    api_key: cloudinaryConfig.apiKey,
    api_secret: cloudinaryConfig.apiSecret,
    secure: true,
  });
}

const assertConfigured = () => {
  if (!cloudinaryConfig.isConfigured) {
    throw new Error(
      "File storage is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET."
    );
  }
};

const uploadBuffer = async ({ buffer, mimeType = "application/octet-stream", folder, resourceType = "raw", format }) => {
  assertConfigured();
  const publicId = `${Date.now()}-${crypto.randomUUID()}`;
  const options = {
    folder,
    public_id: publicId,
    resource_type: resourceType,
    overwrite: false,
    unique_filename: false,
    use_filename: false,
  };
  if (format) options.format = format;
  const dataUri = `data:${mimeType};base64,${buffer.toString("base64")}`;
  const result = await cloudinary.uploader.upload(dataUri, options);
  return {
    publicId: result.public_id,
    secureUrl: result.secure_url,
    resourceType: result.resource_type,
    format: result.format || "",
    bytes: result.bytes || 0,
  };
};

const deleteAsset = async ({ publicId, resourceType = "raw" }) => {
  assertConfigured();
  if (!publicId) return { deleted: false, missing: true };
  const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  if (result.result === "not found") return { deleted: false, missing: true };
  return { deleted: result.result === "ok", result: result.result };
};

const safeDeleteAsset = async ({ publicId, resourceType = "raw" }) => {
  if (!publicId) return { deleted: false, missing: true };
  try {
    return await deleteAsset({ publicId, resourceType });
  } catch (error) {
    console.error("Cloudinary asset deletion failed", { publicId, message: error.message });
    return { deleted: false, failed: true };
  }
};

module.exports = {
  assertConfigured,
  deleteAsset,
  safeDeleteAsset,
  uploadBuffer,
};
