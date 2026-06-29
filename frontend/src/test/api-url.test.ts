import { describe, expect, it } from "vitest";
import { createApiUrl } from "@/services/api";

describe("API URL construction", () => {
  const productionBaseUrl = "https://opportunityx-6klo.onrender.com/api";

  it("keeps /api in the configured base URL for production auth requests", () => {
    expect(createApiUrl(productionBaseUrl, "/auth/me")).toBe(
      "https://opportunityx-6klo.onrender.com/api/auth/me"
    );
  });

  it("keeps /api in the configured base URL for production jobs requests", () => {
    expect(createApiUrl(productionBaseUrl, "/jobs/featured")).toBe(
      "https://opportunityx-6klo.onrender.com/api/jobs/featured"
    );
  });

  it("does not create duplicate /api segments for route-only endpoints", () => {
    expect(createApiUrl(productionBaseUrl, "/jobs")).not.toContain("/api/api/");
  });

  it("uses the same convention for localhost", () => {
    expect(createApiUrl("http://localhost:8000/api", "/auth/login")).toBe(
      "http://localhost:8000/api/auth/login"
    );
  });
});
