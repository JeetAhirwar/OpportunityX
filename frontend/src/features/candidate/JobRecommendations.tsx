import { motion } from "framer-motion";
import { Brain, Sparkles, TrendingUp, MapPin, DollarSign, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import PageHeader from "@/components/common/PageHeader";

const recommendations = [
  { id: "1", title: "Senior Frontend Engineer", company: "Stripe", location: "Remote", salary: "$170K - $210K", matchScore: 95, reasons: ["React expertise matches", "Remote preference", "Salary range aligned"] },
  { id: "2", title: "Lead UI Developer", company: "Linear", location: "San Francisco", salary: "$160K - $200K", matchScore: 88, reasons: ["UI/UX skills match", "Experience level fits", "Company culture match"] },
  { id: "3", title: "Staff Engineer", company: "Vercel", location: "Remote", salary: "$180K - $230K", matchScore: 82, reasons: ["Full-stack skills", "Open source contributions", "Growth opportunity"] },
  { id: "4", title: "Frontend Architect", company: "Notion", location: "New York", salary: "$175K - $220K", matchScore: 78, reasons: ["Architecture experience", "Team leadership", "Product-minded"] },
];

const JobRecommendations = () => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
    <PageHeader title="AI Recommendations" description="Jobs matched to your profile by our AI engine" />

    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl gradient-primary">
          <Brain className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h3 className="font-display font-semibold">AI-Powered Matching</h3>
          <p className="text-sm text-muted-foreground">Based on your skills, experience, and preferences. Complete your profile to improve accuracy.</p>
        </div>
      </CardContent>
    </Card>

    <div className="grid gap-4 lg:grid-cols-2">
      {recommendations.map((job) => (
        <Card key={job.id} className="transition-shadow hover:shadow-md">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-semibold">{job.title}</h3>
                  <p className="text-sm text-muted-foreground">{job.company}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-primary">{job.matchScore}%</span>
                <p className="text-xs text-muted-foreground">match</p>
              </div>
            </div>

            <Progress value={job.matchScore} className="mb-3 h-1.5" />

            <div className="mb-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.location}</span>
              <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> {job.salary}</span>
            </div>

            <div className="mb-4 space-y-1">
              {job.reasons.map((reason) => (
                <div key={reason} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Sparkles className="h-3 w-3 text-accent" />
                  <span>{reason}</span>
                </div>
              ))}
            </div>

            <Button size="sm" className="w-full gradient-primary border-0">Apply Now</Button>
          </CardContent>
        </Card>
      ))}
    </div>
  </motion.div>
);

export default JobRecommendations;
