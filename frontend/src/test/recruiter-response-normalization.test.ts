import { describe, expect, it } from "vitest";
import { normalizeRecruiterJobs } from "@/features/recruiter/recruiterApi";
import { normalizeApplicants } from "@/features/recruiter/ApplicantManagement";

describe("recruiter response normalization", () => {
  it("accepts nested recruiter jobs", () => {
    expect(normalizeRecruiterJobs({ success: true, data: [{ _id: "job-1" }] })).toHaveLength(1);
  });

  it("fills missing applicant relations safely", () => {
    const [applicant] = normalizeApplicants({ data: [{ _id: "app-1", candidate: null, job: null }] });
    expect(applicant.candidate.name).toBe("Unknown candidate");
    expect(applicant.job.title).toBe("Job unavailable");
  });
});
