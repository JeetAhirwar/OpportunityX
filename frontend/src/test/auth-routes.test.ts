import { describe, expect, it } from "vitest";
import { getDashboardPath } from "@/utils/authRoutes";

describe("role dashboard routing", () => {
  it("routes each authenticated role to its dashboard", () => {
    expect(getDashboardPath("candidate")).toBe("/candidate/dashboard");
    expect(getDashboardPath("recruiter")).toBe("/recruiter/dashboard");
    expect(getDashboardPath("admin")).toBe("/admin/dashboard");
  });

  it("falls back to login when no valid role is available", () => {
    expect(getDashboardPath()).toBe("/login");
  });
});
