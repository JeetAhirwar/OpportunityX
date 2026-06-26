import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/store/AuthContext";
import
  {
    LayoutDashboard, User, FileText, Briefcase, Bookmark,
    Bell, Brain, Settings, LogOut, Menu, X, MessageSquare, Loader2,
  } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/common/Navbar";
import ProfileBuilder from "@/features/candidate/ProfileBuilder";
import ResumeUpload from "@/features/candidate/ResumeUpload";
import SavedJobs from "@/features/candidate/SavedJobs";
import MyApplications from "@/features/candidate/MyApplications";
import JobRecommendations from "@/features/candidate/JobRecommendations";
import CandidateAIAssistant from "@/features/ai/CandidateAIAssistant";
import JobAlerts from "@/features/candidate/JobAlerts";
import ChatPage from "@/features/chat/ChatPage";
import NotificationsPage from "@/features/notifications/NotificationsPage";
import SettingsPage from "@/features/settings/SettingsPage";
import { useState, useEffect } from "react";
import OnboardingModal from "@/features/onboarding/OnboardingModal";
import { useMyApplications } from "@/hooks/useApplications";
import { useSavedJobs } from "@/hooks/useJobs";
import { useProfile } from "@/hooks/useProfile";
import { formatDistanceToNow } from "date-fns";

const sidebarLinks = [
  { label: "Dashboard", href: "/candidate/dashboard", icon: LayoutDashboard },
  { label: "Profile", href: "/candidate/profile", icon: User },
  { label: "Resume", href: "/candidate/resume", icon: FileText },
  { label: "Applied Jobs", href: "/candidate/applied", icon: Briefcase },
  { label: "Saved Jobs", href: "/candidate/saved", icon: Bookmark },
  { label: "Job Alerts", href: "/candidate/alerts", icon: Bell },
  { label: "AI Recommendations", href: "/candidate/recommendations", icon: Brain },
  { label: "AI Assistant", href: "/candidate/ai-assistant", icon: Brain },
  { label: "Messages", href: "/candidate/chat", icon: MessageSquare },
  { label: "Notifications", href: "/candidate/notifications", icon: Bell },
  { label: "Settings", href: "/candidate/settings", icon: Settings },
];

