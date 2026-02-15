import { Routes, Route, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard, PlusCircle, Briefcase, Users, Building2,
  BarChart3, Settings, LogOut, Menu, X, MessageSquare, Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/layout/Navbar";
import PostJob from "@/features/jobs/PostJob";
import ManageJobs from "@/features/jobs/ManageJobs";
import ApplicantManagement from "@/features/applications/ApplicantManagement";
import CompanyProfile from "@/features/profile/CompanyProfile";
import RecruiterAnalytics from "@/features/analytics/RecruiterAnalytics";
import ChatPage from "@/features/chat/ChatPage";
import NotificationsPage from "@/features/notifications/NotificationsPage";
import SettingsPage from "@/features/settings/SettingsPage";
import { useState } from "react";

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
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Welcome, {user?.name?.split(" ")[0] || "Recruiter"}!</h1>
        <p className="text-muted-foreground">Manage your job postings and applicants</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Active Jobs", value: "8", icon: Briefcase },
          { label: "Total Applicants", value: "234", icon: Users },
          { label: "Interviews", value: "12", icon: LayoutDashboard },
          { label: "This Month Views", value: "3.2K", icon: BarChart3 },
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
    </div>
  );
};

const RecruiterDashboard = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Button variant="ghost" size="icon" className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full shadow-lg gradient-primary border-0 md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X className="h-5 w-5 text-primary-foreground" /> : <Menu className="h-5 w-5 text-primary-foreground" />}
        </Button>
        <aside className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-border bg-card pt-16 transition-transform md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <nav className="space-y-1 p-4 overflow-y-auto h-full">
            {sidebarLinks.map((link) => (
              <Link key={link.href} to={link.href} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${location.pathname === link.href ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary"}`}>
                <link.icon className="h-4 w-4" /> {link.label}
              </Link>
            ))}
            <button onClick={logout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors">
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </nav>
        </aside>
        {sidebarOpen && <div className="fixed inset-0 z-30 bg-background/50 md:hidden" onClick={() => setSidebarOpen(false)} />}
        <main className="flex-1 p-6 md:p-8">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Routes>
              <Route path="dashboard" element={<DashboardHome />} />
              <Route path="post-job" element={<PostJob />} />
              <Route path="jobs" element={<ManageJobs />} />
              <Route path="applicants" element={<ApplicantManagement />} />
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
