import { useEffect, useState } from "react";
import { CalendarDays, CheckCircle2, Download, ExternalLink, Loader2, RotateCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import { interviewCalendarUrl, listInterviews, normalizeInterviewPage, respondToInterview } from "@/services/interviewApi";
import { useToast } from "@/hooks/use-toast";

const formatDate = (value) => value ? new Date(value).toLocaleString() : "Time unavailable";
const label = (value) => String(value || "").replace(/_/g, " ");

const CandidateInterviews = () => {
  const { toast } = useToast();
  const [data, setData] = useState({ interviews: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reason, setReason] = useState("");
  const load = () => {
    setLoading(true);
    listInterviews({ limit: 50 })
      .then((response) => setData(normalizeInterviewPage(response)))
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Could not load interviews"))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);
  const respond = async (interview, action) => {
    try {
      await respondToInterview(interview._id, { action, reason });
      setReason("");
      toast({ title: action === "accept" ? "Interview accepted" : "Reschedule requested" });
      load();
    } catch (requestError) {
      toast({ title: "Could not update interview", description: requestError instanceof Error ? requestError.message : "Unknown error", variant: "destructive" });
    }
  };
  const upcoming = data.interviews.filter((item) => new Date(item.scheduledAt) >= new Date() && item.status !== "cancelled");
  const history = data.interviews.filter((item) => !upcoming.includes(item));
  return <div className="space-y-6">
    <PageHeader title="Interviews" description="Manage interview invitations, meeting links, calendar invites, and history" />
    {loading ? <div className="flex min-h-[260px] items-center justify-center rounded-xl border border-border"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading interviews...</div> : error ? <EmptyState icon={CalendarDays} title="Could not load interviews" description={error} action={{ label: "Try again", onClick: load }} /> : !data.interviews.length ? <EmptyState icon={CalendarDays} title="No interviews yet" description="Scheduled interviews will appear here." /> : <>
      <div className="grid gap-4 lg:grid-cols-2">
        {upcoming.map((interview) => <Card key={interview._id}>
          <CardContent className="space-y-4 p-5">
            <div className="flex items-start justify-between gap-3">
              <div><p className="font-semibold">{interview.title}</p><p className="text-sm text-muted-foreground">{interview.job?.title || "Role unavailable"} - {formatDate(interview.scheduledAt)}</p></div>
              <Badge className="capitalize">{label(interview.status)}</Badge>
            </div>
            <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
              <p>Mode: {label(interview.mode)}</p><p>Duration: {interview.duration} min</p><p>Timezone: {interview.timezone}</p><p>Stage: {label(interview.customStage || interview.stage)}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {interview.meetingLink && <Button variant="outline" size="sm" asChild><a href={interview.meetingLink} target="_blank" rel="noreferrer"><ExternalLink className="mr-2 h-4 w-4" />Meeting</a></Button>}
              <Button size="sm" onClick={() => void respond(interview, "accept")} disabled={interview.status === "confirmed"}><CheckCircle2 className="mr-2 h-4 w-4" />Accept</Button>
              <Button variant="outline" size="sm" asChild><a href={interviewCalendarUrl(interview._id)}><Download className="mr-2 h-4 w-4" />Calendar</a></Button>
            </div>
            <div className="flex gap-2">
              <Input value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Reason for reschedule" />
              <Button variant="outline" size="sm" onClick={() => void respond(interview, "request_reschedule")}><RotateCcw className="h-4 w-4" /></Button>
            </div>
          </CardContent>
        </Card>)}
        {!upcoming.length && <p className="text-sm text-muted-foreground">No upcoming interviews.</p>}
      </div>
      <Card><CardContent className="space-y-2 p-5"><p className="font-semibold">Interview history</p>{history.map((interview) => <div key={interview._id} className="rounded-lg border border-border p-3 text-sm"><span className="font-medium">{interview.title}</span><span className="text-muted-foreground"> - {formatDate(interview.scheduledAt)} - {label(interview.status)}</span></div>)}{!history.length && <p className="text-sm text-muted-foreground">No interview history yet.</p>}</CardContent></Card>
    </>}
  </div>;
};

export default CandidateInterviews;
