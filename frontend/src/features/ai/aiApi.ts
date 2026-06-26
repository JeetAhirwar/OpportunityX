import api from "@/services/api";
import type { Job } from "@/types";

export interface ResumeAnalysis {
  resumeScore: number;
  strengths: string[];
  weaknesses: string[];
  missingSkills: string[];
  atsSuggestions: string[];
  improvedSummary: string;
  projectSuggestions: string[];
  limitations?: string[];
}

export interface JobRecommendation {
  job: Job;
  matchScore: number;
  reason: string;
  missingSkills: string[];
}

export interface MatchScore {
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  explanation: string;
  riskFlags: string[];
  advisory?: boolean;
}

const unwrap = <T>(response: { data: T }) => response.data;
const friendlyAiMessage = (message: string) => {
  const text = message.toLowerCase();
  if (text.includes("quota") || text.includes("rate limit") || text.includes("429")) {
    return "Free AI quota is currently unavailable. Please try again later or switch provider.";
  }
  if (text.includes("api key") || text.includes("openai") || text.includes("gemini") || text.includes("openrouter") || text.includes("groq")) {
    return "AI helper is temporarily unavailable. Please try again later.";
  }
  return message || "AI helper is temporarily unavailable. Please try again later.";
};

const withFriendlyAiError = async <T>(request: Promise<T>) => {
  try {
    return await request;
  } catch (error) {
    throw new Error(friendlyAiMessage(error instanceof Error ? error.message : ""));
  }
};

export const askCareerAssistant = (message: string) =>
  withFriendlyAiError(api.post<{ success: true; data: { reply: string; suggestedActions?: string[] } }>("/ai/career-assistant", { message }).then(unwrap));

export const analyzeResume = () =>
  withFriendlyAiError(api.post<{ success: true; data: ResumeAnalysis }>("/ai/resume-analyze").then(unwrap));

export const getAiJobRecommendations = () =>
  withFriendlyAiError(api.get<{ success: true; data: { recommendations: JobRecommendation[] } }>("/ai/job-recommendations").then(unwrap));

export const generateJobDescription = (payload: unknown) =>
  withFriendlyAiError(api.post<{ success: true; data: { description: string; responsibilities: string; qualifications: string } }>("/ai/recruiter/job-description", payload).then(unwrap));

export const getApplicationMatchScore = (applicationId: string) =>
  withFriendlyAiError(api.get<{ success: true; data: MatchScore }>(`/ai/recruiter/applications/${applicationId}/match-score`).then(unwrap));

export const getAdminAiInsights = () =>
  withFriendlyAiError(api.get<{ success: true; data: { topSkills: string[]; hiringTrends: string[]; applicationTrends: string[]; recruiterActivitySummary: string; recommendations: string[] } }>("/ai/admin/insights").then(unwrap));
