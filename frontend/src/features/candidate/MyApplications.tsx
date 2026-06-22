import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, Filter, MessageSquare, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageHeader from "@/components/common/PageHeader";
import StatusBadge from "@/components/common/StatusBadge";
import EmptyState from "@/components/common/EmptyState";
import { useMyApplications, useWithdraw } from "@/hooks/useApplications";
import { startConversation } from "@/features/chat/messageApi";
import { useChat } from "@/features/chat/ChatContext";
import { useToast } from "@/hooks/use-toast";

interface ApplicationRow {
  _id: string;
  status: string;
  appliedAt: string;
  job: {
    _id: string;
    title: string;
    company: string;
    location: string;
    salary?: { min: number; max: number; currency: string };
  };
}

const MyApplications = () => {
  const [filter, setFilter] = useState("all");
  const { data, isLoading } = useMyApplications({ limit: 100 });
  const withdraw = useWithdraw();
  const navigate = useNavigate();
  const { reloadConversations } = useChat();
  const { toast } = useToast();
  const applications = useMemo(
    () => (data?.applications || []) as ApplicationRow[],
    [data?.applications]
  );
  const filtered = useMemo(
    () => filter === "all" ? applications : applications.filter((item) => item.status === filter),
    [applications, filter]
  );

  const openChat = async (applicationId: string) => {
    try {
      const response = await startConversation(applicationId);
      await reloadConversations();
      navigate(`/candidate/chat?conversation=${response.conversation._id}`);
    } catch (error) {
      toast({ title: "Could not open conversation", description: error instanceof Error ? error.message : "Unknown error", variant: "destructive" });
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader title="My Applications" description="Track all your job applications">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[160px]"><Filter className="mr-2 h-4 w-4" /><SelectValue placeholder="Filter" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="applied">Applied</SelectItem>
            <SelectItem value="reviewed">Reviewed</SelectItem>
            <SelectItem value="shortlisted">Shortlisted</SelectItem>
            <SelectItem value="interview">Interview</SelectItem>
            <SelectItem value="offer">Offer</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="withdrawn">Withdrawn</SelectItem>
          </SelectContent>
        </Select>
      </PageHeader>
      {!isLoading && !filtered.length ? (
        <EmptyState icon={Briefcase} title="No applications found" description="No applications match this filter." action={{ label: "Browse Jobs", onClick: () => navigate("/jobs") }} />
      ) : (
        <div className="space-y-3">
          {filtered.map((application) => (
            <Card key={application._id} className="transition-shadow hover:shadow-md">
              <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-display font-semibold">{application.job.title}</p>
                  <p className="text-sm text-muted-foreground">{application.job.company} · {application.job.location}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Applied {new Date(application.appliedAt).toLocaleDateString()}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={application.status} />
                  {application.status !== "withdrawn" && (
                    <Button variant="outline" size="sm" onClick={() => void openChat(application._id)}><MessageSquare className="mr-1.5 h-4 w-4" /> Message Recruiter</Button>
                  )}
                  {!["offer", "rejected", "withdrawn"].includes(application.status) && (
                    <Button variant="outline" size="sm" className="text-destructive" onClick={() => withdraw.mutate(application._id)} disabled={withdraw.isPending}>
                      <AlertTriangle className="mr-1.5 h-4 w-4" /> Withdraw
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default MyApplications;
