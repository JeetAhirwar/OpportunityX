import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import type { Job } from "@/types";

export interface JobSearchParams {
  page?: number;
  limit?: number;
  keyword?: string;
  location?: string;
  type?: string;
  experience?: string;
  workMode?: string;
  salaryMin?: number;
  salaryMax?: number;
  sort?: string;
}

export interface NormalizedJobsResponse {
  jobs: Job[];
  total: number;
  page: number;
  pages: number;
}

type UnknownRecord = Record<string, unknown>;
const asRecord = (value: unknown): UnknownRecord =>
  value && typeof value === "object" ? value as UnknownRecord : {};

export const normalizeJobsResponse = (response: unknown): NormalizedJobsResponse => {
  const root = asRecord(response);
  const nested = asRecord(root.data);
  const deep = asRecord(nested.data);
  const jobs =
    (Array.isArray(root.jobs) && root.jobs) ||
    (Array.isArray(root.data) && root.data) ||
    (Array.isArray(nested.jobs) && nested.jobs) ||
    (Array.isArray(nested.data) && nested.data) ||
    (Array.isArray(deep.jobs) && deep.jobs) ||
    [];
  const meta = Object.keys(deep).length ? deep : Object.keys(nested).length ? nested : root;
  return {
    jobs: jobs as Job[],
    total: Number(meta.total ?? root.total ?? jobs.length) || 0,
    page: Number(meta.page ?? root.page ?? 1) || 1,
    pages: Math.max(Number(meta.pages ?? root.pages ?? 1) || 1, 1),
  };
};

export const normalizeJobResponse = (response: unknown): Job => {
  const root = asRecord(response);
  const nested = asRecord(root.data);
  const deep = asRecord(nested.data);
  const job = deep._id ? deep : nested._id ? nested : root;
  return job as unknown as Job;
};

export const useJobs = (params: JobSearchParams = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") query.set(key, String(value));
  });

  return useQuery({
    queryKey: ["jobs", params],
    queryFn: async () =>
      normalizeJobsResponse(await api.get<unknown>(`/jobs?${query.toString()}`, { skipAuth: true })),
    placeholderData: (previous) => previous,
  });
};

export const useJob = (id: string | undefined) =>
  useQuery({
    queryKey: ["job", id],
    queryFn: async () => normalizeJobResponse(await api.get<unknown>(`/jobs/${id}`, { skipAuth: true })),
    enabled: Boolean(id),
    retry: false,
  });

export const useApply = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId, coverLetter }: { jobId: string; coverLetter?: string }) =>
      api.post(`/applications/${jobId}/apply`, { coverLetter }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["myApplications"] }),
  });
};

export const useSavedJobs = (enabled = true) =>
  useQuery({
    queryKey: ["savedJobs"],
    queryFn: () => api.get<Job[]>("/saved-jobs"),
    enabled,
  });

export const useToggleSave = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) =>
      api.post<{ saved: boolean; message: string }>(`/saved-jobs/${jobId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["savedJobs"] }),
  });
};