const DashboardHome = () => {
  const { user } = useAuth();
  const statusColors: Record<string, string> = {
    applied: "bg-info/10 text-info", reviewed: "bg-warning/10 text-warning",
    shortlisted: "bg-accent/10 text-accent", interview: "bg-primary/10 text-primary",
    offer: "bg-success/10 text-success", rejected: "bg-destructive/10 text-destructive",
    withdrawn: "bg-muted text-muted-foreground",
  };
  const applicationsQuery = useMyApplications({ limit: 100 });
  const savedQuery = useSavedJobs();
  const profileQuery = useProfile();
  const applications = applicationsQuery.data?.applications || [];
  const savedJobs = savedQuery.data || [];
  const profile = profileQuery.data;
  const interviews = applications.filter((item) => item.status === "interview").length;
  const profileFields = profile ? [
    profile.name, profile.phone, profile.location, profile.title, profile.bio,
    profile.resumeUrl, profile.skills?.length, profile.education?.length,
    profile.candidateType === "fresher" || profile.experience?.length,
    profile.socials?.linkedin || profile.socials?.github || profile.socials?.portfolio,
  ] : [];
  const completeness = profile ? Math.round((profileFields.filter(Boolean).length / profileFields.length) * 100) : 0;
  const recentApplications = applications.slice(0, 3);
  const loading = applicationsQuery.isLoading || savedQuery.isLoading || profileQuery.isLoading;
  const hasError = applicationsQuery.isError || savedQuery.isError || profileQuery.isError;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Welcome back, {user?.name?.split(" ")[0] || "Candidate"}!</h1>
        <p className="text-muted-foreground">Here's an overview of your job search</p>
      </div>
      {loading ? (
        <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-border"><Loader2 className="mr-2 h-5 w-5 animate-spin text-primary" /> Loading your dashboard...</div>
      ) : hasError ? (
        <Card><CardContent className="p-6 text-sm text-destructive">Some dashboard data could not be loaded. Refresh the page to try again.</CardContent></Card>
      ) : (
      <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Applied Jobs", value: applicationsQuery.data?.total || 0, icon: Briefcase, change: "Total applications" },
          { label: "Saved Jobs", value: savedJobs.length, icon: Bookmark, change: "Bookmarked jobs" },
          { label: "Interviews", value: interviews, icon: User, change: "Current interviews" },
          { label: "Profile Complete", value: `${completeness}%`, icon: LayoutDashboard, change: completeness === 100 ? "Profile complete" : "Keep improving" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="font-display text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.change}</p>
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
        <Card>
          <CardHeader><CardTitle className="font-display text-lg">Profile Completeness</CardTitle></CardHeader>
          <CardContent>
            <Progress value={completeness} className="mb-2" />
            <p className="text-sm text-muted-foreground">{completeness}% complete - {completeness < 100 ? "Add missing profile details to stand out" : "Your profile is ready"}</p>
            {completeness < 100 && <Button variant="link" className="mt-2 h-auto p-0" asChild><Link to="/candidate/profile">Complete profile</Link></Button>}
            {completeness === 100 && applications.length === 0 && <Button variant="link" className="mt-2 h-auto p-0" asChild><Link to="/jobs">Browse jobs and submit your first application</Link></Button>}
            {completeness === 100 && applications.length > 0 && savedJobs.length === 0 && <Button variant="link" className="mt-2 h-auto p-0" asChild><Link to="/jobs">Explore and save matching jobs</Link></Button>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="font-display text-lg">Recent Applications</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {recentApplications.length === 0 ? (
              <p className="text-sm text-muted-foreground">No applications yet. Browse jobs to get started.</p>
            ) : recentApplications.map((application) => (
              <div key={application._id} className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
                <div>
                  <p className="text-sm font-medium">{application.job?.title || "Job unavailable"}</p>
                  <p className="text-xs text-muted-foreground">{application.job?.company || "Company unavailable"} - {application.appliedAt ? formatDistanceToNow(new Date(application.appliedAt), { addSuffix: true }) : "Date unavailable"}</p>
                </div>
                <Badge className={statusColors[application.status] || "bg-muted text-muted-foreground"}>{application.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      </>
      )}
    </div>
  );
};

const CandidateDashboard = () =>
{
  const { logout, user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() =>
  {
    const completed = localStorage.getItem("ox_onboarding_complete");
    const profileCompleted = localStorage.getItem("ox_profile_complete");

    if (!completed)
    {
      setShowOnboarding(true);
    } else if (!profileCompleted)
    {
      setShowProfilePopup(true);
    }
  }, []);

  return (
    <>
      <OnboardingModal
        open={showOnboarding}
        onComplete={() => {
          localStorage.setItem("ox_onboarding_complete", "true");
          setShowOnboarding(false);

          const profileCompleted = localStorage.getItem("ox_profile_complete");
          if (!profileCompleted) {
            setShowProfilePopup(true);
          }
        }}
      />
      {showProfilePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card p-6 rounded-xl shadow-xl w-full max-w-md">
            <h2 className="text-lg font-semibold mb-2">
              Your profile is not completed
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Click below to complete your profile and unlock full features.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                onClick={() =>
                {
                  setShowProfilePopup(false);
                  navigate("/candidate/profile");
                }}
              >
                Complete Profile
              </Button>
            </div>
          </div>
        </div>
      )}
      <div className="dashboard-shell min-h-screen">
        <Navbar />
        <div className="flex">
          <Button variant="ghost" size="icon" className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full shadow-lg gradient-primary border-0 md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="h-5 w-5 text-primary-foreground" /> : <Menu className="h-5 w-5 text-primary-foreground" />}
          </Button>
          <aside className={`fixed inset-y-0 left-0 z-40 w-72 transform border-r border-border/70 bg-sidebar/95 pt-16 shadow-2xl backdrop-blur-2xl transition-transform md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:translate-x-0 md:shadow-none ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
            <nav className="space-y-1 p-4 overflow-y-auto h-full">
              <div className="mb-4 rounded-lg border border-border/70 bg-secondary/40 p-3">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Candidate workspace</p>
                <p className="mt-1 truncate text-sm font-semibold">{user?.name || "OpportunityX user"}</p>
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
                <Route path="profile" element={<ProfileBuilder />} />
                <Route path="resume" element={<ResumeUpload />} />
                <Route path="applied" element={<MyApplications />} />
                <Route path="saved" element={<SavedJobs />} />
                <Route path="alerts" element={<JobAlerts />} />
                <Route path="recommendations" element={<JobRecommendations />} />
                <Route path="ai-assistant" element={<CandidateAIAssistant />} />
                <Route path="chat" element={<ChatPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="*" element={<DashboardHome />} />
              </Routes>
            </motion.div>
          </main>
        </div>
      </div>
    </>
  );
};

export default CandidateDashboard;

