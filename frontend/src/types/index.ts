// Centralized type definitions for OpportunityX

export interface Certification {
  name: string;
  issuer: string;
  year: string;
  credentialUrl: string;
}

export interface Education {
  school: string;
  degree: string;
  year: string;
}

export interface Experience {
  company: string;
  role: string;
  duration: string;
  description: string;
}

export interface Project {
  name: string;
  url: string;
  description: string;
}

export interface Socials {
  linkedin: string;
  github: string;
  portfolio: string;
}

export interface Profile {
  name: string;
  phone: string;
  location: string;
  title: string;
  bio: string;
  photo: string;
  candidateType: "fresher" | "experienced";
  skills: string[];
  education: Education[];
  experience: Experience[];
  projects: Project[];
  certifications: Certification[];
  socials: Socials;
  username?: string;
  resumeUrl?: string;
  preferredJobTypes?: string[];
  preferredWorkModes?: string[];
  preferredIndustries?: string[];
  expectedSalaryMin?: number;
}

export interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  responsibilities?: string;
  qualifications?: string;
  salary: { min: number; max: number; currency: string };
  skills: string[];
  experienceLevel: "junior" | "mid" | "senior" | "lead";
  jobType: "full-time" | "part-time" | "contract" | "internship";
  workMode: "remote" | "hybrid" | "onsite";
  deadline?: string;
  status: "active" | "closed" | "draft" | "pending";
  postedBy?: { _id?: string; name: string; email?: string };
  applicantCount: number;
  views: number;
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  location: string;
  salary: string;
  status: "Applied" | "Reviewed" | "Shortlisted" | "Interview" | "Offer" | "Rejected" | "Withdrawn";
  appliedDate: string;
  timeline: { step: string; date: string; completed: boolean }[];
  coverLetter?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "candidate" | "recruiter" | "admin";
  avatar?: string;
  createdAt?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
}
