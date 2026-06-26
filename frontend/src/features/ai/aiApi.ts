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

export const askCareerAssistant = (message: string) =>
  api.post<{ success: true; data: { reply: string; suggestedActions?: string[] } }>("/ai/career-assistant", { message }).then(unwrap);

export const analyzeResume = () =>
  api.post<{ success: true; data: ResumeAnalysis }>("/ai/resume-analyze").then(unwrap);

export const getAiJobRecommendations = () =>
  api.get<{ success: true; data: { recommendations: JobRecommendation[] } }>("/ai/job-recommendations").then(unwrap);

export const generateJobDescription = (payload: unknown) =>
  api.post<{ success: true; data: { description: string; responsibilities: string; qualifications: string } }>("/ai/recruiter/job-description", payload).then(unwrap);

export const getApplicationMatchScore = (applicationId: string) =>
  api.get<{ success: true; data: MatchScore }>(`/ai/recruiter/applications/${applicationId}/match-score`).then(unwrap);

export const getAdminAiInsights = () =>
  api.get<{ success: true; data: { topSkills: string[]; hiringTrends: string[]; applicationTrends: string[]; recruiterActivitySummary: string; recommendations: string[] } }>("/ai/admin/insights").then(unwrap);
