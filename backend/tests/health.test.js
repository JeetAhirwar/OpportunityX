const test = require("node:test");
const assert = require("node:assert/strict");

process.env.MONGODB_URI ||= "mongodb://127.0.0.1:27017/opportunityx-test";
process.env.JWT_SECRET ||= "test-only-secret";
process.env.CORS_ORIGIN ||= "http://localhost:8080";

const app = require("../src/app");

test("GET /api/health reports a healthy API", async () => {
  const server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));

  try {
    const { port } = server.address();
    const response = await fetch(`http://127.0.0.1:${port}/api/health`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      success: true,
      status: "healthy",
      service: "opportunityx-api",
    });
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
