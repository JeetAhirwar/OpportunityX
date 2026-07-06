import { useEffect, useMemo, useState } from "react";
import { CalendarClock, Copy, Download, Loader2, Plus, RotateCcw, Star, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import api from "@/services/api";
import { normalizeApplicants } from "@/features/recruiter/ApplicantManagement";
import { cancelInterview, createInterview, duplicateInterview, getInterviewAnalytics, interviewCalendarUrl, listInterviews, normalizeInterviewPage, rescheduleInterview, submitInterviewFeedback } from "@/services/interviewApi";
import { useToast } from "@/hooks/use-toast";

const formatDate = (value) => value ? new Date(value).toLocaleString() : "Time unavailable";
const label = (value) => String(value || "").replace(/_/g, " ");
const initialForm = { applicationId: "", title: "", stage: "technical", mode: "google_meet", meetingLink: "", location: "", scheduledAt: "", duration: 60, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC" };

const InterviewManagement = () => {
  const { toast } = useToast();
  const [interviews, setInterviews] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [feedback, setFeedback] = useState({ technicalScore: 0, communication: 0, problemSolving: 0, cultureFit: 0, comments: "", recommendation: "hold" });
  const [activeFeedbackId, setActiveFeedbackId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = () => {
    setLoading(true);
    Promise.all([
      listInterviews({ limit: 100 }).then((response) => normalizeInterviewPage(response).interviews),
      api.get("/applications/recruiter").then(normalizeApplicants),
      getInterviewAnalytics(),
    ]).then(([interviewData, applicantData, analyticsData]) => {
      setInterviews(interviewData);
      setApplicants(applicantData);
      setAnalytics(analyticsData);
    }).catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Could not load interviews"))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);
  const selectedApplicant = useMemo(() => applicants.find((item) => item._id === form.applicationId), [applicants, form.applicationId]);
  const patch = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const schedule = async () => {
    try {
      await createInterview({ ...form, title: form.title || `${selectedApplicant?.candidate?.name || "Candidate"} interview` });
      setForm(initialForm);
      toast({ title: "Interview scheduled" });
      load();
    } catch (requestError) {
      toast({ title: "Could not schedule interview", description: requestError instanceof Error ? requestError.message : "Unknown error", variant: "destructive" });
    }
  };
  const run = async (action, success) => {
    try {
      await action();
      toast({ title: success });
      load();
    } catch (requestError) {
      toast({ title: "Interview update failed", description: requestError instanceof Error ? requestError.message : "Unknown error", variant: "destructive" });
    }
  };
  const sendFeedback = async (id) => {
    await run(() => submitInterviewFeedback(id, feedback), "Feedback submitted");
    setActiveFeedbackId("");
  };
  return <div className="space-y-6">
    <PageHeader title="Interviews" description="Schedule, manage, score, and track candidate interviews" />
    {loading ? <div className="flex min-h-[280px] items-center justify-center rounded-xl border border-border"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading interviews...</div> : error ? <EmptyState icon={CalendarClock} title="Could not load interviews" description={error} action={{ label: "Try again", onClick: load }} /> : <>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Upcoming</p><p className="text-2xl font-bold">{analytics?.upcoming || 0}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Today</p><p className="text-2xl font-bold">{analytics?.today || 0}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Total</p><p className="text-2xl font-bold">{interviews.length}</p></CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Plus className="h-5 w-5 text-primary" />Schedule interview</CardTitle></CardHeader>
        <CardContent className="grid gap-3 lg:grid-cols-3">
          <Select value={form.applicationId} onValueChange={(value) => patch("applicationId", value)}><SelectTrigger><SelectValue placeholder="Applicant" /></SelectTrigger><SelectContent>{applicants.map((item) => <SelectItem key={item._id} value={item._id}>{item.candidate.name} - {item.job.title}</SelectItem>)}</SelectContent></Select>
          <Input value={form.title} onChange={(event) => patch("title", event.target.value)} placeholder="Interview title" />
          <Input type="datetime-local" value={form.scheduledAt} onChange={(event) => patch("scheduledAt", event.target.value)} />
          <Select value={form.stage} onValueChange={(value) => patch("stage", value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["hr", "technical", "managerial", "behavioral", "final", "custom"].map((item) => <SelectItem key={item} value={item}>{label(item)}</SelectItem>)}</SelectContent></Select>
          <Select value={form.mode} onValueChange={(value) => patch("mode", value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["google_meet", "zoom", "microsoft_teams", "phone", "office", "custom"].map((item) => <SelectItem key={item} value={item}>{label(item)}</SelectItem>)}</SelectContent></Select>
          <Input value={form.duration} onChange={(event) => patch("duration", event.target.value)} type="number" min="15" max="480" placeholder="Duration" />
          <Input value={form.meetingLink} onChange={(event) => patch("meetingLink", event.target.value)} placeholder="Meeting link" />
          <Input value={form.location} onChange={(event) => patch("location", event.target.value)} placeholder="Location" />
          <Input value={form.timezone} onChange={(event) => patch("timezone", event.target.value)} placeholder="Timezone" />
          <Button className="lg:col-span-3" onClick={() => void schedule()} disabled={!form.applicationId || !form.scheduledAt}>Schedule Interview</Button>
        </CardContent>
      </Card>
      <div className="grid gap-4 xl:grid-cols-2">
        {interviews.map((interview) => <Card key={interview._id}>
          <CardContent className="space-y-4 p-5">
            <div className="flex items-start justify-between gap-3"><div><p className="font-semibold">{interview.title}</p><p className="text-sm text-muted-foreground">{interview.candidate?.name || "Candidate"} - {interview.job?.title || "Role"} - {formatDate(interview.scheduledAt)}</p></div><Badge className="capitalize">{label(interview.status)}</Badge></div>
            <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-3"><p>{label(interview.stage)}</p><p>{label(interview.mode)}</p><p>{interview.score}/10 score</p></div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" asChild><a href={interviewCalendarUrl(interview._id)}><Download className="mr-2 h-4 w-4" />ICS</a></Button>
              <Button variant="outline" size="sm" onClick={() => void run(() => duplicateInterview(interview._id), "Interview duplicated")}><Copy className="mr-2 h-4 w-4" />Duplicate</Button>
              <Button variant="outline" size="sm" onClick={() => void run(() => rescheduleInterview(interview._id, { scheduledAt: new Date(Date.now() + 86400000).toISOString() }), "Interview rescheduled")}><RotateCcw className="mr-2 h-4 w-4" />+1 day</Button>
              <Button variant="outline" size="sm" className="text-destructive" onClick={() => void run(() => cancelInterview(interview._id, "Cancelled by recruiter"), "Interview cancelled")}><XCircle className="mr-2 h-4 w-4" />Cancel</Button>
              <Button size="sm" onClick={() => setActiveFeedbackId(activeFeedbackId === interview._id ? "" : interview._id)}><Star className="mr-2 h-4 w-4" />Feedback</Button>
            </div>
            {activeFeedbackId === interview._id && <div className="grid gap-2 rounded-lg border border-border p-3 sm:grid-cols-2">
              {["technicalScore", "communication", "problemSolving", "cultureFit"].map((key) => <Input key={key} type="number" min="0" max="10" value={feedback[key]} onChange={(event) => setFeedback((current) => ({ ...current, [key]: event.target.value }))} placeholder={label(key)} />)}
              <Select value={feedback.recommendation} onValueChange={(value) => setFeedback((current) => ({ ...current, recommendation: value }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["strong_hire", "hire", "hold", "reject"].map((item) => <SelectItem key={item} value={item}>{label(item)}</SelectItem>)}</SelectContent></Select>
              <Textarea className="sm:col-span-2" value={feedback.comments} onChange={(event) => setFeedback((current) => ({ ...current, comments: event.target.value }))} placeholder="Comments" />
              <Button className="sm:col-span-2" onClick={() => void sendFeedback(interview._id)}>Submit feedback</Button>
            </div>}
          </CardContent>
        </Card>)}
        {!interviews.length && <EmptyState icon={CalendarClock} title="No interviews scheduled" description="Schedule from an applicant above." />}
      </div>
    </>}
  </div>;
};

export default InterviewManagement;
