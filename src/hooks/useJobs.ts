import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

interface JobSearchParams {
  page?: number;
  limit?: number;
  keyword?: string;
  location?: string;
  type?: string;
  experience?: string;
  salaryMin?: number;
  salaryMax?: number;
  sort?: string;
}

export const useJobs = (params: JobSearchParams = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") query.set(k, String(v));
  });

  return useQuery({
    queryKey: ["jobs", params],
    queryFn: () => api.get<{ jobs: any[]; total: number; page: number; pages: number }>(`/jobs?${query.toString()}`, { skipAuth: true }),
    placeholderData: (prev) => prev,
  });
};

export const useJob = (id: string | undefined) =>
  useQuery({
    queryKey: ["job", id],
    queryFn: () => api.get<any>(`/public/jobs/${id}`, { skipAuth: true }),
    enabled: !!id,
  });

export const useApply = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId, coverLetter }: { jobId: string; coverLetter?: string }) =>
      api.post(`/applications/${jobId}/apply`, { coverLetter }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["myApplications"] }),
  });
};

export const useSavedJobs = () =>
  useQuery({
    queryKey: ["savedJobs"],
    queryFn: () => api.get<any[]>("/saved-jobs"),
  });

export const useToggleSave = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) => api.post(`/saved-jobs/${jobId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["savedJobs"] }),
  });
};
