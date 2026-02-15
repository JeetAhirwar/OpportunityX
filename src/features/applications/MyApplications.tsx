import { useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageHeader from "@/components/common/PageHeader";
import StatusBadge from "@/components/common/StatusBadge";
import EmptyState from "@/components/common/EmptyState";

interface Application {
  id: string;
  jobTitle: string;
  company: string;
  status: string;
  appliedDate: string;
}

const mockApps: Application[] = [
  { id: "1", jobTitle: "Senior React Developer", company: "TechCorp", status: "Interview", appliedDate: "Jan 15, 2026" },
  { id: "2", jobTitle: "Full Stack Engineer", company: "StartupXYZ", status: "Reviewed", appliedDate: "Jan 10, 2026" },
  { id: "3", jobTitle: "Frontend Lead", company: "ScaleUp Inc", status: "Applied", appliedDate: "Jan 5, 2026" },
  { id: "4", jobTitle: "UI/UX Developer", company: "DesignCo", status: "Shortlisted", appliedDate: "Dec 28, 2025" },
  { id: "5", jobTitle: "Software Engineer", company: "BigTech", status: "Rejected", appliedDate: "Dec 20, 2025" },
];

const MyApplications = () => {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? mockApps : mockApps.filter((a) => a.status.toLowerCase() === filter);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader title="My Applications" description="Track all your job applications">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[160px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="applied">Applied</SelectItem>
            <SelectItem value="reviewed">Reviewed</SelectItem>
            <SelectItem value="shortlisted">Shortlisted</SelectItem>
            <SelectItem value="interview">Interview</SelectItem>
            <SelectItem value="offer">Offer</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </PageHeader>

      {filtered.length === 0 ? (
        <EmptyState icon={Briefcase} title="No applications found" description="You haven't applied to any jobs matching this filter yet." action={{ label: "Browse Jobs", onClick: () => window.location.href = "/jobs" }} />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-5 py-3 text-xs font-medium uppercase text-muted-foreground">Job</th>
                    <th className="px-5 py-3 text-xs font-medium uppercase text-muted-foreground">Company</th>
                    <th className="px-5 py-3 text-xs font-medium uppercase text-muted-foreground">Status</th>
                    <th className="px-5 py-3 text-xs font-medium uppercase text-muted-foreground">Applied</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((app) => (
                    <tr key={app.id} className="border-b border-border/50 transition-colors hover:bg-muted/50">
                      <td className="px-5 py-4 font-medium">{app.jobTitle}</td>
                      <td className="px-5 py-4 text-sm text-muted-foreground">{app.company}</td>
                      <td className="px-5 py-4"><StatusBadge status={app.status} /></td>
                      <td className="px-5 py-4 text-sm text-muted-foreground">{app.appliedDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};

export default MyApplications;
