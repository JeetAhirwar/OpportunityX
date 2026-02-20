import { useState } from "react";
import { motion } from "framer-motion";
import { Users, MessageSquare, FileText, Download, X, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/common/PageHeader";
import StatusBadge from "@/components/common/StatusBadge";

interface Applicant {
  id: string;
  name: string;
  email: string;
  status: string;
  appliedDate: string;
  skills: string[];
  experience: string;
  notes: string;
  title: string;
  location: string;
  education: string;
  resumeUrl: string;
  bio: string;
}

const mockApplicants: Applicant[] = [
  { id: "1", name: "Alice Johnson", email: "alice@email.com", status: "Applied", appliedDate: "Feb 10, 2026", skills: ["React", "TypeScript", "Node.js"], experience: "5 years", notes: "", title: "Full Stack Developer", location: "San Francisco, CA", education: "B.S. Computer Science, Stanford", resumeUrl: "#", bio: "Passionate developer with 5 years building scalable web apps." },
  { id: "2", name: "Bob Smith", email: "bob@email.com", status: "Shortlisted", appliedDate: "Feb 8, 2026", skills: ["Vue", "Python", "AWS"], experience: "3 years", notes: "Strong backend skills", title: "Backend Engineer", location: "Austin, TX", education: "M.S. Data Science, UT Austin", resumeUrl: "#", bio: "Backend specialist focusing on cloud-native architectures." },
  { id: "3", name: "Carol Davis", email: "carol@email.com", status: "Interview", appliedDate: "Feb 5, 2026", skills: ["React", "GraphQL", "Docker"], experience: "7 years", notes: "Scheduled for Feb 20", title: "Senior Frontend Engineer", location: "Remote", education: "B.Tech, IIT Bombay", resumeUrl: "#", bio: "Senior engineer with expertise in design systems and performance." },
  { id: "4", name: "Dan Wilson", email: "dan@email.com", status: "Rejected", appliedDate: "Feb 3, 2026", skills: ["Angular", "Java"], experience: "2 years", notes: "Not enough experience", title: "Junior Developer", location: "Chicago, IL", education: "B.S. IT, DePaul University", resumeUrl: "#", bio: "Eager junior developer looking to grow in enterprise applications." },
];

const ApplicantManagement = () => {
  const { toast } = useToast();
  const [applicants, setApplicants] = useState(mockApplicants);
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");

  const filtered = statusFilter === "all" ? applicants : applicants.filter((a) => a.status.toLowerCase() === statusFilter);

  const updateStatus = (id: string, status: string) => {
    // API: api.patch(`/recruiter/applicants/${id}`, { status })
    setApplicants((prev) => prev.map((a) => a.id === id ? { ...a, status } : a));
  };

  const saveNote = (id: string) => {
    setApplicants((prev) => prev.map((a) => a.id === id ? { ...a, notes: noteText } : a));
    setEditingNoteId(null);
    toast({ title: "Note saved" });
  };

  const handleDownloadResume = (applicant: Applicant) => {
    // API: window.open(api.baseUrl + `/recruiter/applicants/${applicant.id}/resume`)
    toast({ title: "Downloading resume", description: `${applicant.name}'s resume` });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader title="Applicant Management" description="Review and manage candidates for your postings">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Filter" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="applied">Applied</SelectItem>
            <SelectItem value="shortlisted">Shortlisted</SelectItem>
            <SelectItem value="interview">Interview</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </PageHeader>

      <div className="space-y-3">
        {filtered.map((applicant) => (
          <Card key={applicant.id} className="transition-shadow hover:shadow-md">
            <CardContent className="p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {applicant.name.charAt(0)}
                  </div>
                  <div>
                    <Sheet>
                      <SheetTrigger asChild>
                        <button className="font-display font-semibold hover:text-primary transition-colors text-left">{applicant.name}</button>
                      </SheetTrigger>
                      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                        <SheetHeader><SheetTitle>Candidate Profile</SheetTitle></SheetHeader>
                        <div className="mt-6 space-y-5">
                          {/* Profile Header */}
                          <div className="flex items-center gap-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                              {applicant.name.charAt(0)}
                            </div>
                            <div>
                              <h3 className="font-display text-lg font-semibold">{applicant.name}</h3>
                              <p className="text-sm text-muted-foreground">{applicant.title}</p>
                              <p className="text-xs text-muted-foreground">{applicant.location}</p>
                            </div>
                          </div>

                          <Separator />

                          {/* Bio */}
                          <div>
                            <p className="text-xs font-medium uppercase text-muted-foreground mb-1">About</p>
                            <p className="text-sm">{applicant.bio}</p>
                          </div>

                          {/* Details */}
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-xs font-medium uppercase text-muted-foreground">Email</p>
                              <p className="text-sm font-medium">{applicant.email}</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium uppercase text-muted-foreground">Experience</p>
                              <p className="text-sm font-medium">{applicant.experience}</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium uppercase text-muted-foreground">Education</p>
                              <p className="text-sm font-medium">{applicant.education}</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium uppercase text-muted-foreground">Applied</p>
                              <p className="text-sm font-medium">{applicant.appliedDate}</p>
                            </div>
                          </div>

                          {/* Skills */}
                          <div>
                            <p className="text-xs font-medium uppercase text-muted-foreground mb-2">Skills</p>
                            <div className="flex flex-wrap gap-1">{applicant.skills.map((s) => <Badge key={s} variant="secondary">{s}</Badge>)}</div>
                          </div>

                          {/* Status */}
                          <div>
                            <p className="text-xs font-medium uppercase text-muted-foreground mb-1">Status</p>
                            <StatusBadge status={applicant.status} />
                          </div>

                          {/* Notes */}
                          {applicant.notes && (
                            <div>
                              <p className="text-xs font-medium uppercase text-muted-foreground mb-1">Notes</p>
                              <p className="text-sm rounded-lg bg-muted p-3">{applicant.notes}</p>
                            </div>
                          )}

                          <Separator />

                          {/* Actions */}
                          <Button variant="outline" className="w-full" onClick={() => handleDownloadResume(applicant)}>
                            <Download className="mr-2 h-4 w-4" /> Download Resume
                          </Button>
                        </div>
                      </SheetContent>
                    </Sheet>
                    <p className="text-sm text-muted-foreground">{applicant.email} · {applicant.experience} · {applicant.appliedDate}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {applicant.skills.map((s) => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={applicant.status.toLowerCase()} onValueChange={(v) => updateStatus(applicant.id, v.charAt(0).toUpperCase() + v.slice(1))}>
                    <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="applied">Applied</SelectItem>
                      <SelectItem value="shortlisted">Shortlisted</SelectItem>
                      <SelectItem value="interview">Interview</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={() => handleDownloadResume(applicant)} title="Download Resume">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { setEditingNoteId(applicant.id); setNoteText(applicant.notes); }}>
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {editingNoteId === applicant.id && (
                <div className="mt-4 space-y-2 border-t border-border pt-4">
                  <Textarea placeholder="Add notes about this candidate..." value={noteText} onChange={(e) => setNoteText(e.target.value)} rows={2} />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => saveNote(applicant.id)} className="gradient-primary border-0">Save</Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingNoteId(null)}>Cancel</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
};

export default ApplicantManagement;
