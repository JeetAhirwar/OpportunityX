import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Briefcase, CheckCircle, Eye, Loader2, Star, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageHeader from "@/components/common/PageHeader";
import StatusBadge from "@/components/common/StatusBadge";
import EmptyState from "@/components/common/EmptyState";
import api from "@/services/api";
import { getAdminJobs, unwrapAdminData } from "@/features/admin/adminApi";
import { useToast } from "@/hooks/use-toast";
import type { Job } from "@/types";

const JobModeration = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    getAdminJobs().then(setJobs)
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Could not load jobs"))
      .finally(() => setLoading(false));
  }, []);
  const filtered = useMemo(() => filter === "all" ? jobs : jobs.filter((job) => job.status === filter), [filter, jobs]);
  const moderate = async (job: Job, update: { status?: string; featured?: boolean }) => {
    try {
      const updated = unwrapAdminData(await api.patch<unknown>(`/admin/jobs/${job._id}/moderate`, update)) as Job;
      setJobs((items) => items.map((item) => item._id === job._id ? updated : item));
      toast({ title: "Job moderation updated" });
    } catch (requestError) {
      toast({ title: "Moderation failed", description: requestError instanceof Error ? requestError.message : "Unknown error", variant: "destructive" });
    }
  };
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader title="Job Moderation" description="Review and moderate job postings"><Select value={filter} onValueChange={setFilter}><SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="pending">Pending</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="draft">Draft</SelectItem><SelectItem value="closed">Closed</SelectItem></SelectContent></Select></PageHeader>
      {loading ? <div className="flex min-h-[300px] items-center justify-center"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading jobs...</div>
        : error ? <EmptyState icon={AlertCircle} title="Could not load jobs" description={error} />
        : !filtered.length ? <EmptyState icon={Briefcase} title="No jobs found" description="No jobs match this moderation filter." />
        : <div className="space-y-3">{filtered.map((job) => (
          <Card key={job._id}><CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between"><div><div className="flex items-center gap-2"><h3 className="font-semibold">{job.title}</h3><StatusBadge status={job.status} /></div><p className="text-sm text-muted-foreground">{job.company} · by {job.postedBy?.name || "Recruiter unavailable"} · {job.location}</p><p className="mt-1 text-xs text-muted-foreground">{job.views || 0} views · {job.applicantCount || 0} applicants</p></div><div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate(`/jobs/${job._id}`)}><Eye className="mr-1 h-3 w-3" /> View</Button>
            {job.status !== "active" && <Button size="sm" onClick={() => void moderate(job, { status: "active" })}><CheckCircle className="mr-1 h-3 w-3" /> Publish</Button>}
            <Button variant="outline" size="sm" onClick={() => void moderate(job, { featured: !job.featured })}><Star className="mr-1 h-3 w-3" /> {job.featured ? "Unfeature" : "Feature"}</Button>
            {job.status !== "closed" && <Button variant="outline" size="sm" className="text-destructive" onClick={() => void moderate(job, { status: "closed" })}><XCircle className="mr-1 h-3 w-3" /> Close</Button>}
          </div></CardContent></Card>
        ))}</div>}
    </motion.div>
  );
};
export default JobModeration;
