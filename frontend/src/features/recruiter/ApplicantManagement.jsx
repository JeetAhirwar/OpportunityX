import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, BarChart3, Brain, Briefcase, CheckSquare, Download, Eye, Loader2, MessageSquare, Plus, Search, Tag, User, X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import EmptyState from "@/components/common/EmptyState";
import PageHeader from "@/components/common/PageHeader";
import api, { publicAssetUrl } from "@/services/api";
import { getApplicationMatchScore } from "@/features/ai/aiApi";
import { startConversation } from "@/features/chat/messageApi";
import { getChatSocket } from "@/features/chat/socketClient";
import { useChat } from "@/features/chat/ChatContext";
import { useToast } from "@/hooks/use-toast";

const asRecord = (value) => value !== null && typeof value === "object" ? value : {};
const unwrap = (response) => asRecord(response).data ?? response;
const fallbackStages = [
  { key: "applied", label: "Applied" },
  { key: "screening", label: "Screening" },
  { key: "shortlisted", label: "Shortlisted" },
  { key: "assessment", label: "Assessment" },
  { key: "interview_scheduled", label: "Interview Scheduled" },
  { key: "interview_completed", label: "Interview Completed" },
  { key: "offer_sent", label: "Offer Sent" },
  { key: "offer_accepted", label: "Offer Accepted" },
  { key: "offer_declined", label: "Offer Declined" },
  { key: "rejected", label: "Rejected" },
  { key: "hired", label: "Hired" },
  { key: "withdrawn", label: "Withdrawn" },
];
const tagSuggestions = ["frontend", "backend", "react", "urgent", "experienced", "fresher", "referral", "high priority"];

export const normalizeApplicants = (response) => {
  const root = asRecord(response);
  const source = Array.isArray(response) ? response : Array.isArray(root.applications) ? root.applications : [];
  return source.map((entry, index) => {
    const application = asRecord(entry);
    const candidate = asRecord(application.candidate);
    const job = asRecord(application.job);
    const profile = asRecord(application.profile);
    return {
      _id: String(application._id || `application-${index}`),
      status: typeof application.status === "string" ? application.status : "applied",
      pipelineStage: typeof application.pipelineStage === "string" ? application.pipelineStage : application.status || "applied",
      appliedAt: application.appliedAt,
      updatedAt: application.updatedAt,
      tags: Array.isArray(application.tags) ? application.tags : [],
      timeline: Array.isArray(application.timeline) ? application.timeline : [],
      candidate: {
        _id: candidate._id,
        name: typeof candidate.name === "string" && candidate.name.trim() ? candidate.name : "Unknown candidate",
        email: typeof candidate.email === "string" ? candidate.email : "Email unavailable",
      },
      job: {
        _id: job._id,
        title: typeof job.title === "string" && job.title.trim() ? job.title : "Job unavailable",
        company: typeof job.company === "string" ? job.company : "",
        location: typeof job.location === "string" ? job.location : "",
      },
      profile: {
        title: profile.title || "",
        candidateType: profile.candidateType || "",
        resumeUrl: profile.resumeUrl || "",
        location: profile.location || "",
        skills: Array.isArray(profile.skills) ? profile.skills : [],
        education: Array.isArray(profile.education) ? profile.education : [],
        experience: Array.isArray(profile.experience) ? profile.experience : [],
        projects: Array.isArray(profile.projects) ? profile.projects : [],
        certifications: Array.isArray(profile.certifications) ? profile.certifications : [],
        socials: asRecord(profile.socials),
        expectedSalaryMin: profile.expectedSalaryMin || 0,
      },
    };
  });
};

const formatDate = (value) => {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : date.toLocaleDateString();
};

const CompactMetric = ({ label, value }) => (
  <div className="rounded-lg border border-border bg-card/70 px-3 py-2">
    <p className="truncate text-xs text-muted-foreground">{label}</p>
    <p className="font-display text-lg font-semibold">{value}</p>
  </div>
);

