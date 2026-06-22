import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/common/PageHeader";
import StatusBadge from "@/components/common/StatusBadge";
import EmptyState from "@/components/common/EmptyState";
import api from "@/services/api";
import { startConversation } from "@/features/chat/messageApi";
import { useChat } from "@/features/chat/ChatContext";

interface Applicant {
  _id: string;
  status: string;
  appliedAt: string;
  candidate: { _id: string; name: string; email: string };
  job: { _id: string; title: string; company: string };
}

const ApplicantManagement = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { reloadConversations } = useChat();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Applicant[]>("/applications/recruiter")
      .then(setApplicants)
      .catch((error) => toast({ title: "Could not load applicants", description: error.message, variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [toast]);

  const filtered = useMemo(
    () => statusFilter === "all" ? applicants : applicants.filter((item) => item.status === statusFilter),
    [applicants, statusFilter]
  );

  const updateStatus = async (id: string, status: string) => {
    try {
      const updated = await api.patch<Applicant>(`/applications/${id}/status`, { status });
      setApplicants((items) => items.map((item) => item._id === id ? { ...item, status: updated.status } : item));
      toast({ title: "Application status updated" });
    } catch (error) {
      toast({ title: "Could not update status", description: error instanceof Error ? error.message : "Unknown error", variant: "destructive" });
    }
  };

  const messageCandidate = async (applicationId: string) => {
    try {
      const response = await startConversation(applicationId);
      await reloadConversations();
      navigate(`/recruiter/chat?conversation=${response.conversation._id}`);
    } catch (error) {
      toast({ title: "Could not start conversation", description: error instanceof Error ? error.message : "Unknown error", variant: "destructive" });
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader title="Applicant Management" description="Review and manage candidates for your postings">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Filter" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="applied">Applied</SelectItem>
            <SelectItem value="reviewed">Reviewed</SelectItem>
            <SelectItem value="shortlisted">Shortlisted</SelectItem>
            <SelectItem value="interview">Interview</SelectItem>
            <SelectItem value="offer">Offer</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </PageHeader>

      {!loading && !filtered.length ? <EmptyState icon={User} title="No applicants found" description="Applicants for your jobs will appear here." /> : (
        <div className="space-y-3">
          {filtered.map((applicant) => (
            <Card key={applicant._id} className="transition-shadow hover:shadow-md">
              <CardContent className="p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{applicant.candidate.name.charAt(0)}</div>
                    <div>
                      <p className="font-display font-semibold">{applicant.candidate.name}</p>
                      <p className="text-sm text-muted-foreground">{applicant.candidate.email} · {applicant.job.title} · {new Date(applicant.appliedAt).toLocaleDateString()}</p>
                      <div className="mt-2"><StatusBadge status={applicant.status} /></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={applicant.status} onValueChange={(value) => void updateStatus(applicant._id, value)}>
                      <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="applied">Applied</SelectItem>
                        <SelectItem value="reviewed">Reviewed</SelectItem>
                        <SelectItem value="shortlisted">Shortlisted</SelectItem>
                        <SelectItem value="interview">Interview</SelectItem>
                        <SelectItem value="offer">Offer</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" onClick={() => void messageCandidate(applicant._id)} title="Message candidate"><MessageSquare className="h-4 w-4" /></Button>
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

export default ApplicantManagement;
