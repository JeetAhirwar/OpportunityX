import type { UserRole } from "@/store/AuthContext";

export const getDashboardPath = (role?: UserRole) => {
  switch (role) {
    case "candidate":
      return "/candidate/dashboard";
    case "recruiter":
      return "/recruiter/dashboard";
    case "admin":
      return "/admin/dashboard";
    default:
      return "/login";
  }
};
