import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export const useMyApplications = (params: { page?: number; limit?: number } = {}) => {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  return useQuery({
    queryKey: ["myApplications", params],
    queryFn: () => api.get<{ applications: any[]; total: number; page: number; pages: number }>(`/applications/me?${query.toString()}`),
  });
};

export const useWithdraw = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (appId: string) => api.patch(`/applications/${appId}/withdraw`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["myApplications"] }),
  });
};
