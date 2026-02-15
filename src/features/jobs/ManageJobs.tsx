import { useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, Edit, Users, MoreVertical, Eye, XCircle, PlusCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageHeader from "@/components/common/PageHeader";
import StatusBadge from "@/components/common/StatusBadge";
import EmptyState from "@/components/common/EmptyState";

interface Job {
  id: string;
  title: string;
  location: string;
  type: string;
  status: string;
  applicants: number;
  views: number;
  postedDate: string;
}

const mockJobs: Job[] = [
  { id: "1", title: "Senior Frontend Engineer", location: "Remote", type: "Full-time", status: "Active", applicants: 45, views: 320, postedDate: "Jan 10, 2026" },
  { id: "2", title: "Backend Developer", location: "New York", type: "Full-time", status: "Active", applicants: 28, views: 210, postedDate: "Jan 5, 2026" },
  { id: "3", title: "Product Designer", location: "London", type: "Contract", status: "Closed", applicants: 67, views: 450, postedDate: "Dec 15, 2025" },
  { id: "4", title: "DevOps Engineer", location: "Remote", type: "Full-time", status: "Draft", applicants: 0, views: 0, postedDate: "Feb 1, 2026" },
];

const ManageJobs = () => {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? mockJobs : mockJobs.filter((j) => j.status.toLowerCase() === filter);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader title="Manage Jobs" description="View and manage your job postings" action={{ label: "Post Job", icon: PlusCircle, onClick: () => {} }}>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Filter" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </PageHeader>

      {filtered.length === 0 ? (
        <EmptyState icon={Briefcase} title="No jobs found" description="Create your first job posting to start receiving applications." />
      ) : (
        <div className="space-y-3">
          {filtered.map((job) => (
            <Card key={job.id} className="transition-shadow hover:shadow-md">
              <CardContent className="p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-display font-semibold">{job.title}</h3>
                      <StatusBadge status={job.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">{job.location} · {job.type} · Posted {job.postedDate}</p>
                    <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {job.applicants} applicants</span>
                      <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {job.views} views</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm"><Users className="mr-1 h-3 w-3" /> Applicants</Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                        <DropdownMenuItem><Eye className="mr-2 h-4 w-4" /> Preview</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive"><XCircle className="mr-2 h-4 w-4" /> Close Job</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default ManageJobs;
