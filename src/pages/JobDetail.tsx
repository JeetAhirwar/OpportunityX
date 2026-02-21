import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin, DollarSign, Clock, Building2, Briefcase, BookmarkPlus, Bookmark,
  Share2, ArrowLeft, CheckCircle2, Globe, Users, Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/common/SEOHead";

const JobDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [applied, setApplied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [applying, setApplying] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const job = {
    id,
    title: "Senior React Developer",
    company: "TechCorp",
    location: "San Francisco, CA",
    type: "Full-time",
    salary: "$150K - $200K",
    remote: true,
    experience: "5+ years",
    posted: "3 days ago",
    logo: "TC",
    applicants: 47,
    description: `We're looking for a Senior React Developer to join our growing frontend team. You'll be building next-generation web applications that serve millions of users worldwide.\n\nAs a senior member of the team, you'll mentor junior developers, contribute to architecture decisions, and drive best practices across the organization.`,
    responsibilities: [
      "Lead development of complex React applications",
      "Design and implement scalable frontend architectures",
      "Mentor and code-review junior developers",
      "Collaborate with product and design teams",
      "Optimize application performance and accessibility",
      "Contribute to technical strategy and tooling decisions",
    ],
    requirements: [
      "5+ years of experience with React and TypeScript",
      "Strong understanding of modern CSS and responsive design",
      "Experience with state management (Redux, Zustand, or similar)",
      "Familiarity with testing frameworks (Jest, React Testing Library)",
      "Excellent communication and teamwork skills",
      "Experience with CI/CD pipelines and deployment workflows",
    ],
    benefits: ["Competitive salary & equity", "Remote-first culture", "Unlimited PTO", "Health, dental & vision", "Learning & development budget", "$1,500/yr home office stipend"],
    tags: ["React", "TypeScript", "Next.js", "GraphQL", "Tailwind CSS"],
    companyInfo: {
      size: "200-500 employees",
      industry: "Technology",
      founded: "2018",
      website: "techcorp.io",
      about: "TechCorp is a fast-growing SaaS company building tools that help developers ship faster. We're backed by top VCs and serve over 50,000 customers worldwide.",
    },
  };

  const handleApply = async () => {
    setApplying(true);
    // API: api.post(`/jobs/${id}/apply`, { coverLetter })
    await new Promise((r) => setTimeout(r, 1000));
    setApplied(true);
    setApplying(false);
    setDialogOpen(false);
    toast({ title: "Application Submitted!", description: `You've applied to ${job.title} at ${job.company}` });
  };

  const handleSave = () => {
    // API: api.post(`/candidate/saved-jobs/${id}`)
    setSaved(!saved);
    toast({ title: saved ? "Removed from saved" : "Job saved!", description: saved ? "Job removed from your saved list" : "You can find it in your saved jobs" });
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`${job.title} at ${job.company} — OpportunityX`}
        description={`Apply for ${job.title} at ${job.company}. ${job.salary} · ${job.location}`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "JobPosting",
          title: job.title,
          description: job.description,
          hiringOrganization: { "@type": "Organization", name: job.company },
          jobLocation: { "@type": "Place", address: job.location },
          datePosted: new Date().toISOString(),
        }}
      />
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" size="sm" className="mb-6" asChild>
          <Link to="/jobs"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Jobs</Link>
        </Button>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-display text-lg font-bold text-primary">{job.logo}</div>
                    <div className="flex-1">
                      <h1 className="font-display text-2xl font-bold md:text-3xl">{job.title}</h1>
                      <p className="mt-1 text-lg text-muted-foreground">{job.company}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {job.tags.map((tag) => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                    {[
                      { icon: MapPin, label: job.location },
                      { icon: DollarSign, label: job.salary },
                      { icon: Briefcase, label: job.type },
                      { icon: Clock, label: job.posted },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <item.icon className="h-4 w-4" /> {item.label}
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    {applied ? (
                      <Button disabled className="bg-success text-success-foreground">
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Applied
                      </Button>
                    ) : (
                      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                          <Button className="gradient-primary border-0">Apply Now</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Apply to {job.title}</DialogTitle>
                            <DialogDescription>at {job.company} · {job.location}</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-3">
                            <p className="text-sm text-muted-foreground">Your profile and resume will be shared with the recruiter.</p>
                            <Textarea
                              placeholder="Cover letter (optional) — Tell the recruiter why you're a great fit..."
                              value={coverLetter}
                              onChange={(e) => setCoverLetter(e.target.value)}
                              rows={5}
                            />
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleApply} disabled={applying} className="gradient-primary border-0">
                              {applying ? "Submitting..." : "Submit Application"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                    <Button variant="outline" onClick={handleSave}>
                      {saved ? <Bookmark className="mr-2 h-4 w-4 fill-current" /> : <BookmarkPlus className="mr-2 h-4 w-4" />}
                      {saved ? "Saved" : "Save"}
                    </Button>
                    <Button variant="outline"><Share2 className="mr-2 h-4 w-4" /> Share</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <Card>
              <CardContent className="p-6 md:p-8 space-y-6">
                <div>
                  <h2 className="font-display text-xl font-semibold mb-3">About the Role</h2>
                  <p className="text-muted-foreground whitespace-pre-line leading-relaxed">{job.description}</p>
                </div>
                <Separator />
                <div>
                  <h2 className="font-display text-xl font-semibold mb-3">Responsibilities</h2>
                  <ul className="space-y-2">
                    {job.responsibilities.map((r) => (
                      <li key={r} className="flex gap-2 text-sm text-muted-foreground"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" /> {r}</li>
                    ))}
                  </ul>
                </div>
                <Separator />
                <div>
                  <h2 className="font-display text-xl font-semibold mb-3">Requirements</h2>
                  <ul className="space-y-2">
                    {job.requirements.map((r) => (
                      <li key={r} className="flex gap-2 text-sm text-muted-foreground"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {r}</li>
                    ))}
                  </ul>
                </div>
                <Separator />
                <div>
                  <h2 className="font-display text-xl font-semibold mb-3">Benefits</h2>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {job.benefits.map((b) => (
                      <div key={b} className="flex items-center gap-2 rounded-lg bg-secondary p-3 text-sm"><CheckCircle2 className="h-4 w-4 text-success" /> {b}</div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-display font-semibold mb-4">About {job.company}</h3>
                <p className="mb-4 text-sm text-muted-foreground">{job.companyInfo.about}</p>
                <div className="space-y-3 text-sm">
                  {[
                    { icon: Users, label: "Company size", value: job.companyInfo.size },
                    { icon: Building2, label: "Industry", value: job.companyInfo.industry },
                    { icon: Calendar, label: "Founded", value: job.companyInfo.founded },
                    { icon: Globe, label: "Website", value: job.companyInfo.website },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-muted-foreground"><item.icon className="h-4 w-4" /> {item.label}</span>
                      <span className="font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                <p className="font-display text-2xl font-bold">{job.applicants}</p>
                <p className="text-sm text-muted-foreground">applicants so far</p>
              </CardContent>
            </Card>
            <Card className="gradient-primary">
              <CardContent className="p-6 text-center">
                <h3 className="mb-2 font-display font-semibold text-primary-foreground">Ready to apply?</h3>
                <p className="mb-4 text-sm text-primary-foreground/70">Submit your application now</p>
                {applied ? (
                  <Button variant="secondary" className="w-full" disabled><CheckCircle2 className="mr-2 h-4 w-4" /> Applied</Button>
                ) : (
                  <Button variant="secondary" className="w-full" onClick={() => setDialogOpen(true)}>Apply Now</Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default JobDetail;
