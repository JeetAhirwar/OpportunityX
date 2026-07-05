import api from "@/services/api";
const asRecord = (value) => value !== null && typeof value === "object" ? value : {};
export const unwrapAdminData = (response) => {
    const root = asRecord(response);
    return root.data !== undefined ? root.data : response;
};
export const getAdminUsers = async () => unwrapAdminData(await api.get("/admin/users"));
export const createAdminUser = async (payload) => {
    const response = unwrapAdminData(await api.post("/admin/users", payload));
    const data = asRecord(response);
    return (data.user ?? response);
};
export const getAdminRecruiters = async () => unwrapAdminData(await api.get("/admin/recruiters"));
export const getAdminJobs = async () => unwrapAdminData(await api.get("/admin/jobs"));
export const getAdminApplications = async () => unwrapAdminData(await api.get("/admin/applications"));
export const getAdminAnalytics = async () => unwrapAdminData(await api.get("/admin/analytics"));
