import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Briefcase, Eye, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import PageHeader from "@/components/common/PageHeader";
import api from "@/services/api";
import { normalizeApplicants } from "@/features/recruiter/ApplicantManagement";
import { getRecruiterJobs } from "@/features/recruiter/recruiterApi";
import type { Job } from "@/types";

const RecruiterAnalytics = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applicants, setApplicants] = useState<ReturnType<typeof normalizeApplicants>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      getRecruiterJobs(),
      api.get<unknown>("/applications/recruiter").then(normalizeApplicants),
    ]).then(([jobData, applicantData]) => {
      setJobs(jobData);
      setApplicants(applicantData);
    }).catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Could not load analytics"))
      .finally(() => setLoading(false));
  }, []);

  const byJob = useMemo(() => jobs.map((job) => ({
    name: job.title.length > 18 ? `${job.title.slice(0, 18)}…` : job.title,
    applications: applicants.filter((item) => item.job._id === job._id).length,
    views: job.views || 0,
  })), [applicants, jobs]);
  const byStatus = useMemo(() => Object.entries(applicants.reduce<Record<string, number>>((counts, item) => {
    counts[item.status] = (counts[item.status] || 0) + 1;
    return counts;
  }, {})).map(([name, count]) => ({ name, count })), [applicants]);
  const totalViews = jobs.reduce((sum, job) => sum + (job.views || 0), 0);
  const activeJobs = jobs.filter((job) => job.status === "active").length;
  const closedJobs = jobs.filter((job) => job.status === "closed").length;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader title="Analytics" description="Track the performance of your job postings" />
      {loading ? <div className="p-6 text-sm text-muted-foreground">Loading analytics...</div> : error ? <Card><CardContent className="p-6 text-sm text-destructive">{error}</CardContent></Card> : <>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total Views", value: totalViews, icon: Eye },
            { label: "Applications", value: applicants.length, icon: Users },
            { label: "Active Jobs", value: activeJobs, icon: Briefcase },
            { label: "Closed Jobs", value: closedJobs, icon: BarChart3 },
          ].map((stat) => <Card key={stat.label}><CardContent className="p-5"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">{stat.label}</p><p className="font-display text-2xl font-bold">{stat.value}</p></div><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10"><stat.icon className="h-5 w-5 text-primary" /></div></div></CardContent></Card>)}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card><CardHeader><CardTitle className="text-lg">Applications per Job</CardTitle></CardHeader><CardContent>
            {byJob.length ? <ResponsiveContainer width="100%" height={250}><BarChart data={byJob}><CartesianGrid strokeDasharray="3 3" className="stroke-border" /><XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))" }} /><YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} /><Tooltip /><Bar dataKey="applications" fill="hsl(225, 73%, 57%)" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer> : <p className="text-sm text-muted-foreground">No job data yet.</p>}
          </CardContent></Card>
          <Card><CardHeader><CardTitle className="text-lg">Applications by Status</CardTitle></CardHeader><CardContent>
            {byStatus.length ? <ResponsiveContainer width="100%" height={250}><BarChart data={byStatus}><CartesianGrid strokeDasharray="3 3" className="stroke-border" /><XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))" }} /><YAxis allowDecimals={false} tick={{ fill: "hsl(var(--muted-foreground))" }} /><Tooltip /><Bar dataKey="count" fill="hsl(262, 83%, 58%)" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer> : <p className="text-sm text-muted-foreground">No application data yet.</p>}
          </CardContent></Card>
        </div>
      </>}
    </motion.div>
  );
};

export default RecruiterAnalytics;
