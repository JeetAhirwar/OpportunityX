import { useState } from "react";
import { motion } from "framer-motion";
import { User, GraduationCap, Building2, FolderOpen, Globe, Plus, X, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/common/PageHeader";

interface ProfileData {
  name: string;
  phone: string;
  location: string;
  bio: string;
  skills: string[];
  education: { school: string; degree: string; year: string }[];
  experience: { company: string; role: string; duration: string; description: string }[];
  projects: { name: string; url: string; description: string }[];
  socials: { linkedin: string; github: string; portfolio: string };
}

const defaultProfile: ProfileData = {
  name: "", phone: "", location: "", bio: "",
  skills: [],
  education: [],
  experience: [],
  projects: [],
  socials: { linkedin: "", github: "", portfolio: "" },
};

const ProfileBuilder = () => {
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProfileData>(defaultProfile);
  const [newSkill, setNewSkill] = useState("");
  const [saving, setSaving] = useState(false);

  const completeness = (() => {
    let score = 0;
    if (profile.name) score += 15;
    if (profile.phone) score += 10;
    if (profile.location) score += 10;
    if (profile.bio) score += 15;
    if (profile.skills.length > 0) score += 15;
    if (profile.education.length > 0) score += 10;
    if (profile.experience.length > 0) score += 15;
    if (profile.socials.linkedin || profile.socials.github) score += 10;
    return Math.min(score, 100);
  })();

  const updateField = <K extends keyof ProfileData>(key: K, value: ProfileData[K]) =>
    setProfile((prev) => ({ ...prev, [key]: value }));

  const addSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      updateField("skills", [...profile.skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const addEducation = () => updateField("education", [...profile.education, { school: "", degree: "", year: "" }]);
  const addExperience = () => updateField("experience", [...profile.experience, { company: "", role: "", duration: "", description: "" }]);
  const addProject = () => updateField("projects", [...profile.projects, { name: "", url: "", description: "" }]);

  const handleSave = async () => {
    setSaving(true);
    // API call: api.put("/candidate/profile", profile)
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    toast({ title: "Profile saved", description: "Your profile has been updated successfully." });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader title="Profile Builder" description="Complete your profile to stand out to recruiters" action={{ label: saving ? "Saving..." : "Save Profile", icon: Save, onClick: handleSave }} />

      {/* Completion bar */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Profile Completeness</span>
            <span className="text-sm font-bold text-primary">{completeness}%</span>
          </div>
          <Progress value={completeness} />
          {completeness < 100 && <p className="mt-2 text-xs text-muted-foreground">Complete all sections to maximize your visibility to recruiters</p>}
        </CardContent>
      </Card>

      {/* Basic Info */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg"><User className="h-5 w-5 text-primary" /> Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label>Full Name</Label><Input placeholder="John Doe" value={profile.name} onChange={(e) => updateField("name", e.target.value)} /></div>
            <div><Label>Phone</Label><Input placeholder="+1 (555) 000-0000" value={profile.phone} onChange={(e) => updateField("phone", e.target.value)} /></div>
          </div>
          <div><Label>Location</Label><Input placeholder="San Francisco, CA" value={profile.location} onChange={(e) => updateField("location", e.target.value)} /></div>
          <div><Label>Bio</Label><Textarea placeholder="A brief description about yourself, your career goals, and what you're looking for..." value={profile.bio} onChange={(e) => updateField("bio", e.target.value)} rows={4} /></div>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-3">
            {profile.skills.map((skill) => (
              <Badge key={skill} variant="secondary" className="gap-1 pr-1">
                {skill}
                <button onClick={() => updateField("skills", profile.skills.filter((s) => s !== skill))} className="ml-1 rounded-full p-0.5 hover:bg-destructive/20"><X className="h-3 w-3" /></button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input placeholder="Add a skill (e.g. React, Python)" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addSkill()} />
            <Button variant="outline" onClick={addSkill}><Plus className="h-4 w-4" /></Button>
          </div>
        </CardContent>
      </Card>

      {/* Education */}
      <Card>
        <CardHeader className="pb-4 flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg"><GraduationCap className="h-5 w-5 text-primary" /> Education</CardTitle>
          <Button variant="outline" size="sm" onClick={addEducation}><Plus className="mr-1 h-4 w-4" /> Add</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile.education.length === 0 && <p className="text-sm text-muted-foreground">No education added yet</p>}
          {profile.education.map((edu, i) => (
            <div key={i} className="grid gap-3 rounded-lg border border-border p-4 sm:grid-cols-3">
              <Input placeholder="School / University" value={edu.school} onChange={(e) => { const ed = [...profile.education]; ed[i] = { ...ed[i], school: e.target.value }; updateField("education", ed); }} />
              <Input placeholder="Degree / Field" value={edu.degree} onChange={(e) => { const ed = [...profile.education]; ed[i] = { ...ed[i], degree: e.target.value }; updateField("education", ed); }} />
              <div className="flex gap-2">
                <Input placeholder="Year" value={edu.year} onChange={(e) => { const ed = [...profile.education]; ed[i] = { ...ed[i], year: e.target.value }; updateField("education", ed); }} />
                <Button variant="ghost" size="icon" onClick={() => updateField("education", profile.education.filter((_, j) => j !== i))} className="text-destructive shrink-0"><X className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Experience */}
      <Card>
        <CardHeader className="pb-4 flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg"><Building2 className="h-5 w-5 text-primary" /> Experience</CardTitle>
          <Button variant="outline" size="sm" onClick={addExperience}><Plus className="mr-1 h-4 w-4" /> Add</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile.experience.length === 0 && <p className="text-sm text-muted-foreground">No experience added yet</p>}
          {profile.experience.map((exp, i) => (
            <div key={i} className="space-y-3 rounded-lg border border-border p-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <Input placeholder="Company" value={exp.company} onChange={(e) => { const ex = [...profile.experience]; ex[i] = { ...ex[i], company: e.target.value }; updateField("experience", ex); }} />
                <Input placeholder="Role / Title" value={exp.role} onChange={(e) => { const ex = [...profile.experience]; ex[i] = { ...ex[i], role: e.target.value }; updateField("experience", ex); }} />
                <div className="flex gap-2">
                  <Input placeholder="Duration" value={exp.duration} onChange={(e) => { const ex = [...profile.experience]; ex[i] = { ...ex[i], duration: e.target.value }; updateField("experience", ex); }} />
                  <Button variant="ghost" size="icon" onClick={() => updateField("experience", profile.experience.filter((_, j) => j !== i))} className="text-destructive shrink-0"><X className="h-4 w-4" /></Button>
                </div>
              </div>
              <Textarea placeholder="Describe your responsibilities and achievements..." value={exp.description} onChange={(e) => { const ex = [...profile.experience]; ex[i] = { ...ex[i], description: e.target.value }; updateField("experience", ex); }} rows={2} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Projects */}
      <Card>
        <CardHeader className="pb-4 flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg"><FolderOpen className="h-5 w-5 text-primary" /> Projects</CardTitle>
          <Button variant="outline" size="sm" onClick={addProject}><Plus className="mr-1 h-4 w-4" /> Add</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile.projects.length === 0 && <p className="text-sm text-muted-foreground">No projects added yet</p>}
          {profile.projects.map((proj, i) => (
            <div key={i} className="space-y-3 rounded-lg border border-border p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Input placeholder="Project Name" value={proj.name} onChange={(e) => { const p = [...profile.projects]; p[i] = { ...p[i], name: e.target.value }; updateField("projects", p); }} />
                <div className="flex gap-2">
                  <Input placeholder="URL" value={proj.url} onChange={(e) => { const p = [...profile.projects]; p[i] = { ...p[i], url: e.target.value }; updateField("projects", p); }} />
                  <Button variant="ghost" size="icon" onClick={() => updateField("projects", profile.projects.filter((_, j) => j !== i))} className="text-destructive shrink-0"><X className="h-4 w-4" /></Button>
                </div>
              </div>
              <Textarea placeholder="Brief description of the project..." value={proj.description} onChange={(e) => { const p = [...profile.projects]; p[i] = { ...p[i], description: e.target.value }; updateField("projects", p); }} rows={2} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Socials */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg"><Globe className="h-5 w-5 text-primary" /> Social Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div><Label>LinkedIn</Label><Input placeholder="https://linkedin.com/in/yourprofile" value={profile.socials.linkedin} onChange={(e) => updateField("socials", { ...profile.socials, linkedin: e.target.value })} /></div>
          <div><Label>GitHub</Label><Input placeholder="https://github.com/yourusername" value={profile.socials.github} onChange={(e) => updateField("socials", { ...profile.socials, github: e.target.value })} /></div>
          <div><Label>Portfolio</Label><Input placeholder="https://yourportfolio.com" value={profile.socials.portfolio} onChange={(e) => updateField("socials", { ...profile.socials, portfolio: e.target.value })} /></div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProfileBuilder;
