const { test } = require("node:test");
const assert = require("node:assert/strict");

const { createCloudinaryConfig } = require("../src/config/cloudinary");

test("Cloudinary config exposes only variable names and folder paths", () => {
  const cfg = createCloudinaryConfig(
    { CLOUDINARY_CLOUD_NAME: "demo", CLOUDINARY_API_KEY: "key", CLOUDINARY_API_SECRET: "secret" },
    "production"
  );
  assert.equal(cfg.cloudName, "demo");
  assert.equal(cfg.apiKey, "key");
  assert.equal(cfg.apiSecret, "secret");
  assert.equal(cfg.isConfigured, true);
  assert.equal(cfg.folders.resumes, "opportunityx/resumes");
  assert.equal(cfg.folders.chat, "opportunityx/chat");
});

test("Cloudinary config fails clearly in production when variables are missing", () => {
  assert.throws(() => createCloudinaryConfig({}, "production"), /CLOUDINARY_CLOUD_NAME/);
  assert.throws(
    () =>
      createCloudinaryConfig(
        { CLOUDINARY_CLOUD_NAME: "demo", CLOUDINARY_API_KEY: "key" },
        "production"
      ),
    /CLOUDINARY_API_SECRET/
  );
});

test("Cloudinary config treats placeholder values as unconfigured", () => {
  assert.throws(
    () =>
      createCloudinaryConfig(
        {
          CLOUDINARY_CLOUD_NAME: "replace_with_cloudinary_cloud_name",
          CLOUDINARY_API_KEY: "key",
          CLOUDINARY_API_SECRET: "secret",
        },
        "production"
      ),
    /CLOUDINARY_CLOUD_NAME/
  );
});

test("Cloudinary config does not throw outside production", () => {
  const cfg = createCloudinaryConfig({}, "development");
  assert.equal(cfg.isConfigured, false);
});
