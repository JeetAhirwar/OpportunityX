import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  GraduationCap,
  Building2,
  FolderOpen,
  Globe,
  Plus,
  X,
  Save,
  Code2,
} from "lucide-react";

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
  experience: {
    company: string;
    role: string;
    duration: string;
    description: string;
  }[];
  projects: { name: string; url: string; description: string }[];
  socials: { linkedin: string; github: string; portfolio: string };
}

const defaultProfile: ProfileData = {
  name: "",
  phone: "",
  location: "",
  bio: "",
  skills: [],
  education: [],
  experience: [],
  projects: [],
  socials: { linkedin: "", github: "", portfolio: "" },
};

const ProfileBuilder = () => {
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProfileData>(() => {
    const saved = localStorage.getItem("profileDraft");
    return saved ? JSON.parse(saved) : defaultProfile;
  });

  const [newSkill, setNewSkill] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const phoneRegex = /^[6-9]\d{9}$/;
  // const urlRegex = /^(https?:\/\/)?([\w\-])+\.{1}[a-zA-Z]{2,}(\/.*)?$/;

  // Auto-save draft
  useEffect(() => {
    localStorage.setItem("profileDraft", JSON.stringify(profile));
  }, [profile]);

  const formatIndianNumber = (num: string) => {
    const digits = num.replace(/\D/g, "").slice(0, 10);
    if (digits.length <= 5) return digits;
    return `${digits.slice(0, 5)} ${digits.slice(5)}`;
  };

  const validateProfile = () => {
    const newErrors: any = {};

    if (!profile.name.trim()) newErrors.name = "Full name required";
    if (!phoneRegex.test(profile.phone.replace(/\D/g, "")))
      newErrors.phone = "Invalid Indian number";
    if (!profile.location.trim()) newErrors.location = "Location required";
    if (profile.bio.trim().length < 20)
      newErrors.bio = "Bio minimum 20 characters";
    if (profile.skills.length === 0)
      newErrors.skills = "Add at least one skill";

    // if (
    //   profile.socials.linkedin &&
    //   !urlRegex.test(profile.socials.linkedin)
    // )
    //   newErrors.linkedin = "Invalid LinkedIn URL";

    // if (profile.socials.github && !urlRegex.test(profile.socials.github))
    //   newErrors.github = "Invalid GitHub URL";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const completeness = (() => {
    let score = 0;
    if (profile.name) score += 10;
    if (phoneRegex.test(profile.phone.replace(/\D/g, ""))) score += 10;
    if (profile.location) score += 10;
    if (profile.bio.length >= 20) score += 15;
    if (profile.skills.length > 0) score += 15;
    if (profile.education.length > 0) score += 10;
    if (profile.experience.length > 0) score += 15;
    if (profile.projects.length > 0) score += 10;
    if (profile.socials.linkedin || profile.socials.github) score += 5;
    return Math.min(score, 100);
  })();

  const updateField = (key: keyof ProfileData, value: any) =>
    setProfile((prev) => ({ ...prev, [key]: value }));

  const addSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      updateField("skills", [...profile.skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const handleSave = async () => {
    if (!validateProfile()) {
      toast({
        title: "Validation Error",
        description: "Fix highlighted fields",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Login required");

      const res = await fetch(
        "http://localhost:5000/api/candidate/profile",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(profile),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      localStorage.removeItem("profileDraft");

      toast({
        title: "Profile Saved",
        description: "Your biodata updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }

    setSaving(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <PageHeader
        title="Profile Builder"
        description="Complete your professional biodata"
        action={{
          label: saving ? "Saving..." : "Save Profile",
          icon: Save,
          onClick: handleSave,
          disabled: saving,
        }}
      />

      <Card>
        <CardContent className="p-5">
          <div className="flex justify-between mb-2">
            <span>Profile Strength</span>
            <span className="font-bold">{completeness}%</span>
          </div>
          <Progress value={completeness} />
        </CardContent>
      </Card>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex gap-2">
            <User /> Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">

          <Input
            placeholder="Full Name"
            value={profile.name}
            onChange={(e) => updateField("name", e.target.value)}
          />

          <Input
            placeholder="+91 98765 43210"
            value={profile.phone}
            onChange={(e) =>
              updateField("phone", formatIndianNumber(e.target.value))
            }
          />

          <Input
            placeholder="City, State"
            value={profile.location}
            onChange={(e) => updateField("location", e.target.value)}
          />

          <Textarea
            placeholder="Professional summary (career goal, expertise, achievements)"
            value={profile.bio}
            onChange={(e) => updateField("bio", e.target.value)}
          />

        </CardContent>
      </Card>
<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Code2 className="h-5 w-5" />
      Skills
    </CardTitle>
  </CardHeader>

  <CardContent>
    {errors.skills && (
      <p className="text-xs text-red-500 mb-2">
        {errors.skills}
      </p>
    )}

    <div className="flex flex-wrap gap-2 mb-3">
      {profile.skills.map((skill) => (
        <Badge key={skill} variant="secondary" className="gap-1">
          {skill}
          <X
            className="h-3 w-3 cursor-pointer"
            onClick={() =>
              updateField(
                "skills",
                profile.skills.filter((s) => s !== skill)
              )
            }
          />
        </Badge>
      ))}
    </div>

    <div className="flex gap-2">
      <Input
        placeholder="React, Node.js, MongoDB"
        value={newSkill}
        onChange={(e) => setNewSkill(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && addSkill()}
      />
      <Button onClick={addSkill} variant="outline">
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  </CardContent>
</Card>
<Card>
  <CardHeader className="flex flex-row justify-between items-center">
    <CardTitle className="flex gap-2 items-center">
      <GraduationCap className="h-5 w-5" /> Education
    </CardTitle>
    <Button
      variant="outline"
      size="sm"
      onClick={() =>
        updateField("education", [
          ...profile.education,
          { school: "", degree: "", year: "" },
        ])
      }
    >
      <Plus className="h-4 w-4 mr-1" /> Add
    </Button>
  </CardHeader>

  <CardContent className="space-y-4">
    {errors.education && (
      <p className="text-xs text-red-500 mb-2">
        {errors.education}
      </p>
    )}
    {profile.education.length === 0 && (
      <p className="text-sm text-muted-foreground">
        No education added yet
      </p>
    )}

    {profile.education.map((edu, i) => (
      <div
        key={i}
        className="grid gap-3 rounded-lg border p-4 sm:grid-cols-3"
      >
        <Input
          placeholder="School / University"
          value={edu.school}
          onChange={(e) => {
            const updated = [...profile.education];
            updated[i].school = e.target.value;
            updateField("education", updated);
          }}
        />

        <Input
          placeholder="Degree"
          value={edu.degree}
          onChange={(e) => {
            const updated = [...profile.education];
            updated[i].degree = e.target.value;
            updateField("education", updated);
          }}
        />

        <div className="flex gap-2">
          <Input
            placeholder="Year (2022)"
            value={edu.year}
            onChange={(e) => {
              const updated = [...profile.education];
              updated[i].year = e.target.value;
              updateField("education", updated);
            }}
          />

          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              updateField(
                "education",
                profile.education.filter((_, index) => index !== i)
              )
            }
            className="text-destructive"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    ))}
  </CardContent>
</Card>
<Card>
  <CardHeader className="flex flex-row justify-between items-center">
    <CardTitle className="flex gap-2 items-center">
      <Building2 className="h-5 w-5" /> Experience
    </CardTitle>
    <Button
      variant="outline"
      size="sm"
      onClick={() =>
        updateField("experience", [
          ...profile.experience,
          { company: "", role: "", duration: "", description: "" },
        ])
      }
    >
      <Plus className="h-4 w-4 mr-1" /> Add
    </Button>
  </CardHeader>

  <CardContent className="space-y-4">
    {profile.experience.length === 0 && (
      <p className="text-sm text-muted-foreground">
        No experience added yet
      </p>
    )}

    {profile.experience.map((exp, i) => (
      <div key={i} className="space-y-3 rounded-lg border p-4">

        <div className="grid gap-3 sm:grid-cols-3">
          <Input
            placeholder="Company"
            value={exp.company}
            onChange={(e) => {
              const updated = [...profile.experience];
              updated[i].company = e.target.value;
              updateField("experience", updated);
            }}
          />

          <Input
            placeholder="Role"
            value={exp.role}
            onChange={(e) => {
              const updated = [...profile.experience];
              updated[i].role = e.target.value;
              updateField("experience", updated);
            }}
          />

          <div className="flex gap-2">
            <Input
              placeholder="Duration (Jan 2023 - Dec 2024)"
              value={exp.duration}
              onChange={(e) => {
                const updated = [...profile.experience];
                updated[i].duration = e.target.value;
                updateField("experience", updated);
              }}
            />

            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                updateField(
                  "experience",
                  profile.experience.filter((_, index) => index !== i)
                )
              }
              className="text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Textarea
          placeholder="Describe your achievements and responsibilities"
          value={exp.description}
          onChange={(e) => {
            const updated = [...profile.experience];
            updated[i].description = e.target.value;
            updateField("experience", updated);
          }}
        />
      </div>
    ))}
  </CardContent>
</Card>
<Card>
  <CardHeader className="flex flex-row justify-between items-center">
    <CardTitle className="flex gap-2 items-center">
      <FolderOpen className="h-5 w-5" /> Projects
    </CardTitle>
    <Button
      variant="outline"
      size="sm"
      onClick={() =>
        updateField("projects", [
          ...profile.projects,
          { name: "", url: "", description: "" },
        ])
      }
    >
      <Plus className="h-4 w-4 mr-1" /> Add
    </Button>
  </CardHeader>

  <CardContent className="space-y-4">
    {profile.projects.length === 0 && (
      <p className="text-sm text-muted-foreground">
        No projects added yet
      </p>
    )}

    {profile.projects.map((proj, i) => (
      <div key={i} className="space-y-3 rounded-lg border p-4">

        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            placeholder="Project Name"
            value={proj.name}
            onChange={(e) => {
              const updated = [...profile.projects];
              updated[i].name = e.target.value;
              updateField("projects", updated);
            }}
          />

          <div className="flex gap-2">
            <Input
              placeholder="Project URL"
              value={proj.url}
              onChange={(e) => {
                const updated = [...profile.projects];
                updated[i].url = e.target.value;
                updateField("projects", updated);
              }}
            />

            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                updateField(
                  "projects",
                  profile.projects.filter((_, index) => index !== i)
                )
              }
              className="text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Textarea
          placeholder="Project description"
          value={proj.description}
          onChange={(e) => {
            const updated = [...profile.projects];
            updated[i].description = e.target.value;
            updateField("projects", updated);
          }}
        />
      </div>
    ))}
  </CardContent>
</Card>
<Card>
  <CardHeader>
    <CardTitle className="flex gap-2 items-center">
      <Globe className="h-5 w-5" /> Social Links
    </CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">

    <Input
      placeholder="LinkedIn URL"
      value={profile.socials.linkedin}
      onChange={(e) =>
        updateField("socials", {
          ...profile.socials,
          linkedin: e.target.value,
        })
      }
    />

    <Input
      placeholder="GitHub URL"
      value={profile.socials.github}
      onChange={(e) =>
        updateField("socials", {
          ...profile.socials,
          github: e.target.value,
        })
      }
    />

    <Input
      placeholder="Portfolio URL"
      value={profile.socials.portfolio}
      onChange={(e) =>
        updateField("socials", {
          ...profile.socials,
          portfolio: e.target.value,
        })
      }
    />

  </CardContent>
</Card>


    </motion.div>
  );
};

export default ProfileBuilder;