import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api, { ApiError } from "@/services/api";
export const useProfile = () => useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
        try {
            const response = await api.get("/candidate/profile");
            const root = response && typeof response === "object" ? response : {};
            return ((root.data && typeof root.data === "object") ? root.data : response);
        }
        catch (error) {
            if (error instanceof ApiError && error.status === 404)
                return null;
            throw error;
        }
    },
    retry: false,
});
export const useSaveProfile = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data) => api.put("/candidate/profile", data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
    });
};
export const usePublicProfile = (username) => useQuery({
    queryKey: ["publicProfile", username],
    queryFn: () => api.get(`/public/profile/${username}`, { skipAuth: true }),
    enabled: !!username,
});
