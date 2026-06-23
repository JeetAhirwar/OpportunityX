import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api, { ApiError } from "@/services/api";
import type { Profile } from "@/types";

export const useProfile = () =>
  useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      try {
        const response = await api.get<unknown>("/candidate/profile");
        const root = response && typeof response === "object" ? response as Record<string, unknown> : {};
        return ((root.data && typeof root.data === "object") ? root.data : response) as Profile;
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) return null;
        throw error;
      }
    },
    retry: false,
  });

export const useSaveProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Profile>) => api.put("/candidate/profile", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });
};

export const usePublicProfile = (username: string | undefined) =>
  useQuery({
    queryKey: ["publicProfile", username],
    queryFn: () => api.get<Profile>(`/public/profile/${username}`, { skipAuth: true }),
    enabled: !!username,
  });