const CandidateCard = ({ applicant, selected, onSelect, onDragStart, onOpen, onMessage, onMatch, matching }) => (
  <Card draggable onDragStart={(event) => onDragStart(event, applicant._id)} className="cursor-grab border-border/80 bg-background/80 transition-shadow hover:shadow-md active:cursor-grabbing">
    <CardContent className="space-y-3 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-2">
          <Checkbox checked={selected} onCheckedChange={(checked) => onSelect(applicant._id, Boolean(checked))} aria-label={`Select ${applicant.candidate.name}`} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{applicant.candidate.name}</p>
            <p className="truncate text-xs text-muted-foreground">{applicant.job.title}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onOpen(applicant._id)} title="View details">
          <Eye className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-1">
        {applicant.profile.skills.slice(0, 3).map((skill) => <Badge key={skill} variant="secondary">{skill}</Badge>)}
        {applicant.tags.slice(0, 3).map((tag) => <Badge key={tag} variant="outline"><Tag className="mr-1 h-3 w-3" />{tag}</Badge>)}
      </div>
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>{formatDate(applicant.appliedAt)}</span>
        <span className="truncate">{applicant.profile.location || applicant.job.location || "Location n/a"}</span>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="h-8 flex-1" onClick={() => onMessage(applicant._id)} title="Message candidate">
          <MessageSquare className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" className="h-8 flex-1" onClick={() => onMatch(applicant)} disabled={matching} title="AI match">
          {matching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
        </Button>
      </div>
    </CardContent>
  </Card>
);

const DetailPanel = ({ details, onClose, onAddTag, onAddNote, noteText, setNoteText }) => {
  if (!details) return null;
  const { application, profile = {}, notes = [] } = details;
  const app = asRecord(application);
  const candidate = asRecord(app.candidate);
  const job = asRecord(app.job);
  const safeProfile = asRecord(profile);
  const socials = asRecord(safeProfile.socials);
  const resumeUrl = safeProfile.resumeUrl ? publicAssetUrl(safeProfile.resumeUrl) : "";
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-background/70" onClick={onClose}>
      <Card className="h-full w-full max-w-3xl overflow-y-auto rounded-none border-y-0 border-r-0" onClick={(event) => event.stopPropagation()}>
        <CardContent className="space-y-6 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">{job.title || "Application"}</p>
              <h2 className="font-display text-2xl font-bold">{candidate.name || "Candidate"}</h2>
              <p className="text-sm text-muted-foreground">{candidate.email}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}><X className="h-5 w-5" /></Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <CompactMetric label="Stage" value={String(app.pipelineStage || app.status || "applied").replace(/_/g, " ")} />
            <CompactMetric label="Applied" value={formatDate(app.appliedAt)} />
            <CompactMetric label="Salary" value={safeProfile.expectedSalaryMin ? `$${safeProfile.expectedSalaryMin}` : "Not listed"} />
          </div>
          <section className="space-y-3">
            <h3 className="font-display text-lg font-semibold">Candidate Profile</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border p-3">
                <p className="text-sm font-medium">Skills</p>
                <div className="mt-2 flex flex-wrap gap-1">{(safeProfile.skills || []).map((skill) => <Badge key={skill} variant="secondary">{skill}</Badge>)}</div>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-sm font-medium">Resume and portfolio</p>
                <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                  {resumeUrl && <a className="block text-primary" href={resumeUrl} target="_blank" rel="noreferrer">Resume</a>}
                  {socials.portfolio && <a className="block text-primary" href={socials.portfolio} target="_blank" rel="noreferrer">Portfolio</a>}
                  {socials.github && <a className="block text-primary" href={socials.github} target="_blank" rel="noreferrer">GitHub</a>}
                  {!resumeUrl && !socials.portfolio && !socials.github && "No links listed"}
                </div>
              </div>
            </div>
          </section>
          {["education", "experience", "projects", "certifications"].map((key) => (
            <section key={key} className="space-y-2">
              <h3 className="font-display text-lg font-semibold capitalize">{key}</h3>
              <div className="space-y-2">
                {(safeProfile[key] || []).length ? safeProfile[key].map((item, index) => (
                  <div key={`${key}-${index}`} className="rounded-lg border border-border p-3 text-sm">
                    <p className="font-medium">{item.degree || item.role || item.name || item.company || "Entry"}</p>
                    <p className="text-muted-foreground">{item.school || item.company || item.issuer || item.description || item.url || ""}</p>
                  </div>
                )) : <p className="text-sm text-muted-foreground">No {key} listed.</p>}
              </div>
            </section>
          ))}
          <section className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="font-display text-lg font-semibold">Tags</h3>
              <div className="flex flex-wrap gap-1">{tagSuggestions.map((tag) => <Button key={tag} variant="outline" size="sm" onClick={() => onAddTag(app._id, tag)}>{tag}</Button>)}</div>
            </div>
            <div className="flex flex-wrap gap-1">{(app.tags || []).map((tag) => <Badge key={tag} variant="outline">{tag}</Badge>)}</div>
          </section>
          <section className="space-y-3">
            <h3 className="font-display text-lg font-semibold">Recruiter Notes</h3>
            <div className="flex gap-2">
              <Input value={noteText} onChange={(event) => setNoteText(event.target.value)} placeholder="Add a note for this application" />
              <Button onClick={() => onAddNote(app._id)}><Plus className="mr-2 h-4 w-4" />Add</Button>
            </div>
            <div className="space-y-2">
              {notes.length ? notes.map((note) => (
                <div key={note._id} className="rounded-lg border border-border p-3 text-sm">
                  <p>{note.content}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{note.recruiter?.name || "Recruiter"} - {formatDate(note.createdAt)}</p>
                </div>
              )) : <p className="text-sm text-muted-foreground">No recruiter notes yet.</p>}
            </div>
          </section>
          <section className="space-y-3">
            <h3 className="font-display text-lg font-semibold">Application Timeline</h3>
            <div className="space-y-2">
              {(app.timeline || []).slice().reverse().map((event, index) => (
                <div key={`${event.title}-${index}`} className="border-l-2 border-primary/50 pl-3">
                  <p className="text-sm font-medium">{event.title}</p>
                  <p className="text-xs text-muted-foreground">{event.description || event.toStage || ""} - {formatDate(event.createdAt)}</p>
                </div>
              ))}
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  );
};

