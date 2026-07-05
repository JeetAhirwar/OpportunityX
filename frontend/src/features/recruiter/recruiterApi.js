import api from "@/services/api";
const asRecord = (value) => value !== null && typeof value === "object" ? value : {};
const unwrap = (response) => {
    const root = asRecord(response);
    return root.data !== undefined ? root.data : response;
};
export const normalizeRecruiterJobs = (response) => {
    const value = unwrap(response);
    if (Array.isArray(value))
        return value;
    const record = asRecord(value);
    if (Array.isArray(record.jobs))
        return record.jobs;
    return [];
};
export const getRecruiterJobs = async () => normalizeRecruiterJobs(await api.get("/jobs/my"));
export const getRecruiterJob = async (id) => unwrap(await api.get(`/jobs/my/${id}`));
export const getCompanyProfile = async () => unwrap(await api.get("/recruiter/company"));
export const saveCompanyProfile = async (data) => unwrap(await api.put("/recruiter/company", data));
export const submitCompanyVerification = async () => unwrap(await api.post("/recruiter/company/submit-verification"));
