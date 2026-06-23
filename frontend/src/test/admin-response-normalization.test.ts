import { describe, expect, it } from "vitest";
import { unwrapAdminData } from "@/features/admin/adminApi";

describe("admin response normalization", () => {
  it("unwraps standard success data", () => {
    expect(unwrapAdminData({ success: true, data: [{ _id: "user-1" }] })).toEqual([{ _id: "user-1" }]);
  });

  it("preserves direct arrays", () => {
    expect(unwrapAdminData([{ _id: "job-1" }])).toEqual([{ _id: "job-1" }]);
  });
});