const ApplicantManagement = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { jobId } = useParams();
  const { reloadConversations } = useChat();
  const [applicants, setApplicants] = useState([]);
  const [stages, setStages] = useState(fallbackStages);
  const [analytics, setAnalytics] = useState(null);
  const [filters, setFilters] = useState({ stage: "all", search: "", skills: "", location: "", tags: "", sort: "newest" });
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [match, setMatch] = useState(null);
  const [matchingId, setMatchingId] = useState("");
  const [details, setDetails] = useState(null);
  const [noteText, setNoteText] = useState("");

  useEffect(() => {
    const socket = getChatSocket();
    if (!socket.connected) socket.connect();
    const refresh = () => setReloadKey((key) => key + 1);
    socket.on("pipeline_updated", refresh);
    return () => socket.off("pipeline_updated", refresh);
  }, []);

  useEffect(() => {
    const query = new URLSearchParams();
    if (jobId) query.set("jobId", jobId);
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "all") query.set(key, value);
    });
    setLoading(true);
    setError("");
    Promise.all([
      api.get(`/pipeline?${query.toString()}`),
      api.get(`/pipeline/analytics${jobId ? `?jobId=${jobId}` : ""}`),
    ])
      .then(([pipelineResponse, analyticsResponse]) => {
        const data = unwrap(pipelineResponse);
        setApplicants(normalizeApplicants(data));
        setStages(Array.isArray(data.stages) ? data.stages : fallbackStages);
        setAnalytics(unwrap(analyticsResponse));
      })
      .catch((requestError) => {
        const message = requestError instanceof Error ? requestError.message : "Unknown error";
        setApplicants([]);
        setError(message);
        toast({ title: "Could not load pipeline", description: message, variant: "destructive" });
      })
      .finally(() => setLoading(false));
  }, [filters, jobId, reloadKey, toast]);

  const grouped = useMemo(() => Object.fromEntries(stages.map((stage) => [stage.key, applicants.filter((item) => item.pipelineStage === stage.key)])), [applicants, stages]);
  const patchFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value }));
  const toggleSelected = (id, checked) => setSelected((items) => checked ? [...new Set([...items, id])] : items.filter((item) => item !== id));

  const moveApplication = async (id, stage) => {
    const previous = applicants;
    setApplicants((items) => items.map((item) => item._id === id ? { ...item, pipelineStage: stage } : item));
    try {
      const response = await api.patch(`/pipeline/applications/${id}/stage`, { stage });
      const updated = normalizeApplicants([unwrap(response)])[0];
      setApplicants((items) => items.map((item) => item._id === id ? updated : item));
      toast({ title: "Pipeline updated" });
    } catch (requestError) {
      setApplicants(previous);
      toast({ title: "Could not move candidate", description: requestError instanceof Error ? requestError.message : "Unknown error", variant: "destructive" });
    }
  };

  const runBulk = async (action, stage) => {
    if (!selected.length) return;
    try {
      await api.post("/pipeline/bulk", { action, stage, applicationIds: selected });
      setSelected([]);
      setReloadKey((key) => key + 1);
      toast({ title: "Bulk action complete" });
    } catch (requestError) {
      toast({ title: "Bulk action failed", description: requestError instanceof Error ? requestError.message : "Unknown error", variant: "destructive" });
    }
  };

  const exportSelected = () => {
    const rows = applicants.filter((item) => selected.includes(item._id));
    const csv = ["Candidate,Email,Job,Stage,Tags", ...rows.map((item) => [item.candidate.name, item.candidate.email, item.job.title, item.pipelineStage, item.tags.join("|")].map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "opportunityx-applications.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const openDetails = async (id) => {
    try {
      setDetails(unwrap(await api.get(`/pipeline/applications/${id}`)));
      setNoteText("");
    } catch (requestError) {
      toast({ title: "Could not load application", description: requestError instanceof Error ? requestError.message : "Unknown error", variant: "destructive" });
    }
  };

  const addTag = async (id, tag) => {
    const applicant = applicants.find((item) => item._id === id);
    if (!applicant) return;
    await api.patch(`/pipeline/applications/${id}/tags`, { tags: [...new Set([...(applicant.tags || []), tag])] });
    setReloadKey((key) => key + 1);
    await openDetails(id);
  };

  const addNote = async (id) => {
    if (!noteText.trim()) return;
    await api.post(`/pipeline/applications/${id}/notes`, { content: noteText });
    setNoteText("");
    await openDetails(id);
  };

  const messageCandidate = async (applicationId) => {
    try {
      const response = await startConversation(applicationId);
      await reloadConversations();
      navigate(`/recruiter/chat?conversation=${response.conversation._id}`);
    } catch (requestError) {
      toast({ title: "Could not start conversation", description: requestError instanceof Error ? requestError.message : "Unknown error", variant: "destructive" });
    }
  };

  const loadMatch = async (applicant) => {
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
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <PageHeader title={jobId ? "Job Pipeline" : "Recruitment Pipeline"} description={jobId ? "Manage candidates for this job" : "Move candidates through the hiring lifecycle"} />
      <div className="grid gap-3 md:grid-cols-4">
        <CompactMetric label="Applications" value={applicants.length} />
        <CompactMetric label="Conversion" value={`${analytics?.conversionRate || 0}%`} />
        <CompactMetric label="Avg hiring time" value={`${analytics?.averageHiringTimeDays || 0}d`} />
        <CompactMetric label="Offer acceptance" value={`${analytics?.offerAcceptanceRate || 0}%`} />
      </div>
      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="grid gap-3 lg:grid-cols-[1.3fr_1fr_1fr_1fr_160px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" value={filters.search} onChange={(event) => patchFilter("search", event.target.value)} placeholder="Search candidates, jobs, tags" />
            </div>
            <Input value={filters.skills} onChange={(event) => patchFilter("skills", event.target.value)} placeholder="Skills" />
            <Input value={filters.location} onChange={(event) => patchFilter("location", event.target.value)} placeholder="Location" />
            <Input value={filters.tags} onChange={(event) => patchFilter("tags", event.target.value)} placeholder="Tags" />
            <Select value={filters.sort} onValueChange={(value) => patchFilter("sort", value)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="updated">Recently updated</SelectItem>
                <SelectItem value="candidate">Candidate</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={filters.stage} onValueChange={(value) => patchFilter("stage", value)}>
              <SelectTrigger className="w-[190px]"><SelectValue placeholder="Stage" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All stages</SelectItem>
                {stages.map((stage) => <SelectItem key={stage.key} value={stage.key}>{stage.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" disabled={!selected.length} onClick={() => void runBulk("shortlist")}><CheckSquare className="mr-2 h-4 w-4" />Shortlist</Button>
            <Button variant="outline" size="sm" disabled={!selected.length} onClick={() => void runBulk("reject")}>Reject</Button>
            <Button variant="outline" size="sm" disabled={!selected.length} onClick={exportSelected}><Download className="mr-2 h-4 w-4" />Export</Button>
            <Button variant="outline" size="sm" disabled title="Future email integration">Email selected</Button>
            {!!selected.length && <Badge variant="secondary">{selected.length} selected</Badge>}
          </div>
        </CardContent>
      </Card>
      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-border">
          <Loader2 className="mr-2 h-5 w-5 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Loading pipeline...</span>
        </div>
      ) : error ? (
        <EmptyState icon={AlertCircle} title="Could not load pipeline" description={error} action={{ label: "Try again", onClick: () => setReloadKey((key) => key + 1) }} />
      ) : !applicants.length ? (
        <EmptyState icon={User} title="No applicants found" description="Applicants for your jobs will appear here." />
      ) : (
        <div className="overflow-x-auto pb-2">
          <div className="grid min-w-[1180px] grid-cols-4 gap-3 xl:grid-cols-6">
            {stages.map((stage) => (
              <div key={stage.key} className="rounded-lg border border-border bg-card/60" onDragOver={(event) => event.preventDefault()} onDrop={(event) => {
                event.preventDefault();
                const id = event.dataTransfer.getData("application/id");
                if (id) void moveApplication(id, stage.key);
              }}>
                <div className="flex items-center justify-between border-b border-border p-3">
                  <div className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-primary" /><p className="text-sm font-semibold">{stage.label}</p></div>
                  <Badge variant="secondary">{grouped[stage.key]?.length || 0}</Badge>
                </div>
                <div className="min-h-[280px] space-y-3 p-3">
                  {(grouped[stage.key] || []).map((applicant) => (
                    <CandidateCard
                      key={applicant._id}
                      applicant={applicant}
                      selected={selected.includes(applicant._id)}
                      onSelect={toggleSelected}
                      onDragStart={(event, id) => event.dataTransfer.setData("application/id", id)}
                      onOpen={openDetails}
                      onMessage={messageCandidate}
                      onMatch={loadMatch}
                      matching={matchingId === applicant._id}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {analytics && (
        <Card>
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /><h3 className="font-display font-semibold">Pipeline analytics</h3></div>
            <div className="grid gap-2 md:grid-cols-4">{(analytics.topPerformingJobs || []).slice(0, 4).map((job) => <CompactMetric key={job._id} label={job.title} value={job.applications} />)}</div>
          </CardContent>
        </Card>
      )}
      <DetailPanel details={details} onClose={() => setDetails(null)} onAddTag={addTag} onAddNote={addNote} noteText={noteText} setNoteText={setNoteText} />
      {match && <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4" onClick={() => setMatch(null)}>
        <Card className="w-full max-w-lg" onClick={(event) => event.stopPropagation()}>
          <CardContent className="space-y-4 p-5">
            <div><p className="text-sm text-muted-foreground">AI advisory match</p><h3 className="font-display text-xl font-bold">{match.applicant.candidate.name}: {match.score.score}/100</h3></div>
            <p className="text-sm text-muted-foreground">{match.score.explanation}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div><p className="text-sm font-medium">Matched skills</p><p className="text-sm text-muted-foreground">{match.score.matchedSkills?.join(", ") || "None listed"}</p></div>
              <div><p className="text-sm font-medium">Missing skills</p><p className="text-sm text-muted-foreground">{match.score.missingSkills?.join(", ") || "None listed"}</p></div>
            </div>
            <Button className="w-full" variant="outline" onClick={() => setMatch(null)}>Close</Button>
          </CardContent>
        </Card>
      </div>}
    </motion.div>
  );
};

export default ApplicantManagement;
