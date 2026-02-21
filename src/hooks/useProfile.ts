import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Profile } from "@/types";

export const useProfile = () =>
  useQuery({
    queryKey: ["profile"],
    queryFn: () => api.get<Profile>("/candidate/profile"),
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
