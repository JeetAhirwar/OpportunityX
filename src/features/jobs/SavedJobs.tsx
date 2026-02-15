import { useState } from "react";
import { motion } from "framer-motion";
import { Bookmark, MapPin, DollarSign, Building2, ExternalLink, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";

interface SavedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  savedAt: string;
}

const mockSaved: SavedJob[] = [
  { id: "1", title: "Senior Frontend Engineer", company: "Stripe", location: "San Francisco, CA", salary: "$160K - $200K", type: "Full-time", savedAt: "2 days ago" },
  { id: "2", title: "Full Stack Developer", company: "Vercel", location: "Remote", salary: "$140K - $180K", type: "Full-time", savedAt: "5 days ago" },
  { id: "3", title: "React Native Developer", company: "Shopify", location: "Remote", salary: "$130K - $170K", type: "Contract", savedAt: "1 week ago" },
];

const SavedJobs = () => {
  const [jobs, setJobs] = useState<SavedJob[]>(mockSaved);

  const removeJob = (id: string) => {
    // API call: api.delete(`/candidate/saved-jobs/${id}`)
    setJobs((prev) => prev.filter((j) => j.id !== id));
  };

  if (jobs.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <PageHeader title="Saved Jobs" description="Jobs you've bookmarked for later" />
        <EmptyState icon={Bookmark} title="No saved jobs" description="Browse jobs and bookmark the ones you're interested in to find them here." action={{ label: "Browse Jobs", onClick: () => window.location.href = "/jobs" }} />
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader title="Saved Jobs" description={`${jobs.length} jobs saved`} />
      <div className="space-y-3">
        {jobs.map((job) => (
          <Card key={job.id} className="transition-shadow hover:shadow-md">
            <CardContent className="p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold">{job.title}</h3>
                    <p className="text-sm text-muted-foreground">{job.company}</p>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.location}</span>
                      <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> {job.salary}</span>
                      <span className="rounded-full bg-secondary px-2 py-0.5">{job.type}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" className="gradient-primary border-0">
                    <ExternalLink className="mr-1 h-3 w-3" /> Apply
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => removeJob(job.id)} className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
};

export default SavedJobs;
