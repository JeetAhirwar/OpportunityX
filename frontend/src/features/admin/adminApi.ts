import api from "@/services/api";
import type { Job } from "@/types";

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: "candidate" | "recruiter" | "admin";
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
}

export interface AdminCompany {
  _id: string;
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
  verificationStatus: "unverified" | "pending" | "verified" | "rejected";
  submittedAt?: string;
  rejectionReason?: string;
  recruiter?: AdminUser;
}

export interface AdminApplication {
  _id: string;
  status: string;
  appliedAt?: string;
  candidate?: { _id?: string; name?: string; email?: string } | null;
  job?: (Pick<Job, "_id" | "title" | "company" | "status"> & {
    postedBy?: { name?: string; email?: string } | null;
  }) | null;
}

export interface AdminAnalytics {
  totalUsers: number;
  totalCandidates: number;
  totalRecruiters: number;
  pendingApprovals: number;
  totalJobs: number;
  activeJobs: number;
  pendingJobs: number;
  totalApplications: number;
  usersByRole: { _id: string; count: number }[];
  jobsByStatus: { _id: string; count: number }[];
  applicationsByStatus: { _id: string; count: number }[];
  approvalsByStatus: { _id: string; count: number }[];
  monthlySignups: { _id: string; count: number }[];
  recentUsers: AdminUser[];
  recentJobs: Job[];
  recentApplications: AdminApplication[];
}

const asRecord = (value: unknown): Record<string, unknown> =>
  value !== null && typeof value === "object" ? value as Record<string, unknown> : {};
export const unwrapAdminData = (response: unknown) => {
  const root = asRecord(response);
  return root.data !== undefined ? root.data : response;
};

export const getAdminUsers = async () => unwrapAdminData(await api.get<unknown>("/admin/users")) as AdminUser[];
export const getAdminRecruiters = async () => unwrapAdminData(await api.get<unknown>("/admin/recruiters")) as AdminCompany[];
export const getAdminJobs = async () => unwrapAdminData(await api.get<unknown>("/admin/jobs")) as Job[];
export const getAdminApplications = async () => unwrapAdminData(await api.get<unknown>("/admin/applications")) as AdminApplication[];
export const getAdminAnalytics = async () => unwrapAdminData(await api.get<unknown>("/admin/analytics")) as AdminAnalytics;
