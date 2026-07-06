import api from "@/services/api";

export const organizationApi = {
    list: () => api.get("/organizations"),
    create: (payload) => api.post("/organizations", payload),
    update: (organizationId, payload) => api.put(`/organizations/${organizationId}`, payload),
    invite: (organizationId, payload) => api.post(`/organizations/${organizationId}/invitations`, payload),
    updateBranding: (organizationId, payload) => api.patch(`/organizations/${organizationId}/branding`, payload),
    updateSettings: (organizationId, payload) => api.patch(`/organizations/${organizationId}/settings`, payload),
};

export default organizationApi;
