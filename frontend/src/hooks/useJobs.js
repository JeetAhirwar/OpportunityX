import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
const asRecord = (value) => value && typeof value === "object" ? value : {};
export const normalizeJobsResponse = (response) => {
    const root = asRecord(response);
    const nested = asRecord(root.data);
    const deep = asRecord(nested.data);
    const jobs = (Array.isArray(root.jobs) && root.jobs) ||
        (Array.isArray(root.data) && root.data) ||
        (Array.isArray(nested.jobs) && nested.jobs) ||
        (Array.isArray(nested.data) && nested.data) ||
        (Array.isArray(deep.jobs) && deep.jobs) ||
        [];
    const meta = Object.keys(deep).length ? deep : Object.keys(nested).length ? nested : root;
    return {
        jobs: jobs,
        total: Number(meta.total ?? root.total ?? jobs.length) || 0,
        page: Number(meta.page ?? root.page ?? 1) || 1,
        pages: Math.max(Number(meta.pages ?? root.pages ?? 1) || 1, 1),
    };
};
export const normalizeJobResponse = (response) => {
    const root = asRecord(response);
    const nested = asRecord(root.data);
    const deep = asRecord(nested.data);
    const job = deep._id ? deep : nested._id ? nested : root;
    return job;
};
export const useJobs = (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== "")
            query.set(key, String(value));
    });
    return useQuery({
        queryKey: ["jobs", params],
        queryFn: async () => normalizeJobsResponse(await api.get(`/jobs?${query.toString()}`, { skipAuth: true })),
        placeholderData: (previous) => previous,
    });
};
export const useJob = (id) => useQuery({
    queryKey: ["job", id],
    queryFn: async () => normalizeJobResponse(await api.get(`/jobs/${id}`, { skipAuth: true })),
    enabled: Boolean(id),
    retry: false,
});
export const useApply = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ jobId, coverLetter }) => api.post(`/applications/${jobId}/apply`, { coverLetter }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["myApplications"] }),
    });
};
export const useSavedJobs = (enabled = true) => useQuery({
    queryKey: ["savedJobs"],
    queryFn: async () => {
        const response = await api.get("/saved-jobs");
        const root = asRecord(response);
        if (Array.isArray(response))
            return response;
        if (Array.isArray(root.data))
            return root.data;
        if (Array.isArray(root.jobs))
            return root.jobs;
        return [];
    },
    enabled,
});
export const useToggleSave = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (jobId) => api.post(`/saved-jobs/${jobId}`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["savedJobs"] }),
    });
};
