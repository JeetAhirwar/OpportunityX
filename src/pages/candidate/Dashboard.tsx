import { Routes, Route, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard, User, FileText, Briefcase, Bookmark,
  Bell, Brain, Settings, LogOut, Menu, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/layout/Navbar";
import { useState } from "react";

const sidebarLinks = [
  { label: "Dashboard", href: "/candidate/dashboard", icon: LayoutDashboard },
  { label: "Profile", href: "/candidate/profile", icon: User },
  { label: "Resume", href: "/candidate/resume", icon: FileText },
  { label: "Applied Jobs", href: "/candidate/applied", icon: Briefcase },
  { label: "Saved Jobs", href: "/candidate/saved", icon: Bookmark },
  { label: "Job Alerts", href: "/candidate/alerts", icon: Bell },
  { label: "AI Recommendations", href: "/candidate/recommendations", icon: Brain },
  { label: "Settings", href: "/candidate/settings", icon: Settings },
];

const DashboardHome = () => {
  const { user } = useAuth();
  const appliedJobs = [
    { title: "Senior React Developer", company: "TechCorp", status: "Interview", date: "2 days ago" },
    { title: "Full Stack Engineer", company: "StartupXYZ", status: "Reviewed", date: "5 days ago" },
    { title: "Frontend Lead", company: "ScaleUp", status: "Applied", date: "1 week ago" },
  ];

  const statusColors: Record<string, string> = {
    Applied: "bg-info/10 text-info",
    Reviewed: "bg-warning/10 text-warning",
    Shortlisted: "bg-accent/10 text-accent",
    Interview: "bg-primary/10 text-primary",
    Offer: "bg-success/10 text-success",
    Rejected: "bg-destructive/10 text-destructive",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Welcome back, {user?.name?.split(" ")[0] || "Candidate"}!</h1>
        <p className="text-muted-foreground">Here's an overview of your job search</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Applied Jobs", value: "12", icon: Briefcase, change: "+3 this week" },
          { label: "Saved Jobs", value: "8", icon: Bookmark, change: "+2 this week" },
          { label: "Interviews", value: "3", icon: User, change: "1 upcoming" },
          { label: "Profile Views", value: "156", icon: LayoutDashboard, change: "+24 this week" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="font-display text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-success">{stat.change}</p>
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
            <Progress value={68} className="mb-2" />
            <p className="text-sm text-muted-foreground">68% complete — Add your skills and experience to stand out</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="font-display text-lg">Recent Applications</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {appliedJobs.map((job) => (
              <div key={job.title} className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
                <div>
                  <p className="text-sm font-medium">{job.title}</p>
                  <p className="text-xs text-muted-foreground">{job.company} • {job.date}</p>
                </div>
                <Badge className={statusColors[job.status]}>{job.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex min-h-[400px] items-center justify-center">
    <div className="text-center">
      <h2 className="font-display text-xl font-bold">{title}</h2>
      <p className="text-muted-foreground">This section is coming soon</p>
    </div>
  </div>
);

const CandidateDashboard = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        {/* Mobile sidebar toggle */}
        <Button variant="ghost" size="icon" className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full shadow-lg gradient-primary border-0 md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X className="h-5 w-5 text-primary-foreground" /> : <Menu className="h-5 w-5 text-primary-foreground" />}
        </Button>

        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-border bg-card pt-16 transition-transform md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <nav className="space-y-1 p-4">
            {sidebarLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  location.pathname === link.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                <link.icon className="h-4 w-4" /> {link.label}
              </Link>
            ))}
            <button onClick={logout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors">
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </nav>
        </aside>

        {/* Overlay */}
        {sidebarOpen && <div className="fixed inset-0 z-30 bg-background/50 md:hidden" onClick={() => setSidebarOpen(false)} />}

        {/* Main */}
        <main className="flex-1 p-6 md:p-8">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Routes>
              <Route path="dashboard" element={<DashboardHome />} />
              <Route path="profile" element={<PlaceholderPage title="Profile Builder" />} />
              <Route path="resume" element={<PlaceholderPage title="Resume Upload" />} />
              <Route path="applied" element={<PlaceholderPage title="Applied Jobs" />} />
              <Route path="saved" element={<PlaceholderPage title="Saved Jobs" />} />
              <Route path="alerts" element={<PlaceholderPage title="Job Alerts" />} />
              <Route path="recommendations" element={<PlaceholderPage title="AI Recommendations" />} />
              <Route path="settings" element={<PlaceholderPage title="Settings" />} />
              <Route path="*" element={<DashboardHome />} />
            </Routes>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default CandidateDashboard;
