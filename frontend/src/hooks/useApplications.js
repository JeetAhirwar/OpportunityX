import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
const normalizeApplications = (response) => {
    const root = response && typeof response === "object" ? response : {};
    const nested = root.data && typeof root.data === "object" ? root.data : {};
    const applications = (Array.isArray(response) && response) ||
        (Array.isArray(root.applications) && root.applications) ||
        (Array.isArray(root.data) && root.data) ||
        (Array.isArray(nested.applications) && nested.applications) ||
        [];
    const normalized = applications.map((entry, index) => {
        const application = entry && typeof entry === "object" ? entry : {};
        const job = application.job && typeof application.job === "object" ? application.job : {};
        return {
            ...application,
            _id: String(application._id || `application-${index}`),
            status: typeof application.status === "string" ? application.status : "applied",
            appliedAt: typeof application.appliedAt === "string" ? application.appliedAt : undefined,
            job: {
                ...job,
                _id: typeof job._id === "string" ? job._id : "",
                title: typeof job.title === "string" ? job.title : "Job unavailable",
                company: typeof job.company === "string" ? job.company : "Company unavailable",
                location: typeof job.location === "string" ? job.location : "Location unavailable",
            },
        };
    });
    return {
        applications: normalized,
        total: Number(root.total ?? nested.total ?? applications.length) || 0,
        page: Number(root.page ?? nested.page ?? 1) || 1,
        pages: Math.max(Number(root.pages ?? nested.pages ?? 1) || 1, 1),
    };
};
export const useMyApplications = (params = {}, enabled = true) => {
    const query = new URLSearchParams();
    if (params.page)
        query.set("page", String(params.page));
    if (params.limit)
        query.set("limit", String(params.limit));
    return useQuery({
        queryKey: ["myApplications", params],
        queryFn: async () => normalizeApplications(await api.get(`/applications/me?${query.toString()}`)),
        enabled,
    });
};
export const useWithdraw = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (appId) => api.patch(`/applications/${appId}/withdraw`),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["myApplications"] }),
    });
};
