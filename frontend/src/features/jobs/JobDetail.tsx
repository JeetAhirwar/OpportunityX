import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { format, formatDistanceToNow } from "date-fns";
import {
  MapPin, DollarSign, Clock, Building2, Briefcase, BookmarkPlus, Bookmark,
  Share2, ArrowLeft, CheckCircle2, Users, Calendar, Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import SEOHead from "@/components/common/SEOHead";
import { useApply, useJob, useSavedJobs, useToggleSave } from "@/hooks/useJobs";
import { useMyApplications } from "@/hooks/useApplications";
import { useAuth } from "@/store/AuthContext";
import type { Job } from "@/types";

const formatSalary = (job: Job) => {
  const { min = 0, max = 0, currency = "USD" } = job.salary || {};
  if (!min && !max) return "Salary not specified";
  const formatter = new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 0 });
  return min && max ? `${formatter.format(min)} - ${formatter.format(max)}` : formatter.format(min || max);
};

const companyInitials = (company?: string) => (company?.trim()?.slice(0, 2) || "OX").toUpperCase();
const formatWorkMode = (workMode?: string) => workMode === "onsite" ? "On-site" : workMode ? `${workMode.charAt(0).toUpperCase()}${workMode.slice(1)}` : "Work mode TBD";
const safeDateDistance = (date?: string) => {
  if (!date) return "Date unavailable";
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? "Date unavailable" : formatDistanceToNow(parsed, { addSuffix: true });
};

const JobDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const candidate = isAuthenticated && user?.role === "candidate";
  const { data: job, isLoading, isError, error, refetch } = useJob(id);
  const { data: savedJobs = [] } = useSavedJobs(candidate);
  const { data: applicationData } = useMyApplications({ limit: 100 }, candidate);
  const apply = useApply();
  const toggleSave = useToggleSave();
  const [coverLetter, setCoverLetter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [applied, setApplied] = useState(false);

  const saved = useMemo(
    () => Boolean(id && savedJobs.some((savedJob) => savedJob._id === id)),
    [id, savedJobs]
  );

  useEffect(() => {
    if (!id || !applicationData) return;
    setApplied(applicationData.applications.some((application) => {
      const jobId = typeof application.job === "string" ? application.job : application.job?._id;
      return jobId === id && application.status !== "withdrawn";
    }));
  }, [applicationData, id]);

  const requireCandidate = (action: string) => {
    if (!isAuthenticated) {
      toast({ title: "Login required", description: `Sign in as a candidate to ${action} this job.` });
      navigate("/login", { state: { from: location.pathname } });
      return false;
    }
    if (user?.role !== "candidate") {
      toast({ title: "Candidate access required", description: `Only candidates can ${action} jobs.`, variant: "destructive" });
      return false;
    }
    return true;
  };

  const openApplication = () => {
    if (requireCandidate("apply to")) setDialogOpen(true);
  };

  const handleApply = async () => {
    if (!id || !job || !requireCandidate("apply to")) return;
    try {
      await apply.mutateAsync({ jobId: id, coverLetter });
      setApplied(true);
      setDialogOpen(false);
      setCoverLetter("");
      toast({ title: "Application submitted!", description: `You've applied to ${job.title} at ${job.company}.` });
    } catch (applyError) {
      toast({
        title: "Application failed",
        description: applyError instanceof Error ? applyError.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    if (!id || !requireCandidate("save")) return;
    try {
      const result = await toggleSave.mutateAsync(id);
      toast({ title: result.saved ? "Job saved!" : "Removed from saved jobs" });
    } catch (saveError) {
      toast({
        title: "Could not update saved job",
        description: saveError instanceof Error ? saveError.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share && job) {
        await navigator.share({ title: `${job.title} at ${job.company}`, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({ title: "Job link copied" });
      }
    } catch {
      // Closing the native share dialog is not an error the user needs to see.
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto space-y-6 px-4 py-8">
          <Skeleton className="h-9 w-32" />
          <div className="grid gap-8 lg:grid-cols-3">
            <Skeleton className="h-[520px] lg:col-span-2" />
            <Skeleton className="h-80" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !job?._id) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <Briefcase className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h1 className="font-display text-2xl font-bold">Job not found</h1>
          <p className="mt-2 text-muted-foreground">{error instanceof Error ? error.message : "This job may have been removed or the link is invalid."}</p>
          <div className="mt-6 flex justify-center gap-2">
            <Button variant="outline" onClick={() => void refetch()}>Try Again</Button>
            <Button asChild><Link to="/jobs">Browse Jobs</Link></Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const salary = formatSalary(job);
  const workMode = formatWorkMode(job.workMode);
  const deadlineDate = job.deadline ? new Date(job.deadline) : null;
  const deadline = deadlineDate && !Number.isNaN(deadlineDate.getTime()) ? format(deadlineDate, "PPP") : "Not specified";
  const skills = job.skills || [];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`${job.title} at ${job.company} - OpportunityX`}
        description={`Apply for ${job.title} at ${job.company}. ${salary} - ${job.location}`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "JobPosting",
          title: job.title,
          description: job.description,
          hiringOrganization: { "@type": "Organization", name: job.company },
          jobLocation: { "@type": "Place", address: job.location },
          datePosted: job.createdAt,
          validThrough: job.deadline,
        }}
      />
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" size="sm" className="mb-6" asChild>
          <Link to="/jobs"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Jobs</Link>
        </Button>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="overflow-hidden">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 font-display text-lg font-bold text-primary">{companyInitials(job.company)}</div>
                    <div className="flex-1">
                      <h1 className="font-display text-2xl font-bold md:text-3xl">{job.title || "Untitled role"}</h1>
                      <p className="mt-1 text-lg text-muted-foreground">{job.company || "Company unavailable"}</p>
                      <div className="mt-3 flex flex-wrap gap-2">{skills.map((skill) => <Badge key={skill} variant="secondary">{skill}</Badge>)}</div>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                    {[
                      { icon: MapPin, label: job.location || "Location not specified" },
                      { icon: DollarSign, label: salary },
                      { icon: Briefcase, label: job.jobType || "Role type TBD" },
                      { icon: Clock, label: safeDateDistance(job.createdAt) },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-2 text-sm capitalize text-muted-foreground"><item.icon className="h-4 w-4" /> {item.label}</div>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    {applied ? (
                      <Button disabled className="bg-success text-success-foreground"><CheckCircle2 className="mr-2 h-4 w-4" /> Applied</Button>
                    ) : (
                      <Button onClick={openApplication}>Apply Now</Button>
                    )}
                    <Button variant="outline" onClick={() => void handleSave()} disabled={toggleSave.isPending}>
                      {saved ? <Bookmark className="mr-2 h-4 w-4 fill-current" /> : <BookmarkPlus className="mr-2 h-4 w-4" />}
                      {saved ? "Saved" : "Save"}
                    </Button>
                    <Button variant="outline" onClick={() => void handleShare()}><Share2 className="mr-2 h-4 w-4" /> Share</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <Card>
              <CardContent className="space-y-6 p-6 md:p-8">
                <div><h2 className="mb-3 font-display text-xl font-semibold">About the Role</h2><p className="whitespace-pre-line leading-relaxed text-muted-foreground">{job.description}</p></div>
                <Separator />
                <div>
                  <h2 className="mb-3 font-display text-xl font-semibold">Role Details</h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      ["Experience level", job.experienceLevel],
                      ["Work mode", workMode],
                      ["Job type", job.jobType],
                      ["Application deadline", deadline],
                    ].map(([label, value]) => <div key={label} className="rounded-lg border border-border/70 bg-secondary/60 p-3"><p className="text-xs uppercase text-muted-foreground">{label}</p><p className="mt-1 font-medium capitalize">{value}</p></div>)}
                  </div>
                </div>
                {skills.length > 0 && <><Separator /><div><h2 className="mb-3 font-display text-xl font-semibold">Required Skills</h2><div className="flex flex-wrap gap-2">{skills.map((skill) => <Badge key={skill} variant="outline">{skill}</Badge>)}</div></div></>}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4 font-display font-semibold">About {job.company}</h3>
                <p className="mb-4 text-sm text-muted-foreground">This opportunity was posted by {job.postedBy?.name || "the recruiting team"}.</p>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-muted-foreground"><Building2 className="h-4 w-4" /> Recruiter</span><span className="font-medium">{job.postedBy?.name || "Not specified"}</span></div>
                  {job.postedBy?.email && <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-muted-foreground"><Mail className="h-4 w-4" /> Contact</span><span className="max-w-[160px] truncate font-medium">{job.postedBy.email}</span></div>}
                  <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-4 w-4" /> Deadline</span><span className="font-medium">{deadline}</span></div>
                </div>
              </CardContent>
            </Card>
            <Card><CardContent className="p-6 text-center"><Users className="mx-auto mb-2 h-8 w-8 text-muted-foreground" /><p className="font-display text-2xl font-bold">{job.applicantCount || 0}</p><p className="text-sm text-muted-foreground">applicants so far</p><p className="mt-2 text-xs text-muted-foreground">{job.views || 0} views</p></CardContent></Card>
            <Card className="gradient-primary">
              <CardContent className="p-6 text-center">
                <h3 className="mb-2 font-display font-semibold text-primary-foreground">Ready to apply?</h3>
                <p className="mb-4 text-sm text-primary-foreground/70">Submit your application now</p>
                {applied ? <Button variant="secondary" className="w-full" disabled><CheckCircle2 className="mr-2 h-4 w-4" /> Applied</Button> : <Button variant="secondary" className="w-full" onClick={openApplication}>Apply Now</Button>}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Apply to {job.title}</DialogTitle><DialogDescription>at {job.company} - {job.location}</DialogDescription></DialogHeader>
          <div className="space-y-3"><p className="text-sm text-muted-foreground">Your profile and resume will be shared with the recruiter.</p><Textarea placeholder="Cover letter (optional) - Tell the recruiter why you're a great fit..." value={coverLetter} onChange={(event) => setCoverLetter(event.target.value)} rows={5} /></div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button onClick={() => void handleApply()} disabled={apply.isPending}>{apply.isPending ? "Submitting..." : "Submit Application"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <Footer />
    </div>
  );
};

export default JobDetail;
