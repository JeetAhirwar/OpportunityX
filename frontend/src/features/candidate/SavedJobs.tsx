import { motion } from "framer-motion";
import { AlertCircle, Bookmark, Building2, DollarSign, ExternalLink, Loader2, MapPin, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import { useSavedJobs, useToggleSave } from "@/hooks/useJobs";
import { useToast } from "@/hooks/use-toast";
import type { Job } from "@/types";

const formatSalary = (job: Job) => {
  if (!job.salary?.min && !job.salary?.max) return "Salary not disclosed";
  const currency = job.salary.currency || "USD";
  return `${currency} ${Number(job.salary.min || 0).toLocaleString()} - ${Number(job.salary.max || 0).toLocaleString()}`;
};

const SavedJobs = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: jobs = [], isLoading, isError, error, refetch } = useSavedJobs();
  const toggleSave = useToggleSave();

  const removeJob = async (jobId: string) => {
    try {
      await toggleSave.mutateAsync(jobId);
      toast({ title: "Job removed from saved jobs" });
    } catch (requestError) {
      toast({ title: "Could not remove saved job", description: requestError instanceof Error ? requestError.message : "Unknown error", variant: "destructive" });
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader title="Saved Jobs" description={isLoading ? "Loading saved jobs..." : `${jobs.length} jobs saved`} />
      {isLoading ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-border"><Loader2 className="mr-2 h-5 w-5 animate-spin text-primary" /> Loading saved jobs...</div>
      ) : isError ? (
        <EmptyState icon={AlertCircle} title="Could not load saved jobs" description={error instanceof Error ? error.message : "Please try again."} action={{ label: "Try again", onClick: () => void refetch() }} />
      ) : jobs.length === 0 ? (
        <EmptyState icon={Bookmark} title="No saved jobs" description="Browse jobs and bookmark the ones you're interested in to find them here." action={{ label: "Browse Jobs", onClick: () => navigate("/jobs") }} />
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <Card key={job._id} className="transition-shadow hover:shadow-md">
              <CardContent className="p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10"><Building2 className="h-6 w-6 text-primary" /></div>
                    <div>
                      <h3 className="font-display font-semibold">{job.title || "Untitled job"}</h3>
                      <p className="text-sm text-muted-foreground">{job.company || "Company unavailable"}</p>
                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.location || "Location unavailable"}</span>
                        <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> {formatSalary(job)}</span>
                        <span className="rounded-full bg-secondary px-2 py-0.5">{job.jobType || "Job type unavailable"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" className="gradient-primary border-0" onClick={() => navigate(`/jobs/${job._id}`)}><ExternalLink className="mr-1 h-3 w-3" /> View Details</Button>
                    <Button variant="ghost" size="icon" onClick={() => void removeJob(job._id)} disabled={toggleSave.isPending} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
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

export default SavedJobs;
