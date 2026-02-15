import { useState } from "react";
import { motion } from "framer-motion";
import { UserCheck, UserX, Building2, Globe, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";

interface RecruiterRequest {
  id: string;
  name: string;
  email: string;
  company: string;
  website: string;
  employees: string;
  submittedAt: string;
}

const mockRequests: RecruiterRequest[] = [
  { id: "1", name: "Dan Wilson", email: "dan@startup.io", company: "StartupIO", website: "startup.io", employees: "10-50", submittedAt: "Feb 12, 2026" },
  { id: "2", name: "Fiona Green", email: "fiona@bigcorp.com", company: "BigCorp Industries", website: "bigcorp.com", employees: "500+", submittedAt: "Feb 11, 2026" },
];

const RecruiterApproval = () => {
  const [requests, setRequests] = useState(mockRequests);

  const handleAction = (id: string, action: "approve" | "reject") => {
    // API: api.patch(`/admin/recruiters/${id}`, { action })
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader title="Recruiter Approval" description={`${requests.length} pending requests`} />

      {requests.length === 0 ? (
        <EmptyState icon={Users} title="No pending requests" description="All recruiter applications have been reviewed." />
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <Card key={req.id}>
              <CardContent className="p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-warning/10 text-sm font-bold text-warning">{req.name.charAt(0)}</div>
                    <div>
                      <h3 className="font-display font-semibold">{req.name}</h3>
                      <p className="text-sm text-muted-foreground">{req.email}</p>
                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Building2 className="h-3 w-3" /> {req.company}</span>
                        <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> {req.website}</span>
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {req.employees}</span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">Submitted {req.submittedAt}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleAction(req.id, "approve")} className="gradient-primary border-0">
                      <UserCheck className="mr-1 h-4 w-4" /> Approve
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleAction(req.id, "reject")} className="text-destructive border-destructive/30">
                      <UserX className="mr-1 h-4 w-4" /> Reject
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

export default RecruiterApproval;
