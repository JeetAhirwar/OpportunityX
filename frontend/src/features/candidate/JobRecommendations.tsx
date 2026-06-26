import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Brain, Building2, DollarSign, Loader2, MapPin, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import { getAiJobRecommendations, type JobRecommendation } from "@/features/ai/aiApi";
import { Link } from "react-router-dom";

const JobRecommendations = () => {
  const [recommendations, setRecommendations] = useState<JobRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAiJobRecommendations()
      .then((response) => setRecommendations(response.recommendations))
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : "AI recommendations are unavailable."))
      .finally(() => setLoading(false));
  }, []);

  return (
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

    {loading ? (
      <div className="flex min-h-[280px] items-center justify-center rounded-xl border border-border"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading AI recommendations...</div>
    ) : error ? (
      <EmptyState icon={AlertCircle} title="AI recommendations unavailable" description={error} action={{ label: "Complete profile", onClick: () => { window.location.href = "/candidate/profile"; } }} />
    ) : !recommendations.length ? (
      <EmptyState icon={Brain} title="No recommendations yet" description="Complete your profile skills and check back when active jobs are available." />
    ) : <div className="grid gap-4 lg:grid-cols-2">
      {recommendations.map((recommendation) => {
        const job = recommendation.job;
        const salary = job.salary?.min ? `${job.salary.currency || "USD"} ${Number(job.salary.min).toLocaleString()} - ${Number(job.salary.max || 0).toLocaleString()}` : "Salary unavailable";
        return (
        <Card key={job._id} className="transition-shadow hover:shadow-md">
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
                <span className="text-lg font-bold text-primary">{recommendation.matchScore}%</span>
                <p className="text-xs text-muted-foreground">match</p>
              </div>
            </div>

            <Progress value={recommendation.matchScore} className="mb-3 h-1.5" />

            <div className="mb-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.location}</span>
              <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> {salary}</span>
            </div>

            <div className="mb-4 space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><Sparkles className="h-3 w-3 text-accent" /><span>{recommendation.reason}</span></div>
              {!!recommendation.missingSkills?.length && <p className="text-xs text-muted-foreground">Missing skills: {recommendation.missingSkills.join(", ")}</p>}
            </div>

            <Button size="sm" className="w-full gradient-primary border-0" asChild><Link to={`/jobs/${job._id}`}>View Job</Link></Button>
          </CardContent>
        </Card>
      );})}
    </div>}
  </motion.div>
  );
};

export default JobRecommendations;
