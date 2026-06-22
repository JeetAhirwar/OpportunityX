import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Eye, Save, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/common/PageHeader";
import api from "@/services/api"; // or wherever your axios instance is

const steps = ["Job Details", "Requirements", "Compensation", "Preview"];

const PostJob = () => {
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    title: "", company: "", location: "", type: "full-time", workMode: "remote",
    description: "", responsibilities: "", qualifications: "",
    skills: [] as string[], newSkill: "",
    salaryMin: "", salaryMax: "", currency: "USD", showSalary: true,
    experience: "mid", deadline: "",
  });

  const update = (key: string, value: any) => setForm((p) => ({ ...p, [key]: value }));

  const addSkill = () => {
    if (form.newSkill.trim() && !form.skills.includes(form.newSkill.trim())) {
      update("skills", [...form.skills, form.newSkill.trim()]);
      update("newSkill", "");
    }
  };

  const handleSubmit = async (draft = false) => {
  try {
    const payload = {
      title: form.title,
      company: form.company,
      location: form.location,
      jobType: form.type,
      workMode: form.workMode,
      description: form.description,
      responsibilities: form.responsibilities,
      qualifications: form.qualifications,
      skills: form.skills,
      experienceLevel: form.experience,
      deadline: form.deadline,
      salary: {
        min: Number(form.salaryMin),
        max: Number(form.salaryMax),
        currency: form.currency,
      },
      status: draft ? "draft" : "active",
    };

    await api.post("/api/jobs", payload);

    toast({
      title: draft ? "Draft saved" : "Job posted",
      description: draft
        ? "You can publish it later."
        : "Your job is now live.",
    });

  } catch (error: any) {
    console.error(error);
    toast({
      title: "Error",
      description: error.response?.data?.message || "Failed to post job",
      variant: "destructive",
    });
  }
};

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader title="Post a Job" description="Create a new job listing" />

      {/* Steps */}
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <button onClick={() => setStep(i)} className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${i <= step ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{i + 1}</button>
            <span className={`hidden text-sm sm:inline ${i <= step ? "font-medium" : "text-muted-foreground"}`}>{s}</span>
            {i < steps.length - 1 && <div className={`h-px w-8 ${i < step ? "bg-primary" : "bg-border"}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Details */}
      {step === 0 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Job Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Job Title</Label><Input placeholder="e.g. Senior Frontend Engineer" value={form.title} onChange={(e) => update("title", e.target.value)} /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>Company</Label><Input placeholder="Company name" value={form.company} onChange={(e) => update("company", e.target.value)} /></div>
              <div><Label>Location</Label><Input placeholder="City, Country" value={form.location} onChange={(e) => update("location", e.target.value)} /></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>Job Type</Label>
                <Select value={form.type} onValueChange={(v) => update("type", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Work Mode</Label>
                <Select value={form.workMode} onValueChange={(v) => update("workMode", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="onsite">On-site</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Description</Label><Textarea placeholder="Describe the role, team, and what makes this opportunity exciting..." value={form.description} onChange={(e) => update("description", e.target.value)} rows={5} /></div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Requirements */}
      {step === 1 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Requirements</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Responsibilities</Label><Textarea placeholder="List key responsibilities..." value={form.responsibilities} onChange={(e) => update("responsibilities", e.target.value)} rows={4} /></div>
            <div><Label>Qualifications</Label><Textarea placeholder="List required qualifications..." value={form.qualifications} onChange={(e) => update("qualifications", e.target.value)} rows={4} /></div>
            <div><Label>Experience Level</Label>
              <Select value={form.experience} onValueChange={(v) => update("experience", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="junior">Entry Level</SelectItem>
                  <SelectItem value="mid">Mid Level</SelectItem>
                  <SelectItem value="senior">Senior</SelectItem>
                  <SelectItem value="lead">Lead / Principal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Required Skills</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {form.skills.map((s) => (
                  <Badge key={s} variant="secondary" className="gap-1 pr-1">{s}<button onClick={() => update("skills", form.skills.filter((x) => x !== s))} className="ml-1 hover:text-destructive">Ã—</button></Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input placeholder="Add skill" value={form.newSkill} onChange={(e) => update("newSkill", e.target.value)} onKeyDown={(e) => e.key === "Enter" && addSkill()} />
                <Button variant="outline" onClick={addSkill}>Add</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Compensation */}
      {step === 2 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Compensation</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div><Label>Min Salary</Label><Input type="number" placeholder="80000" value={form.salaryMin} onChange={(e) => update("salaryMin", e.target.value)} /></div>
              <div><Label>Max Salary</Label><Input type="number" placeholder="120000" value={form.salaryMax} onChange={(e) => update("salaryMax", e.target.value)} /></div>
              <div><Label>Currency</Label>
                <Select value={form.currency} onValueChange={(v) => update("currency", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.showSalary} onCheckedChange={(v) => update("showSalary", v)} />
              <Label>Display salary on listing</Label>
            </div>
            <div><Label>Application Deadline</Label><Input type="date" value={form.deadline} onChange={(e) => update("deadline", e.target.value)} /></div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Preview */}
      {step === 3 && (
        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Eye className="h-5 w-5" /> Preview</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <h2 className="font-display text-xl font-bold">{form.title || "Job Title"}</h2>
            <p className="text-muted-foreground">{form.company || "Company"} Â· {form.location || "Location"} Â· {form.workMode} Â· {form.type}</p>
            {form.showSalary && form.salaryMin && <p className="font-medium">{form.currency} {Number(form.salaryMin).toLocaleString()} - {Number(form.salaryMax).toLocaleString()}</p>}
            {form.skills.length > 0 && <div className="flex flex-wrap gap-2">{form.skills.map((s) => <Badge key={s} variant="secondary">{s}</Badge>)}</div>}
            {form.description && <div><h3 className="font-semibold mb-1">Description</h3><p className="text-sm text-muted-foreground whitespace-pre-line">{form.description}</p></div>}
            {form.responsibilities && <div><h3 className="font-semibold mb-1">Responsibilities</h3><p className="text-sm text-muted-foreground whitespace-pre-line">{form.responsibilities}</p></div>}
            {form.qualifications && <div><h3 className="font-semibold mb-1">Qualifications</h3><p className="text-sm text-muted-foreground whitespace-pre-line">{form.qualifications}</p></div>}
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div className="flex gap-2">
          {step === 3 && <Button variant="outline" onClick={() => handleSubmit(true)}><Save className="mr-2 h-4 w-4" /> Save Draft</Button>}
          {step < 3 ? (
            <Button onClick={() => setStep(step + 1)} className="gradient-primary border-0">Next <ArrowRight className="ml-2 h-4 w-4" /></Button>
          ) : (
            <Button onClick={() => handleSubmit(false)} className="gradient-primary border-0"><Send className="mr-2 h-4 w-4" /> Publish Job</Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default PostJob;

