import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Brain, Briefcase, FileText, Loader2, UserCheck, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import PageHeader from "@/components/common/PageHeader";
import { AdminAnalytics, getAdminAnalytics } from "@/features/admin/adminApi";
import { getAdminAiInsights } from "@/features/ai/aiApi";

const colors = ["hsl(225, 73%, 57%)", "hsl(262, 83%, 58%)", "hsl(142, 71%, 45%)", "hsl(38, 92%, 50%)", "hsl(0, 72%, 51%)"];

const PlatformAnalytics = () => {
  const [data, setData] = useState<AdminAnalytics | null>(null);
  const [insights, setInsights] = useState<{ topSkills: string[]; hiringTrends: string[]; applicationTrends: string[]; recruiterActivitySummary: string; recommendations: string[] } | null>(null);
  const [insightsError, setInsightsError] = useState("");
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { getAdminAnalytics().then(setData).catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Could not load analytics")); }, []);
  const loadInsights = async () => {
    setInsightsLoading(true);
    setInsightsError("");
    try {
      setInsights(await getAdminAiInsights());
    } catch (requestError) {
      setInsightsError(requestError instanceof Error ? requestError.message : "AI insights are unavailable.");
    } finally {
      setInsightsLoading(false);
    }
  };
  if (!data && !error) return <div className="flex min-h-[300px] items-center justify-center"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading analytics...</div>;
  if (error || !data) return <div className="rounded-xl border border-destructive/30 p-6 text-sm text-destructive">{error}</div>;
  const roleData = data.usersByRole.map((item) => ({ name: item._id, value: item.count }));
  const applicationData = data.applicationsByStatus.map((item) => ({ name: item._id, count: item.count }));
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader title="Platform Analytics" description="Overview of platform performance and growth" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[
        { label: "Total Users", value: data.totalUsers, icon: Users },
        { label: "Total Jobs", value: data.totalJobs, icon: Briefcase },
        { label: "Applications", value: data.totalApplications, icon: FileText },
        { label: "Pending Approvals", value: data.pendingApprovals, icon: UserCheck },
      ].map((stat) => <Card key={stat.label}><CardContent className="p-5"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">{stat.label}</p><p className="text-2xl font-bold">{stat.value}</p></div><stat.icon className="h-5 w-5 text-primary" /></div></CardContent></Card>)}</div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card><CardHeader><CardTitle className="text-lg">Signup Growth</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={280}><LineChart data={data.monthlySignups}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="_id" /><YAxis allowDecimals={false} /><Tooltip /><Line type="monotone" dataKey="count" stroke="hsl(225, 73%, 57%)" strokeWidth={2} /></LineChart></ResponsiveContainer></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-lg">Users by Role</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={280}><PieChart><Pie data={roleData} innerRadius={60} outerRadius={100} dataKey="value" nameKey="name">{roleData.map((_, index) => <Cell key={index} fill={colors[index % colors.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></CardContent></Card>
        <Card className="lg:col-span-2"><CardHeader><CardTitle className="text-lg">Applications by Status</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={250}><BarChart data={applicationData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="count" fill="hsl(262, 83%, 58%)" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Brain className="h-5 w-5 text-primary" /> AI Insights</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {!insights && !insightsError && <button type="button" onClick={() => void loadInsights()} disabled={insightsLoading} className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-secondary">{insightsLoading ? "Generating insights..." : "Generate AI Insights"}</button>}
          {insightsError && <p className="rounded-lg border border-destructive/30 p-3 text-sm text-destructive">{insightsError}</p>}
          {insights && <div className="grid gap-4 md:grid-cols-2">
            <div><p className="font-medium">Top Skills</p><p className="mt-1 text-sm text-muted-foreground">{insights.topSkills?.join(", ") || "No skills found"}</p></div>
            <div><p className="font-medium">Recruiter Activity</p><p className="mt-1 text-sm text-muted-foreground">{insights.recruiterActivitySummary || "No summary returned"}</p></div>
            <div><p className="font-medium">Hiring Trends</p><ul className="mt-1 list-disc pl-5 text-sm text-muted-foreground">{insights.hiringTrends?.map((item) => <li key={item}>{item}</li>)}</ul></div>
            <div><p className="font-medium">Recommendations</p><ul className="mt-1 list-disc pl-5 text-sm text-muted-foreground">{insights.recommendations?.map((item) => <li key={item}>{item}</li>)}</ul></div>
          </div>}
        </CardContent>
      </Card>
    </motion.div>
  );
};
export default PlatformAnalytics;
