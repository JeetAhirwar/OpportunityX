import { useState } from "react";
import { motion } from "framer-motion";
import { Users, UserCheck, UserX, MessageSquare, FileText, X, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
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
}

const mockApplicants: Applicant[] = [
  { id: "1", name: "Alice Johnson", email: "alice@email.com", status: "Applied", appliedDate: "Feb 10, 2026", skills: ["React", "TypeScript", "Node.js"], experience: "5 years", notes: "" },
  { id: "2", name: "Bob Smith", email: "bob@email.com", status: "Shortlisted", appliedDate: "Feb 8, 2026", skills: ["Vue", "Python", "AWS"], experience: "3 years", notes: "Strong backend skills" },
  { id: "3", name: "Carol Davis", email: "carol@email.com", status: "Interview", appliedDate: "Feb 5, 2026", skills: ["React", "GraphQL", "Docker"], experience: "7 years", notes: "Scheduled for Feb 20" },
  { id: "4", name: "Dan Wilson", email: "dan@email.com", status: "Rejected", appliedDate: "Feb 3, 2026", skills: ["Angular", "Java"], experience: "2 years", notes: "Not enough experience" },
];

const ApplicantManagement = () => {
  const [applicants, setApplicants] = useState(mockApplicants);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedNote, setSelectedNote] = useState<{ id: string; note: string } | null>(null);

  const filtered = statusFilter === "all" ? applicants : applicants.filter((a) => a.status.toLowerCase() === statusFilter);

  const updateStatus = (id: string, status: string) => {
    // API: api.patch(`/recruiter/applicants/${id}`, { status })
    setApplicants((prev) => prev.map((a) => a.id === id ? { ...a, status } : a));
  };

  const saveNote = (id: string, note: string) => {
    setApplicants((prev) => prev.map((a) => a.id === id ? { ...a, notes: note } : a));
    setSelectedNote(null);
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
                      <SheetContent>
                        <SheetHeader><SheetTitle>{applicant.name}</SheetTitle></SheetHeader>
                        <div className="mt-6 space-y-4">
                          <div><p className="text-sm text-muted-foreground">Email</p><p className="font-medium">{applicant.email}</p></div>
                          <div><p className="text-sm text-muted-foreground">Experience</p><p className="font-medium">{applicant.experience}</p></div>
                          <div><p className="text-sm text-muted-foreground">Skills</p><div className="flex flex-wrap gap-1 mt-1">{applicant.skills.map((s) => <Badge key={s} variant="secondary">{s}</Badge>)}</div></div>
                          <div><p className="text-sm text-muted-foreground">Applied</p><p className="font-medium">{applicant.appliedDate}</p></div>
                          <div><p className="text-sm text-muted-foreground">Status</p><StatusBadge status={applicant.status} /></div>
                          {applicant.notes && <div><p className="text-sm text-muted-foreground">Notes</p><p className="text-sm">{applicant.notes}</p></div>}
                          <Button variant="outline" className="w-full"><FileText className="mr-2 h-4 w-4" /> View Resume</Button>
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
                  <Button variant="outline" size="sm" onClick={() => setSelectedNote({ id: applicant.id, note: applicant.notes })}>
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {selectedNote?.id === applicant.id && (
                <div className="mt-4 space-y-2 border-t border-border pt-4">
                  <Textarea placeholder="Add notes about this candidate..." value={selectedNote.note} onChange={(e) => setSelectedNote({ ...selectedNote, note: e.target.value })} rows={2} />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => saveNote(applicant.id, selectedNote.note)} className="gradient-primary border-0">Save</Button>
                    <Button size="sm" variant="outline" onClick={() => setSelectedNote(null)}>Cancel</Button>
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
