import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Brain, Loader2, MessageSquare, User } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
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
import { getApplicationMatchScore, type MatchScore } from "@/features/ai/aiApi";

interface Applicant {
  _id: string;
  status: string;
  appliedAt?: string;
  notes?: string;
  candidate: { _id?: string; name: string; email: string };
  job: { _id?: string; title: string; company: string };
}

const asRecord = (value: unknown): Record<string, unknown> =>
  value !== null && typeof value === "object" ? value as Record<string, unknown> : {};

export const normalizeApplicants = (response: unknown): Applicant[] => {
  const responseRecord = asRecord(response);
  const source = Array.isArray(response)
    ? response
    : Array.isArray(responseRecord.data)
      ? responseRecord.data
      : Array.isArray(responseRecord.applications)
        ? responseRecord.applications
        : [];

  return source.map((entry, index) => {
    const application = asRecord(entry);
    const candidate = asRecord(application.candidate);
    const job = asRecord(application.job);

    return {
      _id: String(application._id || `application-${index}`),
      status: typeof application.status === "string" ? application.status : "applied",
      appliedAt: typeof application.appliedAt === "string" ? application.appliedAt : undefined,
      notes: typeof application.notes === "string" ? application.notes : undefined,
      candidate: {
        _id: typeof candidate._id === "string" ? candidate._id : undefined,
        name: typeof candidate.name === "string" && candidate.name.trim() ? candidate.name : "Unknown candidate",
        email: typeof candidate.email === "string" ? candidate.email : "Email unavailable",
      },
      job: {
        _id: typeof job._id === "string" ? job._id : undefined,
        title: typeof job.title === "string" && job.title.trim() ? job.title : "Job unavailable",
        company: typeof job.company === "string" ? job.company : "",
      },
    };
  });
};

const formatAppliedDate = (value?: string) => {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : date.toLocaleDateString();
};

const ApplicantManagement = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { jobId } = useParams();
  const { reloadConversations } = useChat();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [match, setMatch] = useState<{ applicant: Applicant; score: MatchScore } | null>(null);
  const [matchingId, setMatchingId] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    api.get<unknown>(jobId ? `/applications/job/${jobId}` : "/applications/recruiter")
      .then((response) => setApplicants(normalizeApplicants(response)))
      .catch((requestError) => {
        const message = requestError instanceof Error ? requestError.message : "Unknown error";
        setApplicants([]);
        setError(message);
        toast({ title: "Could not load applicants", description: message, variant: "destructive" });
      })
      .finally(() => setLoading(false));
  }, [jobId, reloadKey, toast]);

  const filtered = useMemo(
    () => statusFilter === "all" ? applicants : applicants.filter((item) => item.status === statusFilter),
    [applicants, statusFilter]
  );

  const updateStatus = async (id: string, status: string) => {
    try {
      const updated = asRecord(await api.patch<unknown>(`/applications/${id}/status`, { status }));
      const updatedStatus = typeof updated.status === "string" ? updated.status : status;
      setApplicants((items) => items.map((item) => item._id === id ? { ...item, status: updatedStatus } : item));
      toast({ title: "Application status updated" });
    } catch (requestError) {
      toast({ title: "Could not update status", description: requestError instanceof Error ? requestError.message : "Unknown error", variant: "destructive" });
    }
  };

  const messageCandidate = async (applicationId: string) => {
    try {
      const response = await startConversation(applicationId);
      await reloadConversations();
      navigate(`/recruiter/chat?conversation=${response.conversation._id}`);
    } catch (requestError) {
      toast({ title: "Could not start conversation", description: requestError instanceof Error ? requestError.message : "Unknown error", variant: "destructive" });
    }
  };

  const loadMatch = async (applicant: Applicant) => {
    setMatchingId(applicant._id);
    try {
      setMatch({ applicant, score: await getApplicationMatchScore(applicant._id) });
    } catch (requestError) {
      toast({ title: "AI match unavailable", description: requestError instanceof Error ? requestError.message : "Unknown error", variant: "destructive" });
    } finally {
      setMatchingId("");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader title={jobId ? "Job Applicants" : "Applicant Management"} description={jobId ? "Review candidates for this job" : "Review and manage candidates for your postings"}>
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

      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-border">
          <Loader2 className="mr-2 h-5 w-5 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Loading applicants...</span>
        </div>
      ) : error ? (
        <EmptyState
          icon={AlertCircle}
          title="Could not load applicants"
          description={error}
          action={{ label: "Try again", onClick: () => setReloadKey((key) => key + 1) }}
        />
      ) : !filtered.length ? (
        <EmptyState icon={User} title="No applicants found" description="Applicants for your jobs will appear here." />
      ) : (
        <div className="space-y-3">
          {filtered.map((applicant) => (
            <Card key={applicant._id} className="transition-shadow hover:shadow-md">
              <CardContent className="p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      {applicant.candidate.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-display font-semibold">{applicant.candidate.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {applicant.candidate.email} · {applicant.job.title} · {formatAppliedDate(applicant.appliedAt)}
                      </p>
                      <div className="mt-2"><StatusBadge status={applicant.status} /></div>
                      {applicant.notes && <p className="mt-1 text-xs text-muted-foreground">Notes: {applicant.notes}</p>}
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
                    <Button variant="outline" size="sm" onClick={() => void messageCandidate(applicant._id)} title="Message candidate">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => void loadMatch(applicant)} disabled={matchingId === applicant._id} title="AI match">
                      {matchingId === applicant._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {match && <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4" onClick={() => setMatch(null)}>
        <Card className="w-full max-w-lg" onClick={(event) => event.stopPropagation()}>
          <CardContent className="space-y-4 p-5">
            <div><p className="text-sm text-muted-foreground">AI advisory match</p><h3 className="font-display text-xl font-bold">{match.applicant.candidate.name}: {match.score.score}/100</h3></div>
            <p className="text-sm text-muted-foreground">{match.score.explanation}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div><p className="text-sm font-medium">Matched skills</p><p className="text-sm text-muted-foreground">{match.score.matchedSkills?.join(", ") || "None listed"}</p></div>
              <div><p className="text-sm font-medium">Missing skills</p><p className="text-sm text-muted-foreground">{match.score.missingSkills?.join(", ") || "None listed"}</p></div>
            </div>
            {!!match.score.riskFlags?.length && <div><p className="text-sm font-medium">Risk flags</p><ul className="list-disc pl-5 text-sm text-muted-foreground">{match.score.riskFlags.map((item) => <li key={item}>{item}</li>)}</ul></div>}
            <p className="rounded-lg bg-warning/10 p-3 text-xs text-warning">AI match scores are suggestions only. Do not auto-reject candidates based on this score.</p>
            <Button className="w-full" variant="outline" onClick={() => setMatch(null)}>Close</Button>
          </CardContent>
        </Card>
      </div>}
    </motion.div>
  );
};

export default ApplicantManagement;
