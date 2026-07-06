import api, { apiUrl } from "@/services/api";

const unwrap = (response) => response?.data ?? response;

export const listInterviews = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && value !== "all") query.set(key, value);
  });
  return api.get(`/interviews${query.toString() ? `?${query.toString()}` : ""}`).then(unwrap);
};

export const getInterviewAnalytics = () => api.get("/interviews/analytics").then(unwrap);
export const createInterview = (payload) => api.post("/interviews", payload).then(unwrap);
export const rescheduleInterview = (id, payload) => api.post(`/interviews/${id}/reschedule`, payload).then(unwrap);
export const cancelInterview = (id, reason) => api.post(`/interviews/${id}/cancel`, { reason }).then(unwrap);
export const duplicateInterview = (id) => api.post(`/interviews/${id}/duplicate`).then(unwrap);
export const respondToInterview = (id, payload) => api.post(`/interviews/${id}/respond`, payload).then(unwrap);
export const submitInterviewFeedback = (id, payload) => api.post(`/interviews/${id}/feedback`, payload).then(unwrap);
export const interviewCalendarUrl = (id) => apiUrl(`/interviews/${id}/calendar.ics`);

export const normalizeInterview = (item = {}) => ({
  _id: item._id,
  title: item.title || "Interview",
  description: item.description || "",
  stage: item.stage || "technical",
  customStage: item.customStage || "",
  mode: item.mode || "google_meet",
  meetingLink: item.meetingLink || "",
  location: item.location || "",
  scheduledAt: item.scheduledAt,
  duration: item.duration || 60,
  timezone: item.timezone || "UTC",
  status: item.status || "scheduled",
  score: item.score || 0,
  recommendation: item.recommendation || "",
  candidate: item.candidate || {},
  recruiter: item.recruiter || {},
  job: item.job || {},
  interviewers: Array.isArray(item.interviewers) ? item.interviewers : [],
  feedback: Array.isArray(item.feedback) ? item.feedback : [],
  timeline: Array.isArray(item.timeline) ? item.timeline : [],
  rescheduleRequests: Array.isArray(item.rescheduleRequests) ? item.rescheduleRequests : [],
});

export const normalizeInterviewPage = (response) => {
  const root = response?.data ?? response ?? {};
  const interviews = Array.isArray(root.interviews) ? root.interviews : Array.isArray(root) ? root : [];
  return {
    interviews: interviews.map(normalizeInterview),
    total: root.total ?? interviews.length,
    page: root.page ?? 1,
    pages: root.pages ?? 1,
  };
};
