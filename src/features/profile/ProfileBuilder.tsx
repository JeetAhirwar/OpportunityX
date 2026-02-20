import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User, GraduationCap, Building2, FolderOpen, Globe, Plus, X, Save,
  Code2, Camera, Award, Briefcase, Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/common/PageHeader";
import api from "@/lib/api";
import type { Profile, Certification } from "@/types";

const defaultProfile: Profile = {
  name: "", phone: "", location: "", title: "", bio: "", photo: "",
  candidateType: "fresher", skills: [], education: [], experience: [],
  projects: [], certifications: [], socials: { linkedin: "", github: "", portfolio: "" },
};

const ProfileBuilder = () => {
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile>(() => {
    const saved = localStorage.getItem("profileDraft");
    return saved ? { ...defaultProfile, ...JSON.parse(saved) } : defaultProfile;
  });
  const [newSkill, setNewSkill] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const phoneRegex = /^[6-9]\d{9}$/;

  // Fetch existing profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await api.get<Profile>("/candidate/profile");
        setProfile({ ...defaultProfile, ...data });
        localStorage.removeItem("profileDraft");
      } catch {
        // No profile yet or not logged in — use draft
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Auto-save draft
  useEffect(() => {
    if (!loading) localStorage.setItem("profileDraft", JSON.stringify(profile));
  }, [profile, loading]);

  const formatIndianNumber = (num: string) => {
    const digits = num.replace(/\D/g, "").slice(0, 10);
    if (digits.length <= 5) return digits;
    return `${digits.slice(0, 5)} ${digits.slice(5)}`;
  };

  const validateProfile = () => {
    const e: Record<string, string> = {};
    if (!profile.name.trim()) e.name = "Full name required";
    if (!phoneRegex.test(profile.phone.replace(/\D/g, ""))) e.phone = "Invalid 10-digit number";
    if (!profile.location.trim()) e.location = "Location required";
    if (!profile.title.trim()) e.title = "Professional title required";
    if (profile.bio.trim().length < 20) e.bio = "Bio minimum 20 characters";
    if (profile.skills.length === 0) e.skills = "Add at least one skill";
    if (profile.candidateType === "experienced" && profile.experience.length === 0)
      e.experience = "At least one experience entry required";
    if (profile.candidateType === "experienced") {
      profile.experience.forEach((exp, i) => {
        if (!exp.company) e[`exp_company_${i}`] = "Company required";
        if (!exp.role) e[`exp_role_${i}`] = "Role required";
        if (!exp.duration) e[`exp_duration_${i}`] = "Duration required";
      });
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const completeness = (() => {
    let score = 0;
    if (profile.name) score += 8;
    if (phoneRegex.test(profile.phone.replace(/\D/g, ""))) score += 8;
    if (profile.location) score += 8;
    if (profile.title) score += 8;
    if (profile.bio.length >= 20) score += 10;
    if (profile.photo) score += 8;
    if (profile.skills.length > 0) score += 12;
    if (profile.education.length > 0) score += 10;
    if (profile.candidateType === "experienced" && profile.experience.length > 0) score += 12;
    if (profile.candidateType === "fresher") score += 12; // auto-complete for freshers
    if (profile.projects.length > 0) score += 8;
    if (profile.certifications.length > 0) score += 4;
    if (profile.socials.linkedin || profile.socials.github) score += 4;
    return Math.min(score, 100);
  })();

  const updateField = <K extends keyof Profile>(key: K, value: Profile[K]) =>
    setProfile((prev) => ({ ...prev, [key]: value }));

  const addSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      updateField("skills", [...profile.skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateField("photo", reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!validateProfile()) {
      toast({ title: "Validation Error", description: "Fix highlighted fields", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload = { ...profile };
      if (payload.candidateType === "fresher") payload.experience = [];
      await api.put("/candidate/profile", payload);
      localStorage.removeItem("profileDraft");
      toast({ title: "Profile Saved", description: "Your profile updated successfully" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const FieldError = ({ field }: { field: string }) =>
    errors[field] ? <p className="text-xs text-destructive mt-1">{errors[field]}</p> : null;

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-6 w-full" />
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48" />)}
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <PageHeader
        title="Profile Builder"
        description="Complete your professional profile"
        action={{ label: saving ? "Saving..." : "Save Profile", icon: saving ? Loader2 : Save, onClick: handleSave, disabled: saving }}
      />

      {/* Completion Bar */}
      <Card>
        <CardContent className="p-5">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Profile Strength</span>
            <span className="font-bold text-sm">{completeness}%</span>
          </div>
          <Progress value={completeness} />
        </CardContent>
      </Card>

      {/* Photo + Basic Info */}
      <Card>
        <CardHeader><CardTitle className="flex gap-2"><User className="h-5 w-5" /> Basic Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {/* Photo */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-border">
                {profile.photo ? (
                  <img src={profile.photo} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <Camera className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <label className="absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90">
                <Plus className="h-3.5 w-3.5" />
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </label>
            </div>
            <div className="text-sm text-muted-foreground">Upload a professional photo<br />JPG, PNG up to 5MB</div>
          </div>

          <div>
            <Input placeholder="Full Name" value={profile.name} onChange={(e) => updateField("name", e.target.value)} className={errors.name ? "border-destructive" : ""} />
            <FieldError field="name" />
          </div>
          <div>
            <Input placeholder="Professional Title (e.g. Full Stack Developer)" value={profile.title} onChange={(e) => updateField("title", e.target.value)} className={errors.title ? "border-destructive" : ""} />
            <FieldError field="title" />
          </div>
          <div>
            <Input placeholder="+91 98765 43210" value={profile.phone} onChange={(e) => updateField("phone", formatIndianNumber(e.target.value))} className={errors.phone ? "border-destructive" : ""} />
            <FieldError field="phone" />
          </div>
          <div>
            <Input placeholder="City, State" value={profile.location} onChange={(e) => updateField("location", e.target.value)} className={errors.location ? "border-destructive" : ""} />
            <FieldError field="location" />
          </div>
          <div>
            <Textarea placeholder="Professional summary (career goal, expertise, achievements — min 20 chars)" value={profile.bio} onChange={(e) => updateField("bio", e.target.value)} className={errors.bio ? "border-destructive" : ""} />
            <FieldError field="bio" />
          </div>
        </CardContent>
      </Card>

      {/* Candidate Type */}
      <Card>
        <CardHeader><CardTitle className="flex gap-2"><Briefcase className="h-5 w-5" /> Candidate Type</CardTitle></CardHeader>
        <CardContent>
          <RadioGroup value={profile.candidateType} onValueChange={(v) => updateField("candidateType", v as "fresher" | "experienced")} className="flex gap-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="fresher" id="fresher" />
              <Label htmlFor="fresher">Fresher</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="experienced" id="experienced" />
              <Label htmlFor="experienced">Experienced</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader><CardTitle className="flex gap-2"><Code2 className="h-5 w-5" /> Skills</CardTitle></CardHeader>
        <CardContent>
          <FieldError field="skills" />
          <div className="flex flex-wrap gap-2 mb-3">
            {profile.skills.map((skill) => (
              <Badge key={skill} variant="secondary" className="gap-1">
                {skill}
                <X className="h-3 w-3 cursor-pointer" onClick={() => updateField("skills", profile.skills.filter((s) => s !== skill))} />
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input placeholder="React, Node.js, MongoDB" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())} />
            <Button onClick={addSkill} variant="outline"><Plus className="h-4 w-4" /></Button>
          </div>
        </CardContent>
      </Card>

      {/* Education */}
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="flex gap-2 items-center"><GraduationCap className="h-5 w-5" /> Education</CardTitle>
          <Button variant="outline" size="sm" onClick={() => updateField("education", [...profile.education, { school: "", degree: "", year: "" }])}><Plus className="h-4 w-4 mr-1" /> Add</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile.education.length === 0 && <p className="text-sm text-muted-foreground">No education added yet</p>}
          {profile.education.map((edu, i) => (
            <div key={i} className="grid gap-3 rounded-lg border border-border p-4 sm:grid-cols-3">
              <Input placeholder="School / University" value={edu.school} onChange={(e) => { const u = [...profile.education]; u[i] = { ...u[i], school: e.target.value }; updateField("education", u); }} />
              <Input placeholder="Degree" value={edu.degree} onChange={(e) => { const u = [...profile.education]; u[i] = { ...u[i], degree: e.target.value }; updateField("education", u); }} />
              <div className="flex gap-2">
                <Input placeholder="Year" value={edu.year} onChange={(e) => { const u = [...profile.education]; u[i] = { ...u[i], year: e.target.value }; updateField("education", u); }} />
                <Button variant="ghost" size="icon" onClick={() => updateField("education", profile.education.filter((_, idx) => idx !== i))} className="text-destructive"><X className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Experience */}
      <Card className={profile.candidateType === "fresher" ? "opacity-60" : ""}>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="flex gap-2 items-center"><Building2 className="h-5 w-5" /> Experience</CardTitle>
          {profile.candidateType === "experienced" && (
            <Button variant="outline" size="sm" onClick={() => updateField("experience", [...profile.experience, { company: "", role: "", duration: "", description: "" }])}><Plus className="h-4 w-4 mr-1" /> Add</Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {profile.candidateType === "fresher" ? (
            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="text-sm text-muted-foreground">Experience section is not required for freshers</p>
            </div>
          ) : (
            <>
              <FieldError field="experience" />
              {profile.experience.length === 0 && <p className="text-sm text-muted-foreground">No experience added yet</p>}
              {profile.experience.map((exp, i) => (
                <div key={i} className="space-y-3 rounded-lg border border-border p-4">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <Input placeholder="Company" value={exp.company} onChange={(e) => { const u = [...profile.experience]; u[i] = { ...u[i], company: e.target.value }; updateField("experience", u); }} className={errors[`exp_company_${i}`] ? "border-destructive" : ""} />
                      <FieldError field={`exp_company_${i}`} />
                    </div>
                    <div>
                      <Input placeholder="Role" value={exp.role} onChange={(e) => { const u = [...profile.experience]; u[i] = { ...u[i], role: e.target.value }; updateField("experience", u); }} className={errors[`exp_role_${i}`] ? "border-destructive" : ""} />
                      <FieldError field={`exp_role_${i}`} />
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Input placeholder="Duration" value={exp.duration} onChange={(e) => { const u = [...profile.experience]; u[i] = { ...u[i], duration: e.target.value }; updateField("experience", u); }} className={errors[`exp_duration_${i}`] ? "border-destructive" : ""} />
                        <FieldError field={`exp_duration_${i}`} />
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => updateField("experience", profile.experience.filter((_, idx) => idx !== i))} className="text-destructive"><X className="h-4 w-4" /></Button>
                    </div>
                  </div>
                  <Textarea placeholder="Describe your achievements" value={exp.description} onChange={(e) => { const u = [...profile.experience]; u[i] = { ...u[i], description: e.target.value }; updateField("experience", u); }} />
                </div>
              ))}
            </>
          )}
        </CardContent>
      </Card>

      {/* Projects */}
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="flex gap-2 items-center"><FolderOpen className="h-5 w-5" /> Projects</CardTitle>
          <Button variant="outline" size="sm" onClick={() => updateField("projects", [...profile.projects, { name: "", url: "", description: "" }])}><Plus className="h-4 w-4 mr-1" /> Add</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile.projects.length === 0 && <p className="text-sm text-muted-foreground">No projects added yet</p>}
          {profile.projects.map((proj, i) => (
            <div key={i} className="space-y-3 rounded-lg border border-border p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Input placeholder="Project Name" value={proj.name} onChange={(e) => { const u = [...profile.projects]; u[i] = { ...u[i], name: e.target.value }; updateField("projects", u); }} />
                <div className="flex gap-2">
                  <Input placeholder="Project URL" value={proj.url} onChange={(e) => { const u = [...profile.projects]; u[i] = { ...u[i], url: e.target.value }; updateField("projects", u); }} />
                  <Button variant="ghost" size="icon" onClick={() => updateField("projects", profile.projects.filter((_, idx) => idx !== i))} className="text-destructive"><X className="h-4 w-4" /></Button>
                </div>
              </div>
              <Textarea placeholder="Project description" value={proj.description} onChange={(e) => { const u = [...profile.projects]; u[i] = { ...u[i], description: e.target.value }; updateField("projects", u); }} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Certifications */}
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="flex gap-2 items-center"><Award className="h-5 w-5" /> Certifications</CardTitle>
          <Button variant="outline" size="sm" onClick={() => updateField("certifications", [...profile.certifications, { name: "", issuer: "", year: "", credentialUrl: "" }])}><Plus className="h-4 w-4 mr-1" /> Add</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile.certifications.length === 0 && <p className="text-sm text-muted-foreground">No certifications added yet</p>}
          {profile.certifications.map((cert, i) => (
            <div key={i} className="grid gap-3 rounded-lg border border-border p-4 sm:grid-cols-2">
              <Input placeholder="Certification Name" value={cert.name} onChange={(e) => { const u = [...profile.certifications]; u[i] = { ...u[i], name: e.target.value }; updateField("certifications", u); }} />
              <Input placeholder="Issuing Organization" value={cert.issuer} onChange={(e) => { const u = [...profile.certifications]; u[i] = { ...u[i], issuer: e.target.value }; updateField("certifications", u); }} />
              <Input placeholder="Year" value={cert.year} onChange={(e) => { const u = [...profile.certifications]; u[i] = { ...u[i], year: e.target.value }; updateField("certifications", u); }} />
              <div className="flex gap-2">
                <Input placeholder="Credential URL" value={cert.credentialUrl} onChange={(e) => { const u = [...profile.certifications]; u[i] = { ...u[i], credentialUrl: e.target.value }; updateField("certifications", u); }} />
                <Button variant="ghost" size="icon" onClick={() => updateField("certifications", profile.certifications.filter((_, idx) => idx !== i))} className="text-destructive"><X className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader><CardTitle className="flex gap-2 items-center"><Globe className="h-5 w-5" /> Social Links</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="LinkedIn URL" value={profile.socials.linkedin} onChange={(e) => updateField("socials", { ...profile.socials, linkedin: e.target.value })} />
          <Input placeholder="GitHub URL" value={profile.socials.github} onChange={(e) => updateField("socials", { ...profile.socials, github: e.target.value })} />
          <Input placeholder="Portfolio URL" value={profile.socials.portfolio} onChange={(e) => updateField("socials", { ...profile.socials, portfolio: e.target.value })} />
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProfileBuilder;
