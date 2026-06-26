import { Routes, Route, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/store/AuthContext";
import {
  LayoutDashboard, Users, Briefcase, BarChart3, FileText,
  Settings, LogOut, Menu, X, UserCheck, Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/common/Navbar";
import UserManagement from "@/features/admin/UserManagement";
import RecruiterApproval from "@/features/admin/RecruiterApproval";
import JobModeration from "@/features/admin/JobModeration";
import PlatformAnalytics from "@/features/admin/PlatformAnalytics";
import SettingsPage from "@/features/settings/SettingsPage";
import NotificationsPage from "@/features/notifications/NotificationsPage";
import AdminApplications from "@/features/admin/AdminApplications";
import AdminReports from "@/features/admin/AdminReports";
import { useEffect, useState } from "react";
import { AdminAnalytics, getAdminAnalytics } from "@/features/admin/adminApi";

const sidebarLinks = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Recruiter Approval", href: "/admin/approvals", icon: UserCheck },
  { label: "Job Moderation", href: "/admin/jobs", icon: Briefcase },
  { label: "Applications", href: "/admin/applications", icon: FileText },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Reports", href: "/admin/reports", icon: FileText },
  { label: "Notifications", href: "/admin/notifications", icon: Bell },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

const DashboardHome = () => {
  const [data, setData] = useState<AdminAnalytics | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { getAdminAnalytics().then(setData).catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Could not load dashboard")); }, []);
  const recentUsers = data?.recentUsers || [];
  const recentJobs = data?.recentJobs || [];
  const recentApplications = data?.recentApplications || [];
  return (
  <div className="space-y-6">
    <div>
      <h1 className="font-display text-2xl font-bold">Admin Dashboard</h1>
      <p className="text-muted-foreground">Platform overview and management</p>
    </div>
    {!data && !error ? <div className="p-6 text-sm text-muted-foreground">Loading dashboard...</div> : error ? <Card><CardContent className="p-6 text-sm text-destructive">{error}</CardContent></Card> : data && <>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[
        { label: "Total Users", value: data.totalUsers, icon: Users },
        { label: "Active Jobs", value: data.activeJobs, icon: Briefcase },
        { label: "Applications", value: data.totalApplications, icon: FileText },
        { label: "Pending Approvals", value: data.pendingApprovals, icon: UserCheck },
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
    <div className="grid gap-6 lg:grid-cols-3">
      <Card><CardContent className="space-y-3 p-5"><h2 className="font-semibold">Recent Users</h2>{recentUsers.map((item) => <div key={item._id} className="rounded-lg bg-secondary/50 p-3"><p className="text-sm font-medium">{item.name || "Unnamed user"}</p><p className="text-xs text-muted-foreground">{item.role || "role unknown"} - {item.email || "email unavailable"}</p></div>)}{!recentUsers.length && <p className="text-sm text-muted-foreground">No recent users.</p>}</CardContent></Card>
      <Card><CardContent className="space-y-3 p-5"><h2 className="font-semibold">Recent Jobs</h2>{recentJobs.map((item) => <div key={item._id} className="rounded-lg bg-secondary/50 p-3"><p className="text-sm font-medium">{item.title || "Untitled role"}</p><p className="text-xs text-muted-foreground">{item.company || "Company unavailable"} - {item.status || "status unknown"}</p></div>)}{!recentJobs.length && <p className="text-sm text-muted-foreground">No recent jobs.</p>}</CardContent></Card>
      <Card><CardContent className="space-y-3 p-5"><h2 className="font-semibold">Recent Applications</h2>{recentApplications.map((item) => <div key={item._id} className="rounded-lg bg-secondary/50 p-3"><p className="text-sm font-medium">{item.candidate?.name || "Candidate unavailable"}</p><p className="text-xs text-muted-foreground">{item.job?.title || "Job unavailable"} - {item.status || "status unknown"}</p></div>)}{!recentApplications.length && <p className="text-sm text-muted-foreground">No recent applications.</p>}</CardContent></Card>
    </div>
    </>}
  </div>
  );
};

const AdminDashboard = () => {
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
              <p className="text-xs font-semibold uppercase text-muted-foreground">Admin control plane</p>
              <p className="mt-1 truncate text-sm font-semibold">{user?.name || "Platform admin"}</p>
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
              <Route path="users" element={<UserManagement />} />
              <Route path="approvals" element={<RecruiterApproval />} />
              <Route path="jobs" element={<JobModeration />} />
              <Route path="applications" element={<AdminApplications />} />
              <Route path="analytics" element={<PlatformAnalytics />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="profile" element={<SettingsPage />} />
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

export default AdminDashboard;

