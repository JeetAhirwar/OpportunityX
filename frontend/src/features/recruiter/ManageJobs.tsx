import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  Briefcase,
  Edit,
  Users,
  MoreVertical,
  Eye,
  XCircle,
  PlusCircle,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import PageHeader from "@/components/common/PageHeader";
import StatusBadge from "@/components/common/StatusBadge";
import EmptyState from "@/components/common/EmptyState";
import { apiUrl } from "@/services/api";

interface Job {
  _id: string;
  title: string;
  location: string;
  jobType: string;
  status: string;
  applicantCount: number;
  views: number;
  createdAt: string;
}

const ManageJobs = () => {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem("ox_token");

        const { data } = await axios.get(
          apiUrl("/api/jobs/my"),
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setJobs(data.data || []);
      } catch (error) {
        console.error("Failed to fetch jobs", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // ðŸ”¥ Close Job Handler
  const handleCloseJob = async (id: string) => {
    try {
      const token = localStorage.getItem("ox_token");

      await axios.patch(
        apiUrl(`/api/jobs/${id}/status`),
        { status: "closed" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setJobs((prev) =>
        prev.map((job) =>
          job._id === id ? { ...job, status: "closed" } : job
        )
      );
    } catch (error) {
      console.error("Failed to update job status", error);
    }
  };

  const filtered =
    filter === "all"
      ? jobs
      : jobs.filter((j) => j.status.toLowerCase() === filter);

  if (loading) {
    return <div className="p-6">Loading jobs...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <PageHeader
        title="Manage Jobs"
        description="View and manage your job postings"
        action={{
          label: "Post Job",
          icon: PlusCircle,
          onClick: () => navigate("/recruiter/post-job"),
        }}
      >
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </PageHeader>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No jobs found"
          description="Create your first job posting to start receiving applications."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((job) => (
            <Card key={job._id} className="transition-shadow hover:shadow-md">
              <CardContent className="p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-display font-semibold">
                        {job.title}
                      </h3>
                      <StatusBadge status={job.status} />
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {job.location} Â· {job.jobType} Â· Posted{" "}
                      {new Date(job.createdAt).toLocaleDateString()}
                    </p>

                    <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {job.applicantCount} applicants
                      </span>

                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {job.views} views
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        navigate(`/recruiter/applicants/${job._id}`)
                      }
                    >
                      <Users className="mr-1 h-3 w-3" />
                      Applicants
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            navigate(`/recruiter/edit-job/${job._id}`)
                          }
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() =>
                            navigate(`/jobs/${job._id}`)
                          }
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Preview
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          disabled={job.status === "closed"}
                          className="text-destructive"
                          onClick={() => handleCloseJob(job._id)}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Close Job
                        </DropdownMenuItem>
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

