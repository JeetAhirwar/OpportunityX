import { Routes, Route, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/store/AuthContext";
import {
  LayoutDashboard, PlusCircle, Briefcase, Users, Building2,
  BarChart3, Settings, LogOut, Menu, X, MessageSquare, Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/common/Navbar";
import PostJob from "@/features/recruiter/PostJob";
import ManageJobs from "@/features/recruiter/ManageJobs";
import ApplicantManagement from "@/features/recruiter/ApplicantManagement";
import CompanyProfile from "@/features/recruiter/CompanyProfile";
import RecruiterAnalytics from "@/features/recruiter/RecruiterAnalytics";
import ChatPage from "@/features/chat/ChatPage";
import NotificationsPage from "@/features/notifications/NotificationsPage";
import SettingsPage from "@/features/settings/SettingsPage";
import { useEffect, useState } from "react";
import api from "@/services/api";
import { normalizeApplicants } from "@/features/recruiter/ApplicantManagement";
import { getCompanyProfile, getRecruiterJobs } from "@/features/recruiter/recruiterApi";
import type { Job } from "@/types";

const sidebarLinks = [
  { label: "Dashboard", href: "/recruiter/dashboard", icon: LayoutDashboard },
  { label: "Post Job", href: "/recruiter/post-job", icon: PlusCircle },
  { label: "Manage Jobs", href: "/recruiter/jobs", icon: Briefcase },
  { label: "Applicants", href: "/recruiter/applicants", icon: Users },
  { label: "Company Profile", href: "/recruiter/company", icon: Building2 },
  { label: "Analytics", href: "/recruiter/analytics", icon: BarChart3 },
  { label: "Messages", href: "/recruiter/chat", icon: MessageSquare },
  { label: "Notifications", href: "/recruiter/notifications", icon: Bell },
  { label: "Settings", href: "/recruiter/settings", icon: Settings },
];

const DashboardHome = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applicants, setApplicants] = useState<ReturnType<typeof normalizeApplicants>>([]);
  const [verification, setVerification] = useState("unverified");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      getRecruiterJobs(),
      api.get<unknown>("/applications/recruiter").then(normalizeApplicants),
      getCompanyProfile(),
    ]).then(([jobData, applicantData, company]) => {
      setJobs(Array.isArray(jobData) ? jobData : []);
      setApplicants(Array.isArray(applicantData) ? applicantData : []);
      setVerification(company?.verificationStatus || "unverified");
    }).catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Could not load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  const activeJobs = jobs.filter((job) => job.status === "active").length;
  const inactiveJobs = jobs.filter((job) => ["draft", "closed"].includes(job.status)).length;
  const newApplicants = applicants.filter((item) => item.status === "applied").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Welcome, {user?.name?.split(" ")[0] || "Recruiter"}!</h1>
        <div className="flex items-center gap-2"><p className="text-muted-foreground">Manage your job postings and applicants</p><Badge variant="outline" className="capitalize">{verification}</Badge></div>
      </div>
      {loading ? <div className="p-6 text-sm text-muted-foreground">Loading dashboard...</div> : error ? <Card><CardContent className="p-6 text-sm text-destructive">{error}</CardContent></Card> : <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Jobs", value: jobs.length, icon: Briefcase },
          { label: "Active Jobs", value: activeJobs, icon: LayoutDashboard },
          { label: "Draft / Closed", value: inactiveJobs, icon: BarChart3 },
          { label: "Applicants", value: applicants.length, icon: Users },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="font-display text-2xl font-bold">{stat.value}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card><CardHeader><CardTitle className="text-lg">Recent Applications</CardTitle></CardHeader><CardContent className="space-y-3">
          {applicants.slice(0, 5).map((item) => <div key={item._id} className="rounded-lg bg-secondary/50 p-3"><p className="text-sm font-medium">{item.candidate?.name || "Candidate unavailable"}</p><p className="text-xs text-muted-foreground">{item.job?.title || "Job unavailable"} - {item.status}</p></div>)}
          {!applicants.length && <p className="text-sm text-muted-foreground">No applicants yet.</p>}
        </CardContent></Card>
        <Card><CardHeader><CardTitle className="text-lg">Recent Jobs</CardTitle></CardHeader><CardContent className="space-y-3">
          {jobs.slice(0, 5).map((job) => <Link key={job._id} to={`/recruiter/jobs/${job._id}/edit`} className="block rounded-lg bg-secondary/50 p-3"><p className="text-sm font-medium">{job.title || "Untitled role"}</p><p className="text-xs text-muted-foreground">{job.status || "draft"} - {job.applicantCount || 0} applicants</p></Link>)}
          {!jobs.length && <p className="text-sm text-muted-foreground">No jobs posted yet.</p>}
        </CardContent></Card>
      </div>
      <p className="text-xs text-muted-foreground">{newApplicants} applications are currently new.</p>
      </>}
    </div>
  );
};

const RecruiterDashboard = () => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="dashboard-shell min-h-screen">
      <Navbar />
      <div className="flex">
        <Button variant="ghost" size="icon" className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full shadow-lg gradient-primary border-0 md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X className="h-5 w-5 text-primary-foreground" /> : <Menu className="h-5 w-5 text-primary-foreground" />}
        </Button>
        <aside className={`fixed inset-y-0 left-0 z-40 w-72 transform border-r border-border/70 bg-sidebar/95 pt-16 shadow-2xl backdrop-blur-2xl transition-transform md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:translate-x-0 md:shadow-none ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <nav className="space-y-1 p-4 overflow-y-auto h-full">
            <div className="mb-4 rounded-lg border border-border/70 bg-secondary/40 p-3">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Recruiter command</p>
              <p className="mt-1 truncate text-sm font-semibold">{user?.name || "Hiring team"}</p>
            </div>
            {sidebarLinks.map((link) => (
              <Link key={link.href} to={link.href} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition-all ${location.pathname === link.href ? "bg-primary/15 text-primary shadow-inner" : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground"}`}>
                <link.icon className="h-4 w-4" /> {link.label}
              </Link>
            ))}
            <button onClick={logout} className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10">
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </nav>
        </aside>
        {sidebarOpen && <div className="fixed inset-0 z-30 bg-background/70 backdrop-blur-sm md:hidden" onClick={() => setSidebarOpen(false)} />}
        <main className="min-w-0 flex-1 p-4 sm:p-6 md:p-8">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Routes>
              <Route path="dashboard" element={<DashboardHome />} />
              <Route path="post-job" element={<PostJob />} />
              <Route path="jobs" element={<ManageJobs />} />
              <Route path="jobs/:id/edit" element={<PostJob />} />
              <Route path="applicants" element={<ApplicantManagement />} />
              <Route path="applicants/:jobId" element={<ApplicantManagement />} />
              <Route path="profile" element={<CompanyProfile />} />
              <Route path="company" element={<CompanyProfile />} />
              <Route path="analytics" element={<RecruiterAnalytics />} />
              <Route path="chat" element={<ChatPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<DashboardHome />} />
            </Routes>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default RecruiterDashboard;

