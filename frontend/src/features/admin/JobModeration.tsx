import { useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, CheckCircle, XCircle, Flag, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageHeader from "@/components/common/PageHeader";
import StatusBadge from "@/components/common/StatusBadge";
import EmptyState from "@/components/common/EmptyState";

interface JobPost {
  id: string;
  title: string;
  company: string;
  recruiter: string;
  status: string;
  submittedAt: string;
  salary: string;
}

const mockJobs: JobPost[] = [
  { id: "1", title: "Senior Frontend Engineer", company: "TechCorp", recruiter: "Bob Smith", status: "Pending", submittedAt: "Feb 13, 2026", salary: "$150K - $200K" },
  { id: "2", title: "Data Scientist", company: "AIStartup", recruiter: "Fiona Green", status: "Pending", submittedAt: "Feb 12, 2026", salary: "$140K - $180K" },
  { id: "3", title: "Marketing Manager", company: "GrowthCo", recruiter: "Dan Wilson", status: "Flagged", submittedAt: "Feb 11, 2026", salary: "Not specified" },
  { id: "4", title: "DevOps Lead", company: "CloudInc", recruiter: "Bob Smith", status: "Approved", submittedAt: "Feb 10, 2026", salary: "$160K - $210K" },
];

const JobModeration = () => {
  const [jobs, setJobs] = useState(mockJobs);
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? jobs : jobs.filter((j) => j.status.toLowerCase() === filter);

  const updateStatus = (id: string, status: string) => {
    setJobs((prev) => prev.map((j) => j.id === id ? { ...j, status } : j));
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader title="Job Moderation" description="Review and moderate job postings">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Filter" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="flagged">Flagged</SelectItem>
          </SelectContent>
        </Select>
      </PageHeader>

      {filtered.length === 0 ? (
        <EmptyState icon={Briefcase} title="No jobs to review" description="All job postings have been moderated." />
      ) : (
        <div className="space-y-3">
          {filtered.map((job) => (
            <Card key={job.id}>
              <CardContent className="p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-display font-semibold">{job.title}</h3>
                      <StatusBadge status={job.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">{job.company} · by {job.recruiter} · {job.salary}</p>
                    <p className="text-xs text-muted-foreground mt-1">Submitted {job.submittedAt}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm"><Eye className="mr-1 h-3 w-3" /> View</Button>
                    {job.status !== "Approved" && (
                      <Button size="sm" onClick={() => updateStatus(job.id, "Approved")} className="gradient-primary border-0">
                        <CheckCircle className="mr-1 h-3 w-3" /> Approve
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => updateStatus(job.id, "Flagged")} className="text-warning border-warning/30">
                      <Flag className="mr-1 h-3 w-3" /> Flag
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => updateStatus(job.id, "Rejected")} className="text-destructive border-destructive/30">
                      <XCircle className="mr-1 h-3 w-3" /> Reject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default JobModeration;
