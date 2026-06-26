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
    Users,
    TrendingUp,
    Star,
    CheckCircle2,
    Upload,
    Brain,
    MessageSquare,
    Zap,
    BookmarkPlus,
    ChevronRight,
  } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import api from "@/services/api";

type FeaturedJob = {
  _id: string;
  title?: string;
  company?: string;
  location?: string;
  jobType?: string;
  workMode?: string;
  salary?: { currency?: string; min?: number; max?: number };
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

const stats = [
  { icon: Briefcase, value: "50K+", label: "Active Jobs" },
  { icon: Building2, value: "12K+", label: "Companies" },
  { icon: Users, value: "2M+", label: "Candidates" },
  { icon: TrendingUp, value: "98%", label: "Success Rate" },
];



const howItWorks = [
  { icon: Upload, title: "Create Profile", desc: "Sign up and build your professional profile with skills, experience, and resume." },
  { icon: Search, title: "Discover Jobs", desc: "Search thousands of opportunities with advanced filters and AI-powered recommendations." },
  { icon: BookmarkPlus, title: "Apply & Track", desc: "Apply with one click and track your application status in real-time." },
  { icon: MessageSquare, title: "Get Hired", desc: "Chat with recruiters, schedule interviews, and land your dream job." },
];

const testimonials = [
  { name: "Sarah Chen", role: "Software Engineer at Google", text: "OpportunityX helped me find my dream job in just 2 weeks. The AI recommendations were spot-on!", avatar: "SC" },
  { name: "James Wilson", role: "HR Director at Meta", text: "As a recruiter, this platform has cut our hiring time by 60%. The applicant management tools are incredible.", avatar: "JW" },
  { name: "Priya Patel", role: "Product Manager at Stripe", text: "The resume parser saved me hours. It auto-filled my profile perfectly and matched me with relevant jobs.", avatar: "PP" },
];

const Index = () =>
{
  const [searchTitle, setSearchTitle] = useState("");
  const [searchLocation, setSearchLocation] = useState("");

  const [featuredJobs, setFeaturedJobs] = useState<FeaturedJob[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  useEffect(() =>
  {
    const fetchFeaturedJobs = async () =>
    {
      try
      {
        const data = await api.get<{ success: boolean; data: FeaturedJob[] }>(
          "/api/jobs/featured",
          { skipAuth: true }
        );

        if (data.success)
        {
          setFeaturedJobs(data.data);
        }
      } catch
      {
        setFeaturedJobs([]);
      } finally
      {
        setLoadingFeatured(false);
      }
    };

    fetchFeaturedJobs();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60 py-20 md:py-28">
        <div className="surface-grid pointer-events-none absolute inset-0 opacity-70" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,hsl(var(--primary)_/_0.18),transparent_38%),linear-gradient(225deg,hsl(var(--accent)_/_0.12),transparent_40%)]" />

        <div className="container relative mx-auto px-4">
          <motion.div initial="hidden" animate="visible" className="mx-auto max-w-4xl text-center">
            <motion.div variants={fadeInUp} custom={0} className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary shadow-inner">
              <Zap className="h-3.5 w-3.5" /> AI-Powered Job Matching
            </motion.div>
            <motion.h1 variants={fadeInUp} custom={1} className="mb-6 font-display text-4xl font-bold leading-tight md:text-6xl lg:text-7xl">
              The premium hiring OS for{" "}
              <span className="gradient-text">modern teams</span>
            </motion.h1>
            <motion.p variants={fadeInUp} custom={2} className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl">
              Discover aligned opportunities, manage candidate pipelines, and move from search to offer inside one polished OpportunityX workspace.
            </motion.p>

            <motion.div variants={fadeInUp} custom={3} className="mx-auto max-w-3xl">
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
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
                <span>Popular:</span>
                {["React Developer", "Product Manager", "Data Analyst", "UX Designer"].map((tag) => (
                  <Link key={tag} to={`/jobs?q=${tag}`} className="rounded-full border border-border/70 bg-secondary/70 px-3 py-1 text-xs font-semibold transition-colors hover:border-primary/30 hover:bg-primary/10 hover:text-primary">
                    {tag}
                  </Link>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border/70 bg-card/45 py-12 backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <p className="font-display text-3xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <h2 className="font-display text-3xl font-bold md:text-4xl">Featured Jobs</h2>
              <p className="mt-2 text-muted-foreground">Hand-picked opportunities from top companies</p>
            </div>
            <Button variant="outline" className="hidden md:flex" asChild>
              <Link to="/jobs">View All Jobs <ChevronRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>

          {/* <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {featuredJobs.map((job, i) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="group cursor-pointer transition-all hover:shadow-lg hover:border-primary/30">
                  <CardContent className="p-5">
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 font-display text-sm font-bold text-primary">
                        {job.company?.substring(0, 2).toUpperCase()}
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                        <BookmarkPlus className="h-4 w-4" />
                      </Button>
                    </div>
                    <h3 className="mb-1 font-display font-semibold group-hover:text-primary transition-colors">{job.title}</h3>
                    <p className="mb-3 text-sm text-muted-foreground">{job.company}</p>
                    <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {job.location}
                      </span>
                      <span className="rounded-full bg-secondary px-2 py-0.5">{job.jobType}</span>
                      {job.workMode === "remote" && (
                      <span className="rounded-full bg-success/10 px-2 py-0.5 text-success">
                        Remote
                      </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-display text-sm font-semibold">{job.salary?.currency} {job.salary?.min} - {job.salary?.max}</span>
                      <Button size="sm" variant="outline" className="h-8 text-xs" asChild>
                        <Link to={`/jobs/${job._id}`}>Apply Now</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div> */}

          {loadingFeatured ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">Loading featured jobs...</p>
            </div>
          ) : featuredJobs.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No featured jobs available.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {featuredJobs.map((job, i) => (
                <motion.div
                  key={job._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="group cursor-pointer transition-all hover:-translate-y-1 hover:border-primary/35 hover:shadow-xl">
                    <CardContent className="p-5">
                      <div className="mb-4 flex items-start justify-between">
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 font-display text-sm font-bold text-primary">
                          {initials(job.company)}
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                          <BookmarkPlus className="h-4 w-4" />
                        </Button>
                      </div>

                      <h3 className="mb-1 font-display font-semibold group-hover:text-primary transition-colors">
                        {job.title || "Untitled role"}
                      </h3>

                      <p className="mb-3 text-sm text-muted-foreground">
                        {job.company || "Company unavailable"}
                      </p>

                      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {job.location || "Location not specified"}
                        </span>

                        <span className="rounded-full bg-secondary px-2 py-0.5">
                          {job.jobType || "Role type TBD"}
                        </span>

                        {job.workMode === "remote" && (
                          <span className="rounded-full bg-success/10 px-2 py-0.5 text-success">
                            Remote
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="font-display text-sm font-semibold">
                          {formatSalary(job.salary)}
                        </span>

                        <Button size="sm" variant="outline" className="h-8 text-xs" asChild>
                          <Link to={`/jobs/${job._id}`}>
                            Apply Now
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

      {/* How It Works */}
      <section className="border-y border-border/70 bg-card/45 py-20 backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold md:text-4xl">How It Works</h2>
            <p className="mt-2 text-muted-foreground">Get started in four simple steps</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {howItWorks.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative text-center"
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg gradient-primary shadow-lg shadow-primary/20">
                  <step.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-accent px-2.5 py-0.5 font-display text-xs font-bold text-accent-foreground">
                  {i + 1}
                </span>
                <h3 className="mb-2 font-display text-lg font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Feature Highlight */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="glass-strong overflow-hidden rounded-lg">
            <div className="grid items-center md:grid-cols-2">
              <div className="p-8 md:p-12">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent">
                  <Brain className="h-3.5 w-3.5" /> AI-Powered
                </div>
                <h2 className="mb-4 font-display text-3xl font-bold md:text-4xl">
                  Smart Job Recommendations
                </h2>
                <p className="mb-6 text-muted-foreground">
                  Our AI analyzes your skills, experience, and preferences to suggest the most relevant opportunities. Upload your resume and let our parser auto-fill your profile.
                </p>
                <ul className="mb-8 space-y-3">
                  {["AI-matched job suggestions", "Resume parsing & auto-fill", "Skill gap analysis", "Salary insights"].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-success" /> {item}
                    </li>
                  ))}
                </ul>
                <Button className="gradient-primary border-0" asChild>
                  <Link to="/register">Try It Free <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </div>
              <div className="flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 p-8 md:p-12">
                <div className="animate-float w-full max-w-sm space-y-4">
                  {[
                    { match: "95%", title: "Senior Frontend Engineer", company: "TechCorp" },
                    { match: "89%", title: "Full Stack Developer", company: "StartupXYZ" },
                    { match: "82%", title: "React Team Lead", company: "ScaleUp" },
                  ].map((rec) => (
                    <div key={rec.title} className="glass rounded-lg p-4 transition-all hover:scale-[1.02]">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-display text-sm font-semibold">{rec.title}</p>
                          <p className="text-xs text-muted-foreground">{rec.company}</p>
                        </div>
                        <span className="rounded-full bg-success/10 px-2.5 py-1 font-display text-xs font-bold text-success">
                          {rec.match} Match
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-y border-border/70 bg-card/45 py-20 backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold md:text-4xl">What People Say</h2>
            <p className="mt-2 text-muted-foreground">Trusted by thousands of professionals</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="mb-4 flex gap-1">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className="h-4 w-4 fill-warning text-warning" />
                      ))}
                    </div>
                    <p className="mb-6 text-sm text-muted-foreground leading-relaxed">"{t.text}"</p>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-display text-sm font-bold text-primary">
                        {t.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="gradient-primary rounded-lg p-8 text-center shadow-2xl shadow-primary/20 md:p-16">
            <h2 className="mb-4 font-display text-3xl font-bold text-primary-foreground md:text-4xl">
              Ready to Start Your Journey?
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-primary-foreground/80">
              Join millions of professionals who've found their perfect career match on OpportunityX.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto" asChild>
                <Link to="/register">Create Free Account</Link>
              </Button>
              <Button size="lg" variant="outline" className="w-full border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 sm:w-auto" asChild>
                <Link to="/jobs">Browse Jobs</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;

