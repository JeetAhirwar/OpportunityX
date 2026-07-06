import { useEffect, useState } from "react";
import { CalendarDays, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import { getInterviewAnalytics, listInterviews, normalizeInterviewPage } from "@/services/interviewApi";

const formatDate = (value) => value ? new Date(value).toLocaleString() : "Time unavailable";
const label = (value) => String(value || "").replace(/_/g, " ");

const AdminInterviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    Promise.all([listInterviews({ limit: 100 }).then((response) => normalizeInterviewPage(response).interviews), getInterviewAnalytics()])
      .then(([items, stats]) => { setInterviews(items); setAnalytics(stats); })
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Could not load interviews"))
      .finally(() => setLoading(false));
  }, []);
  return <div className="space-y-6">
    <PageHeader title="Interview Oversight" description="Platform-wide interview lifecycle and quality signals" />
    {loading ? <div className="flex min-h-[260px] items-center justify-center rounded-xl border border-border"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading interviews...</div> : error ? <EmptyState icon={CalendarDays} title="Could not load interviews" description={error} /> : <>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Upcoming</p><p className="text-2xl font-bold">{analytics?.upcoming || 0}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Today</p><p className="text-2xl font-bold">{analytics?.today || 0}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Total</p><p className="text-2xl font-bold">{interviews.length}</p></CardContent></Card>
      </div>
      <Card><CardContent className="space-y-3 p-5">
        {interviews.map((interview) => <div key={interview._id} className="flex flex-col gap-2 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="font-medium">{interview.title}</p><p className="text-sm text-muted-foreground">{interview.candidate?.name || "Candidate"} - {interview.job?.title || "Role"} - {formatDate(interview.scheduledAt)}</p></div>
          <div className="flex flex-wrap gap-2"><Badge className="capitalize">{label(interview.status)}</Badge><Badge variant="outline" className="capitalize">{label(interview.stage)}</Badge><Badge variant="secondary">{interview.score}/10</Badge></div>
        </div>)}
        {!interviews.length && <p className="text-sm text-muted-foreground">No interviews found.</p>}
      </CardContent></Card>
    </>}
  </div>;
};

export default AdminInterviews;
