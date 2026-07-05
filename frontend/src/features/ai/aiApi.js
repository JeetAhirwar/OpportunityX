import api from "@/services/api";
const unwrap = (response) => response.data;
const friendlyAiMessage = (message) => {
    const text = message.toLowerCase();
    if (text.includes("quota") || text.includes("rate limit") || text.includes("429")) {
        return "Free AI quota is currently unavailable. Please try again later or switch provider.";
    }
    if (text.includes("api key") || text.includes("openai") || text.includes("gemini") || text.includes("openrouter") || text.includes("groq")) {
        return "AI helper is temporarily unavailable. Please try again later.";
    }
    return message || "AI helper is temporarily unavailable. Please try again later.";
};
const withFriendlyAiError = async (request) => {
    try {
        return await request;
    }
    catch (error) {
        throw new Error(friendlyAiMessage(error instanceof Error ? error.message : ""));
    }
};
export const askCareerAssistant = (message) => withFriendlyAiError(api.post("/ai/career-assistant", { message }).then(unwrap));
export const analyzeResume = () => withFriendlyAiError(api.post("/ai/resume-analyze").then(unwrap));
export const getAiJobRecommendations = () => withFriendlyAiError(api.get("/ai/job-recommendations").then(unwrap));
export const generateJobDescription = (payload) => withFriendlyAiError(api.post("/ai/recruiter/job-description", payload).then(unwrap));
export const getApplicationMatchScore = (applicationId) => withFriendlyAiError(api.get(`/ai/recruiter/applications/${applicationId}/match-score`).then(unwrap));
export const getAdminAiInsights = () => withFriendlyAiError(api.get("/ai/admin/insights").then(unwrap));
