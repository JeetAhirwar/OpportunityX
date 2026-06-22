import { describe, expect, it } from "vitest";
import { normalizeJobResponse, normalizeJobsResponse } from "@/hooks/useJobs";

const job = {
  _id: "507f1f77bcf86cd799439011",
  title: "Frontend Engineer",
  company: "OpportunityX",
};

describe("job API response normalization", () => {
  it.each([
    { data: [job], total: 1, page: 1, pages: 1 },
    { jobs: [job], total: 1, page: 1, pages: 1 },
    { data: { data: [job], total: 1, page: 1, pages: 1 } },
    { data: { jobs: [job], total: 1, page: 1, pages: 1 } },
  ])("normalizes supported list response shapes", (response) => {
    expect(normalizeJobsResponse(response)).toMatchObject({
      jobs: [job],
      total: 1,
      page: 1,
      pages: 1,
    });
  });

  it("normalizes a wrapped job detail response", () => {
    expect(normalizeJobResponse({ success: true, data: job })).toEqual(job);
  });
});
