import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, FileText, Briefcase, CheckCircle, ChevronRight, ChevronLeft,
  MapPin, Upload, Plus, X, Sparkles,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/utils/cn";
import { useNavigate } from "react-router-dom";
import api from "@/services/api";
import { useAuth } from "@/store/AuthContext";

interface OnboardingModalProps {
  open: boolean;
  onComplete: () => void;
}

const steps = [
  { id: 0, label: "Profile", icon: User, description: "Tell us about yourself" },
  { id: 1, label: "Resume", icon: FileText, description: "Upload your resume" },
  { id: 2, label: "Preferences", icon: Briefcase, description: "Set job preferences" },
  { id: 3, label: "Done", icon: CheckCircle, description: "You're all set!" },
];

const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Freelance", "Internship"];
const WORK_MODES = ["Remote", "Hybrid", "On-site"];
const INDUSTRIES = [
  "Technology", "Finance", "Healthcare", "Education", "Marketing",
  "Design", "Engineering", "Sales", "Operations", "Legal",
];

const OnboardingModal = ({ open, onComplete }: OnboardingModalProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState({ headline: "", location: "", phone: "" });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedModes, setSelectedModes] = useState<string[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [salaryMin, setSalaryMin] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const progress = ((step + 1) / steps.length) * 100;
  const phoneDigits = profile.phone.replace(/\D/g, "");
  const normalizedPhone = phoneDigits.slice(-10);
  const isProfileStepValid =
    profile.headline.trim().length > 0 &&
    profile.location.trim().length > 0 &&
    phoneDigits.length >= 10;

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills((s) => [...s, trimmed]);
      setSkillInput("");
    }
  };

  const toggleSelection = (
    item: string,
    list: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setter(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  };

  const selectResume = (file?: File) => {
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setSaveError("Resume must be a PDF file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setSaveError("Resume must be smaller than 10 MB.");
      return;
    }
    setSaveError("");
    setResumeFile(file);
  };

  const canProceed = () => {
    if (step === 0) return isProfileStepValid;
    if (step === 1) return true; // resume is optional
    if (step === 2) return selectedTypes.length > 0;
    return true;
  };

const handleFinish = async () => {
  setIsSaving(true);
  setSaveError("");
  try {
    const formData = new FormData();

    formData.append("name", user?.name || "User");
    formData.append("title", profile.headline);
    formData.append("location", profile.location);
    formData.append("phone", normalizedPhone);
    formData.append("bio", "Profile created via onboarding. Will update later.");
    formData.append("candidateType", "fresher");

    // skills array send properly
    const finalSkills = skills.length > 0 ? skills : ["Beginner"];
    finalSkills.forEach((skill) => {
      formData.append("skills", skill);
    });

    // empty arrays (must stringify)
    formData.append("education", JSON.stringify([]));
    formData.append("experience", JSON.stringify([]));
    formData.append("projects", JSON.stringify([]));
    formData.append("certifications", JSON.stringify([]));

    formData.append(
      "socials",
      JSON.stringify({
        linkedin: "",
        github: "",
        portfolio: "",
      })
    );

    formData.append("preferredJobTypes", JSON.stringify(selectedTypes));
    formData.append("preferredWorkModes", JSON.stringify(selectedModes));
    formData.append("preferredIndustries", JSON.stringify(selectedIndustries));
    formData.append("expectedSalaryMin", salaryMin || "0");

    if (resumeFile) {
      formData.append("resume", resumeFile);
    }

    await api.put("/candidate/profile", formData);

    localStorage.setItem("ox_onboarding_complete", "true");
    onComplete();
    navigate("/candidate/dashboard", { replace: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unable to save your profile.";
    setSaveError(message);
    console.error("Onboarding save error:", message);
  } finally {
    setIsSaving(false);
  }
};

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => {
      if (!nextOpen && localStorage.getItem("ox_onboarding_complete") === "true") {
        onComplete();
      }
    }}>
      <DialogContent className="max-w-xl gap-0 overflow-hidden p-0 sm:rounded-2xl [&>button]:hidden">
        {/* Progress */}
        <div className="px-6 pt-6">
          <Progress value={progress} className="h-1.5" />
          <div className="mt-4 flex items-center justify-between">
            {steps.map((s) => (
              <div key={s.id} className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all",
                    step > s.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : step === s.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-secondary text-muted-foreground"
                  )}
                >
                  {step > s.id ? <CheckCircle className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
                </div>
                <span className="hidden text-[10px] font-medium text-muted-foreground sm:block">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="min-h-[340px] px-6 py-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Step 0 — Profile basics */}
              {step === 0 && (
                <div className="space-y-5">
                  <DialogHeader>
                    <DialogTitle className="font-display text-xl">Welcome to OpportunityX! 🎉</DialogTitle>
                    <DialogDescription>Let's set up your profile so recruiters can find you.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Professional Headline *</Label>
                      <Input
                        placeholder="e.g. Senior React Developer"
                        value={profile.headline}
                        onChange={(e) => setProfile((current) => ({ ...current, headline: e.target.value }))}
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Location *</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            className="pl-9"
                            placeholder="City, Country"
                            value={profile.location}
                            onChange={(e) => setProfile((current) => ({ ...current, location: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Phone *</Label>
                        <Input
                          placeholder="+1 234 567 890"
                          value={profile.phone}
                          onChange={(e) => setProfile((current) => ({ ...current, phone: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Skills</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a skill"
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                        />
                        <Button type="button" size="icon" variant="outline" onClick={addSkill}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {skills.map((s) => (
                            <Badge key={s} variant="secondary" className="gap-1 pr-1">
                              {s}
                              <button onClick={() => setSkills((prev) => prev.filter((x) => x !== s))}>
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 1 — Resume */}
              {step === 1 && (
                <div className="space-y-5">
                  <DialogHeader>
                    <DialogTitle className="font-display text-xl">Upload Your Resume</DialogTitle>
                    <DialogDescription>Help recruiters learn more about your experience. You can skip this for now.</DialogDescription>
                  </DialogHeader>
                  <div
                    className={cn(
                      "flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center transition-colors cursor-pointer",
                      resumeFile ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    )}
                    onClick={() => document.getElementById("onboarding-resume")?.click()}
                  >
                    {resumeFile ? (
                      <>
                        <CheckCircle className="mb-3 h-10 w-10 text-primary" />
                        <p className="font-medium">{resumeFile.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-3 text-destructive"
                          onClick={(e) => { e.stopPropagation(); setResumeFile(null); }}
                        >
                          Remove
                        </Button>
                      </>
                    ) : (
                      <>
                        <Upload className="mb-3 h-10 w-10 text-muted-foreground" />
                        <p className="font-medium">Drop your resume here</p>
                        <p className="mt-1 text-xs text-muted-foreground">PDF · Max 10MB</p>
                      </>
                    )}
                  </div>
                  <input
                    id="onboarding-resume"
                    type="file"
                    accept=".pdf,application/pdf"
                    className="hidden"
                    onChange={(e) => selectResume(e.target.files?.[0])}
                  />
                  {saveError && <p className="text-sm text-destructive">{saveError}</p>}
                </div>
              )}

              {/* Step 2 — Job Preferences */}
              {step === 2 && (
                <div className="space-y-5">
                  <DialogHeader>
                    <DialogTitle className="font-display text-xl">Job Preferences</DialogTitle>
                    <DialogDescription>We'll use these to recommend the best opportunities for you.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Job Type *</Label>
                      <div className="flex flex-wrap gap-2">
                        {JOB_TYPES.map((t) => (
                          <Badge
                            key={t}
                            variant={selectedTypes.includes(t) ? "default" : "outline"}
                            className="cursor-pointer select-none transition-colors"
                            onClick={() => toggleSelection(t, selectedTypes, setSelectedTypes)}
                          >
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Work Mode</Label>
                      <div className="flex flex-wrap gap-2">
                        {WORK_MODES.map((m) => (
                          <Badge
                            key={m}
                            variant={selectedModes.includes(m) ? "default" : "outline"}
                            className="cursor-pointer select-none transition-colors"
                            onClick={() => toggleSelection(m, selectedModes, setSelectedModes)}
                          >
                            {m}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Industries</Label>
                      <div className="flex flex-wrap gap-2">
                        {INDUSTRIES.map((i) => (
                          <Badge
                            key={i}
                            variant={selectedIndustries.includes(i) ? "default" : "outline"}
                            className="cursor-pointer select-none transition-colors"
                            onClick={() => toggleSelection(i, selectedIndustries, setSelectedIndustries)}
                          >
                            {i}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Minimum Salary Expectation</Label>
                      <Input
                        type="number"
                        placeholder="e.g. 80000"
                        value={salaryMin}
                        onChange={(e) => setSalaryMin(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3 — Complete */}
              {step === 3 && (
                <div className="flex flex-col items-center justify-center space-y-4 py-8 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <DialogHeader className="items-center">
                    <DialogTitle className="font-display text-2xl">You're All Set! 🚀</DialogTitle>
                    <DialogDescription className="max-w-sm">
                      Your profile is ready. Start exploring opportunities and let our AI match you with the best jobs.
                    </DialogDescription>
                  </DialogHeader>
                  {saveError && <p className="text-sm text-destructive">{saveError}</p>}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border bg-secondary/30 px-6 py-4">
          {step > 0 && step < 3 ? (
            <Button variant="ghost" size="sm" onClick={() => setStep(step - 1)}>
              <ChevronLeft className="mr-1 h-4 w-4" /> Back
            </Button>
          ) : (
            <div />
          )}
          {step < 3 ? (
            <div className="flex gap-2">
              {step === 1 && (
                <Button variant="ghost" size="sm" onClick={() => setStep(step + 1)}>
                  Skip
                </Button>
              )}
              <Button size="sm" disabled={!canProceed()} onClick={() => setStep(step + 1)}>
                Continue <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button size="sm" className="gradient-primary border-0" onClick={handleFinish} disabled={isSaving}>
              {isSaving ? "Saving..." : "Go to Dashboard"} <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal;

