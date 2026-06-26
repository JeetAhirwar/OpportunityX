import { useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, FileText, Loader2, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/common/PageHeader";
import FileUpload from "@/components/common/FileUpload";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import api, { publicAssetUrl } from "@/services/api";
import type { Profile } from "@/types";
import { analyzeResume, type ResumeAnalysis } from "@/features/ai/aiApi";

const appendProfile = (formData: FormData, profile: Profile) => {
  formData.append("name", profile.name);
  formData.append("title", profile.title || "");
  formData.append("phone", profile.phone);
  formData.append("location", profile.location);
  formData.append("bio", profile.bio);
  formData.append("candidateType", profile.candidateType);
  profile.skills.forEach((skill) => formData.append("skills", skill));
  for (const key of ["education", "experience", "projects", "certifications", "preferredJobTypes", "preferredWorkModes", "preferredIndustries"] as const) {
    formData.append(key, JSON.stringify(profile[key] || []));
  }
  formData.append("socials", JSON.stringify(profile.socials || {}));
  formData.append("expectedSalaryMin", String(profile.expectedSalaryMin || 0));
};

const resumeHref = (resumeUrl?: string) => {
  if (!resumeUrl) return "";
  return publicAssetUrl(resumeUrl);
};

const ResumeUpload = () => {
  const { data: profile, isLoading, isError, error, refetch } = useProfile();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);

  const handleUpload = async (file: File) => {
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      toast({ title: "Unsupported file", description: "Resume must be a PDF file.", variant: "destructive" });
      return;
    }
    if (!profile) {
      toast({ title: "Profile required", description: "Complete your candidate profile before uploading a resume.", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      appendProfile(formData, profile);
      formData.append("resume", file);
      await api.put("/candidate/profile", formData);
      await refetch();
      toast({ title: "Resume uploaded", description: "Your new resume is saved to your profile." });
    } catch (requestError) {
      toast({ title: "Resume upload failed", description: requestError instanceof Error ? requestError.message : "Unknown error", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!profile?.resumeUrl) {
      toast({ title: "Resume required", description: "Upload your resume before requesting AI analysis.", variant: "destructive" });
      return;
    }
    setAnalyzing(true);
    setAnalysis(null);
    try {
      setAnalysis(await analyzeResume());
    } catch (requestError) {
      toast({ title: "AI analysis unavailable", description: requestError instanceof Error ? requestError.message : "Unknown error", variant: "destructive" });
    } finally {
      setAnalyzing(false);
    }
  };

  const currentFile = profile?.resumeUrl
    ? { name: profile.resumeUrl.split(/[\\/]/).pop() || "Current resume", uploadedAt: "Previously" }
    : null;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader title="Resume" description="Upload your resume to apply to jobs faster" />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-primary" /> Upload Resume
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex min-h-32 items-center justify-center"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading profile...</div>
          ) : isError ? (
            <div className="space-y-3 text-sm text-destructive"><p>{error instanceof Error ? error.message : "Could not load your profile."}</p><Button variant="outline" onClick={() => void refetch()}>Try again</Button></div>
          ) : !profile ? (
            <div className="space-y-2 text-sm"><p className="font-medium">Complete your candidate profile first</p><p className="text-muted-foreground">A profile is required before a resume can be uploaded.</p></div>
          ) : (
            <>
              <FileUpload accept=".pdf,application/pdf" maxSize={10} onFileSelect={(file) => void handleUpload(file)} currentFile={currentFile} label="Drop your PDF resume here" />
              {uploading && <p className="mt-3 flex items-center text-sm text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading resume...</p>}
              {profile?.resumeUrl && <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="outline" size="sm" asChild><a href={resumeHref(profile.resumeUrl)} target="_blank" rel="noopener noreferrer"><ExternalLink className="mr-2 h-4 w-4" /> View Current Resume</a></Button>
                <Button size="sm" onClick={() => void handleAnalyze()} disabled={analyzing} className="gradient-primary border-0">{analyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />} Analyze Resume</Button>
              </div>}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Sparkles className="h-5 w-5 text-accent" /> AI Resume Analysis</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {!analysis ? <p className="text-sm text-muted-foreground">AI analysis uses your profile and uploaded resume metadata. PDF text extraction is still pending, so the result will call out that limitation.</p> : (
            <div className="space-y-4 text-sm">
              <div><p className="font-medium">Resume Score</p><p className="text-2xl font-bold text-primary">{analysis.resumeScore}/100</p></div>
              <div className="grid gap-4 md:grid-cols-2">
                <div><p className="font-medium">Strengths</p><ul className="mt-1 list-disc space-y-1 pl-5 text-muted-foreground">{analysis.strengths?.map((item) => <li key={item}>{item}</li>)}</ul></div>
                <div><p className="font-medium">Improvements</p><ul className="mt-1 list-disc space-y-1 pl-5 text-muted-foreground">{analysis.weaknesses?.map((item) => <li key={item}>{item}</li>)}</ul></div>
                <div><p className="font-medium">Missing Skills</p><p className="mt-1 text-muted-foreground">{analysis.missingSkills?.join(", ") || "None listed"}</p></div>
                <div><p className="font-medium">ATS Suggestions</p><ul className="mt-1 list-disc space-y-1 pl-5 text-muted-foreground">{analysis.atsSuggestions?.map((item) => <li key={item}>{item}</li>)}</ul></div>
              </div>
              {analysis.improvedSummary && <div><p className="font-medium">Improved Summary</p><p className="mt-1 text-muted-foreground">{analysis.improvedSummary}</p></div>}
              {!!analysis.limitations?.length && <p className="rounded-lg bg-warning/10 p-3 text-xs text-warning">{analysis.limitations.join(" ")}</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ResumeUpload;
