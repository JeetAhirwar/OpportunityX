import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Briefcase, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import StatusBadge from "@/components/common/StatusBadge";
import { AdminApplication, getAdminApplications } from "@/features/admin/adminApi";

const AdminApplications = () => {
  const [applications, setApplications] = useState<AdminApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    getAdminApplications().then(setApplications)
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Could not load applications"))
      .finally(() => setLoading(false));
  }, []);
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader title="Applications" description="Read-only view of applications across the platform" />
      {loading ? <div className="flex min-h-[300px] items-center justify-center"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading applications...</div>
        : error ? <EmptyState icon={AlertCircle} title="Could not load applications" description={error} />
        : !applications.length ? <EmptyState icon={Briefcase} title="No applications" description="Applications will appear here." />
        : <div className="space-y-3">{applications.map((application) => (
          <Card key={application._id}><CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div><p className="font-medium">{application.candidate?.name || "Candidate unavailable"}</p><p className="text-sm text-muted-foreground">{application.candidate?.email || "Email unavailable"} · {application.job?.title || "Job unavailable"} · {application.job?.company || "Company unavailable"}</p><p className="mt-1 text-xs text-muted-foreground">Recruiter: {application.job?.postedBy?.name || "Unavailable"} · Applied {application.appliedAt ? new Date(application.appliedAt).toLocaleDateString() : "date unavailable"}</p></div>
            <StatusBadge status={application.status} />
          </CardContent></Card>
        ))}</div>}
    </motion.div>
  );
};

export default AdminApplications;
