import api from "@/services/api";
import type { Job } from "@/types";

export type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";

export interface CompanyProfileData {
  _id?: string;
  companyName: string;
  recruiterName: string;
  officialEmail: string;
  phone: string;
  website: string;
  linkedin: string;
  location: string;
  companySize: string;
  industry: string;
  designation: string;
  description: string;
  registrationNumber: string;
  logo: string;
  verificationStatus: VerificationStatus;
  rejectionReason?: string;
}

const asRecord = (value: unknown): Record<string, unknown> =>
  value !== null && typeof value === "object" ? value as Record<string, unknown> : {};

const unwrap = (response: unknown) => {
  const root = asRecord(response);
  return root.data !== undefined ? root.data : response;
};

export const normalizeRecruiterJobs = (response: unknown): Job[] => {
  const value = unwrap(response);
  if (Array.isArray(value)) return value as Job[];
  const record = asRecord(value);
  if (Array.isArray(record.jobs)) return record.jobs as Job[];
  return [];
};

export const getRecruiterJobs = async () =>
  normalizeRecruiterJobs(await api.get<unknown>("/jobs/my"));

export const getRecruiterJob = async (id: string) =>
  unwrap(await api.get<unknown>(`/jobs/my/${id}`)) as Job;

export const getCompanyProfile = async () =>
  unwrap(await api.get<unknown>("/recruiter/company")) as CompanyProfileData;

export const saveCompanyProfile = async (data: Partial<CompanyProfileData>) =>
  unwrap(await api.put<unknown>("/recruiter/company", data)) as CompanyProfileData;

export const submitCompanyVerification = async () =>
  unwrap(await api.post<unknown>("/recruiter/company/submit-verification")) as CompanyProfileData;
