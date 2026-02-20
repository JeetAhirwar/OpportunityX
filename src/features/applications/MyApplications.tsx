import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Filter, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import PageHeader from "@/components/common/PageHeader";
import StatusBadge from "@/components/common/StatusBadge";
import EmptyState from "@/components/common/EmptyState";
import type { Application } from "@/types";

const timelineSteps = ["Applied", "Reviewed", "Shortlisted", "Interview", "Offer"];

const mockApps: Application[] = [
  { id: "1", jobId: "j1", jobTitle: "Senior React Developer", company: "TechCorp", location: "San Francisco, CA", salary: "$150K-$200K", status: "Interview", appliedDate: "Jan 15, 2026", timeline: [
    { step: "Applied", date: "Jan 15", completed: true }, { step: "Reviewed", date: "Jan 18", completed: true }, { step: "Shortlisted", date: "Jan 22", completed: true }, { step: "Interview", date: "Feb 5", completed: true }, { step: "Offer", date: "", completed: false },
  ]},
  { id: "2", jobId: "j2", jobTitle: "Full Stack Engineer", company: "StartupXYZ", location: "Remote", salary: "$120K-$160K", status: "Reviewed", appliedDate: "Jan 10, 2026", timeline: [
    { step: "Applied", date: "Jan 10", completed: true }, { step: "Reviewed", date: "Jan 14", completed: true }, { step: "Shortlisted", date: "", completed: false }, { step: "Interview", date: "", completed: false }, { step: "Offer", date: "", completed: false },
  ]},
  { id: "3", jobId: "j3", jobTitle: "Frontend Lead", company: "ScaleUp Inc", location: "Bengaluru", salary: "₹30L-₹45L", status: "Applied", appliedDate: "Jan 5, 2026", timeline: [
    { step: "Applied", date: "Jan 5", completed: true }, { step: "Reviewed", date: "", completed: false }, { step: "Shortlisted", date: "", completed: false }, { step: "Interview", date: "", completed: false }, { step: "Offer", date: "", completed: false },
  ]},
  { id: "4", jobId: "j4", jobTitle: "UI/UX Developer", company: "DesignCo", location: "New York, NY", salary: "$110K-$140K", status: "Shortlisted", appliedDate: "Dec 28, 2025", timeline: [
    { step: "Applied", date: "Dec 28", completed: true }, { step: "Reviewed", date: "Jan 2", completed: true }, { step: "Shortlisted", date: "Jan 8", completed: true }, { step: "Interview", date: "", completed: false }, { step: "Offer", date: "", completed: false },
  ]},
  { id: "5", jobId: "j5", jobTitle: "Software Engineer", company: "BigTech", location: "Seattle, WA", salary: "$160K-$210K", status: "Rejected", appliedDate: "Dec 20, 2025", timeline: [
    { step: "Applied", date: "Dec 20", completed: true }, { step: "Reviewed", date: "Dec 26", completed: true }, { step: "Shortlisted", date: "", completed: false }, { step: "Interview", date: "", completed: false }, { step: "Offer", date: "", completed: false },
  ]},
];

const ITEMS_PER_PAGE = 10;

const MyApplications = () => {
  const [filter, setFilter] = useState("all");
  const [apps, setApps] = useState(mockApps);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const filtered = filter === "all" ? apps : apps.filter((a) => a.status.toLowerCase() === filter);
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleWithdraw = (id: string) => {
    // API: api.patch(`/candidate/applications/${id}/withdraw`)
    setApps((prev) => prev.map((a) => a.id === id ? { ...a, status: "Withdrawn" as Application["status"] } : a));
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader title="My Applications" description="Track all your job applications">
        <Select value={filter} onValueChange={(v) => { setFilter(v); setPage(1); }}>
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

      {paginated.length === 0 ? (
        <EmptyState icon={Briefcase} title="No applications found" description="No applications match this filter." action={{ label: "Browse Jobs", onClick: () => (window.location.href = "/jobs") }} />
      ) : (
        <div className="space-y-3">
          {paginated.map((app) => (
            <Card key={app.id} className="transition-shadow hover:shadow-md">
              <CardContent className="p-0">
                {/* Main Row */}
                <div
                  className="flex flex-col gap-3 p-5 cursor-pointer sm:flex-row sm:items-center sm:justify-between"
                  onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-semibold truncate">{app.jobTitle}</p>
                    <p className="text-sm text-muted-foreground">{app.company} · {app.location}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground hidden sm:inline">{app.appliedDate}</span>
                    <StatusBadge status={app.status} />
                    {expandedId === app.id ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </div>

                {/* Expanded */}
                <AnimatePresence>
                  {expandedId === app.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="border-t border-border px-5 py-4 space-y-4">
                        {/* Timeline */}
                        <div>
                          <p className="text-xs font-medium uppercase text-muted-foreground mb-3">Application Timeline</p>
                          <div className="flex items-center gap-1">
                            {timelineSteps.map((step, i) => {
                              const t = app.timeline.find((t) => t.step === step);
                              const completed = t?.completed || false;
                              return (
                                <div key={step} className="flex items-center flex-1">
                                  <div className="flex flex-col items-center flex-1">
                                    <div className={`h-3 w-3 rounded-full ${completed ? "bg-primary" : "bg-muted"}`} />
                                    <span className={`text-[10px] mt-1 ${completed ? "text-foreground font-medium" : "text-muted-foreground"}`}>{step}</span>
                                    {t?.date && <span className="text-[9px] text-muted-foreground">{t.date}</span>}
                                  </div>
                                  {i < timelineSteps.length - 1 && (
                                    <div className={`h-0.5 flex-1 -mt-4 ${completed ? "bg-primary" : "bg-muted"}`} />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Details + Actions */}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">{app.salary}</span> · Applied {app.appliedDate}
                          </div>
                          {app.status !== "Withdrawn" && app.status !== "Rejected" && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10">
                                  <AlertTriangle className="mr-1.5 h-3.5 w-3.5" /> Withdraw
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Withdraw Application?</AlertDialogTitle>
                                  <AlertDialogDescription>This will withdraw your application for <strong>{app.jobTitle}</strong> at <strong>{app.company}</strong>. This action cannot be undone.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleWithdraw(app.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Withdraw</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
          {Array.from({ length: totalPages }, (_, i) => (
            <Button key={i + 1} variant={page === i + 1 ? "default" : "outline"} size="sm" onClick={() => setPage(i + 1)}>{i + 1}</Button>
          ))}
          <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      )}
    </motion.div>
  );
};

export default MyApplications;
