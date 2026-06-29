import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import
  {
    Search,
    MapPin,
    ArrowRight,
    Briefcase,
    Building2,
    CheckCircle2,
    Upload,
    Brain,
    MessageSquare,
    Zap,
    BookmarkPlus,
    ChevronRight,
    ShieldCheck,
    ClipboardCheck,
    Sparkles,
    Bot,
    Lock,
    BarChart3,
    Radio,
    FileSearch,
  } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import api from "@/services/api";
import { normalizeJobsResponse } from "@/hooks/useJobs";

type FeaturedJob = {
  _id: string;
  title?: string;
  company?: string;
  location?: string;
  jobType?: string;
  workMode?: string;
  salary?: { currency?: string; min?: number; max?: number };
  skills?: string[];
  experienceLevel?: string;
  deadline?: string;
  createdAt?: string;
};

type PlatformMetrics = {
  activeJobs: number | null;
  featuredJobs: number;
};

const initials = (value?: string) => (value?.trim()?.slice(0, 2) || "OX").toUpperCase();

const formatSalary = (salary?: FeaturedJob["salary"]) => {
  if (!salary?.min && !salary?.max) return "Salary not specified";
  const currency = salary.currency || "USD";
  return `${currency} ${salary.min || 0} - ${salary.max || salary.min || 0}`;
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

const candidateFlow = [
  { icon: Upload, title: "Register", desc: "Create a candidate account and start a profile." },
  { icon: FileSearch, title: "Complete profile", desc: "Add resume, skills, education, projects, and preferences." },
  { icon: BookmarkPlus, title: "Apply and track", desc: "Save roles, apply, and follow every application status." },
  { icon: MessageSquare, title: "Interview", desc: "Use recruiter chat and notifications to keep momentum." },
  { icon: CheckCircle2, title: "Get hired", desc: "Move from shortlist to offer with a clean activity trail." },
];

const recruiterFlow = [
  { icon: Building2, title: "Create company", desc: "Build a company profile with recruiter contact details." },
  { icon: ShieldCheck, title: "Verify", desc: "Submit verification before publishing live opportunities." },
  { icon: Briefcase, title: "Post jobs", desc: "Create drafts, publish verified roles, and manage status." },
  { icon: BarChart3, title: "Review pipeline", desc: "Track applicants, notes, status, and role analytics." },
  { icon: MessageSquare, title: "Hire", desc: "Open candidate conversations from real applications." },
];

const productStrengths = [
  { icon: Brain, title: "AI resume analysis", desc: "Candidate resume feedback stays advisory and never replaces recruiter judgment." },
  { icon: ClipboardCheck, title: "ATS scoring", desc: "Structured skill and fit signals help candidates improve before applying." },
  { icon: MessageSquare, title: "Real-time recruiter chat", desc: "Application-scoped conversations, unread badges, typing, attachments, and seen states." },
  { icon: ShieldCheck, title: "Verified companies", desc: "Recruiters must complete company verification before active publishing." },
  { icon: Sparkles, title: "AI recommendations", desc: "Candidate recommendations and recruiter match scoring are shown as suggestions." },
  { icon: Lock, title: "Secure role workspaces", desc: "Candidate, recruiter, and admin routes are protected by role-aware routing." },
];

const Index = () =>
{
  const [searchTitle, setSearchTitle] = useState("");
  const [searchLocation, setSearchLocation] = useState("");

  const [featuredJobs, setFeaturedJobs] = useState<FeaturedJob[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [metrics, setMetrics] = useState<PlatformMetrics>({ activeJobs: null, featuredJobs: 0 });

  useEffect(() =>
  {
    const fetchFeaturedJobs = async () =>
    {
      try
      {
        const [featuredResponse, jobsResponse] = await Promise.all([
          api.get<{ success: boolean; count?: number; data: FeaturedJob[] }>(
            "/jobs/featured",
            { skipAuth: true }
          ),
          api.get<unknown>(
            "/jobs?limit=1",
            { skipAuth: true }
          ),
        ]);
        const normalizedJobs = normalizeJobsResponse(jobsResponse);

        if (featuredResponse.success)
        {
          setFeaturedJobs(featuredResponse.data);
          setMetrics({
            activeJobs: normalizedJobs.total,
            featuredJobs: Number(featuredResponse.count ?? featuredResponse.data.length) || 0,
          });
        }
      } catch
      {
        setFeaturedJobs([]);
        setMetrics({ activeJobs: null, featuredJobs: 0 });
      } finally
      {
        setLoadingFeatured(false);
      }
    };

    fetchFeaturedJobs();
  }, []);

  const metricCards = [
    {
      icon: Briefcase,
      value: metrics.activeJobs === null ? "Live API" : metrics.activeJobs.toLocaleString(),
      label: "Active Jobs",
      note: metrics.activeJobs === null ? "Loaded from public jobs when available" : "From the public jobs API",
    },
    {
      icon: Building2,
      value: "Required",
      label: "Verified Companies",
      note: "Company verification gates active recruiter publishing",
    },
    {
      icon: Bot,
      value: "On demand",
      label: "AI Matches Generated",
      note: "Generated only when users request AI suggestions",
    },
    {
      icon: ShieldCheck,
      value: "Admin-only",
      label: "Registered Recruiters",
      note: "Protected platform metric, not exposed publicly",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60 py-16 md:py-24">
        <div className="surface-grid pointer-events-none absolute inset-0 opacity-70" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,hsl(var(--primary)_/_0.18),transparent_38%),linear-gradient(225deg,hsl(var(--accent)_/_0.12),transparent_40%)]" />

        <div className="container relative mx-auto px-4">
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <motion.div initial="hidden" animate="visible">
              <motion.div variants={fadeInUp} custom={0} className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary shadow-inner">
                <Zap className="h-3.5 w-3.5" /> AI hiring intelligence for verified opportunities
              </motion.div>
              <motion.h1 variants={fadeInUp} custom={1} className="mb-6 max-w-4xl font-display text-4xl font-bold leading-tight md:text-6xl">
                OpportunityX turns hiring signals into{" "}
                <span className="gradient-text">clear next steps</span>
              </motion.h1>
              <motion.p variants={fadeInUp} custom={2} className="mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
                Candidates discover roles, recruiters manage verified pipelines, and admins keep the platform moving inside one premium AI-powered workspace.
              </motion.p>

              <motion.div variants={fadeInUp} custom={3} className="max-w-3xl">
                <div className="glass-strong flex flex-col gap-3 rounded-lg p-3 shadow-2xl md:flex-row md:items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Job title or keyword"
                      value={searchTitle}
                      onChange={(e) => setSearchTitle(e.target.value)}
                      className="border-0 bg-transparent pl-10 shadow-none focus-visible:ring-0"
                    />
                  </div>
                  <div className="hidden h-8 w-px bg-border md:block" />
                  <div className="relative flex-1">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="City, state, or remote"
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                      className="border-0 bg-transparent pl-10 shadow-none focus-visible:ring-0"
                    />
                  </div>
                  <Button size="lg" className="px-8" asChild>
                    <Link to={`/jobs?q=${searchTitle}&location=${searchLocation}`}>
                      Search Jobs <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <Button variant="outline" className="w-full sm:w-auto" asChild>
                    <Link to="/register?role=candidate">For Candidates</Link>
                  </Button>
                  <Button variant="outline" className="w-full sm:w-auto" asChild>
                    <Link to="/register?role=recruiter">For Recruiters</Link>
                  </Button>
                </div>
              </motion.div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="relative">
              <div className="glass-strong overflow-hidden rounded-lg shadow-2xl">
                <div className="border-b border-border/70 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase text-primary">OpportunityX Command</p>
                      <p className="mt-1 font-display text-lg font-semibold">Hiring intelligence preview</p>
                    </div>
                    <span className="rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-semibold text-success">Live workflow</span>
                  </div>
                </div>
                <div className="space-y-4 p-4">
                  {[
                    { label: "Resume analysis", value: "ATS guidance", icon: FileSearch },
                    { label: "Company verification", value: "Required before publish", icon: ShieldCheck },
                    { label: "Recruiter chat", value: "Application scoped", icon: Radio },
                  ].map((item) => (
                    <div key={item.label} className="rounded-lg border border-border/70 bg-background/50 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <item.icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.value}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="rounded-lg border border-primary/30 bg-primary/10 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-semibold">Pipeline health</p>
                      <p className="text-xs text-primary">Role-based dashboards</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {["Candidate", "Recruiter", "Admin"].map((label) => (
                        <div key={label} className="rounded-md bg-background/60 px-3 py-2 text-center text-xs font-semibold">
                          {label}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section className="border-y border-border/70 bg-card/45 py-12 backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="grid gap-4 md:grid-cols-4">
            {metricCards.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-lg border border-border/70 bg-background/55 p-5"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <p className="font-display text-2xl font-bold">{stat.value}</p>
                <p className="text-sm font-semibold">{stat.label}</p>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">{stat.note}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-primary">Live roles</p>
              <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">Featured Jobs</h2>
              <p className="mt-2 text-muted-foreground">
                {metrics.featuredJobs > 0 ? `${metrics.featuredJobs} roles currently highlighted from the jobs API.` : "Current highlighted roles from verified hiring teams."}
              </p>
            </div>
            <Button variant="outline" className="hidden md:flex" asChild>
              <Link to="/jobs">View All Jobs <ChevronRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>

          {loadingFeatured ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-64 animate-pulse rounded-lg border border-border/70 bg-card/60" />
              ))}
            </div>
          ) : featuredJobs.length === 0 ? (
            <div className="rounded-lg border border-border/70 bg-card/70 p-10 text-center">
              <p className="font-display text-lg font-semibold">No featured jobs available.</p>
              <p className="mt-2 text-sm text-muted-foreground">When recruiters publish active roles, they will appear here automatically.</p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {featuredJobs.map((job, i) => (
                <motion.div
                  key={job._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="group h-full transition-all hover:-translate-y-1 hover:border-primary/35 hover:shadow-xl">
                    <CardContent className="flex h-full flex-col p-5">
                      <div className="mb-5 flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 font-display text-sm font-bold text-primary">
                            {initials(job.company)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{job.company || "Company unavailable"}</p>
                            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">
                              <ShieldCheck className="h-3 w-3" /> Verified flow
                            </span>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" aria-label="Save job">
                          <BookmarkPlus className="h-4 w-4" />
                        </Button>
                      </div>

                      <h3 className="font-display text-lg font-semibold transition-colors group-hover:text-primary">
                        {job.title || "Untitled role"}
                      </h3>

                      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1 rounded-full bg-secondary/70 px-2.5 py-1">
                          <MapPin className="h-3 w-3" /> {job.location || "Location not specified"}
                        </span>
                        <span className="rounded-full bg-secondary/70 px-2.5 py-1">
                          {job.jobType || "Role type TBD"}
                        </span>
                        {job.workMode && (
                          <span className="rounded-full bg-success/10 px-2.5 py-1 font-semibold text-success">
                            {job.workMode === "onsite" ? "On-site" : job.workMode}
                          </span>
                        )}
                        {job.experienceLevel && (
                          <span className="rounded-full bg-primary/10 px-2.5 py-1 font-semibold text-primary">
                            {job.experienceLevel}
                          </span>
                        )}
                      </div>

                      {!!job.skills?.length && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {job.skills.slice(0, 4).map((skill) => (
                            <span key={skill} className="rounded-full border border-border/70 px-2.5 py-1 text-xs text-muted-foreground">{skill}</span>
                          ))}
                        </div>
                      )}

                      <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                        <div>
                          <p className="font-display text-sm font-semibold">{formatSalary(job.salary)}</p>
                          <p className="text-xs text-muted-foreground">{job.deadline ? `Deadline ${new Date(job.deadline).toLocaleDateString()}` : "Deadline not specified"}</p>
                        </div>
                        <Button size="sm" variant="outline" className="h-9 text-xs" asChild>
                          <Link to={`/jobs/${job._id}`}>
                            Apply
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
          <div className="mt-8 text-center md:hidden">
            <Button variant="outline" asChild>
              <Link to="/jobs">View All Jobs <ChevronRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Why OpportunityX */}
      <section className="border-y border-border/70 bg-card/45 py-20 backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase text-primary">Why OpportunityX</p>
            <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">Built around real hiring workflows</h2>
            <p className="mt-3 text-muted-foreground">The platform connects AI assistance, verified company operations, application tracking, and live communication without replacing real API data.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {productStrengths.map((item, index) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.04 }}>
                <Card className="h-full">
                  <CardContent className="p-5">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-display text-lg font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <p className="text-xs font-semibold uppercase text-primary">Operating model</p>
            <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">Two focused paths, one platform</h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            {[
              { title: "Candidate Flow", items: candidateFlow },
              { title: "Recruiter Flow", items: recruiterFlow },
            ].map((group) => (
              <Card key={group.title}>
                <CardContent className="p-6">
                  <h3 className="mb-5 font-display text-xl font-semibold">{group.title}</h3>
                  <div className="space-y-4">
                    {group.items.map((step, index) => (
                      <div key={step.title} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-primary">
                            <step.icon className="h-5 w-5" />
                          </div>
                          {index < group.items.length - 1 && <div className="mt-2 h-8 w-px bg-border" />}
                        </div>
                        <div>
                          <p className="font-semibold">{step.title}</p>
                          <p className="text-sm leading-6 text-muted-foreground">{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* AI Feature Highlight */}
      <section className="border-y border-border/70 bg-card/45 py-20 backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="glass-strong overflow-hidden rounded-lg">
            <div className="grid items-center md:grid-cols-2">
              <div className="p-8 md:p-12">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent">
                  <Brain className="h-3.5 w-3.5" /> AI assistance
                </div>
                <h2 className="mb-4 font-display text-3xl font-bold md:text-4xl">
                  AI that explains, suggests, and stays accountable
                </h2>
                <p className="mb-6 text-muted-foreground">
                  OpportunityX presents AI outputs as suggestions, handles provider availability gracefully, and keeps the final workflow anchored in candidate, recruiter, and admin actions.
                </p>
                <ul className="mb-8 space-y-3">
                  {["Resume analysis with ATS guidance", "Candidate match scoring for recruiters", "Career assistant prompts", "Provider-safe unavailable states"].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-success" /> {item}
                    </li>
                  ))}
                </ul>
                <Button className="gradient-primary border-0" asChild>
                  <Link to="/register">Create Account <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </div>
              <div className="bg-gradient-to-br from-primary/5 to-accent/5 p-8 md:p-12">
                <div className="w-full space-y-4">
                  {[
                    { title: "Resume Analyzer", body: "Highlights strengths, weaknesses, and ATS suggestions after a real upload." },
                    { title: "Recruiter Match Score", body: "Frames candidate fit as advisory scoring with risk flags and next steps." },
                    { title: "Career Assistant", body: "Answers candidate questions without exposing provider internals." },
                  ].map((rec) => (
                    <div key={rec.title} className="glass rounded-lg p-4 transition-all hover:scale-[1.02]">
                      <p className="font-display text-sm font-semibold">{rec.title}</p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">{rec.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Highlights */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <p className="text-xs font-semibold uppercase text-primary">Platform proof</p>
            <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">Product proof comes from the workflow</h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">Instead of invented quotes, OpportunityX now highlights concrete platform capabilities that exist in the application.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { title: "Applications stay traceable", body: "Candidates can apply, save roles, track status, and withdraw when needed." },
              { title: "Recruiters operate from verified context", body: "Company profile, verification, jobs, applicants, analytics, and chat live together." },
              { title: "Admins keep control", body: "Users, approvals, jobs, applications, analytics, reports, and notifications remain role protected." },
            ].map((item) => (
              <Card key={item.title} className="h-full">
                <CardContent className="p-6">
                  <h3 className="font-display text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="overflow-hidden rounded-lg border border-border/70 bg-card/80 shadow-2xl shadow-primary/10">
            <div className="grid md:grid-cols-2">
              <div className="border-b border-border/70 p-8 md:border-b-0 md:border-r md:p-12">
                <p className="text-xs font-semibold uppercase text-primary">For Candidates</p>
                <h2 className="mt-3 font-display text-3xl font-bold">Find roles with better context</h2>
                <p className="mt-3 text-muted-foreground">Build your profile, upload a resume, save jobs, apply, chat, and track applications.</p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Button asChild><Link to="/jobs">Find Jobs</Link></Button>
                  <Button variant="outline" asChild><Link to="/register?role=candidate">Create Profile</Link></Button>
                </div>
              </div>
              <div className="p-8 md:p-12">
                <p className="text-xs font-semibold uppercase text-primary">For Recruiters</p>
                <h2 className="mt-3 font-display text-3xl font-bold">Run a verified hiring pipeline</h2>
                <p className="mt-3 text-muted-foreground">Create your company, submit verification, publish roles, review applicants, and message candidates.</p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Button asChild><Link to="/register?role=recruiter">Start Hiring</Link></Button>
                  <Button variant="outline" asChild><Link to="/recruiter/company">Create Company</Link></Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;

