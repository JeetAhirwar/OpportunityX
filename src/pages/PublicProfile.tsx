import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin, Briefcase, GraduationCap, Building2, FolderOpen, Globe,
  Award, Download, ExternalLink, Github, Linkedin, ArrowLeft, User,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import api from "@/lib/api";
import type { Profile } from "@/types";

const mockProfile: Profile = {
  name: "Arjun Mehta",
  phone: "",
  location: "Bengaluru, Karnataka",
  title: "Full Stack Developer",
  bio: "Passionate full stack developer with 4+ years of experience building scalable web applications. Proficient in React, Node.js, and cloud technologies. Love to create elegant solutions to complex problems.",
  photo: "",
  candidateType: "experienced",
  skills: ["React", "TypeScript", "Node.js", "MongoDB", "AWS", "Docker", "GraphQL", "Tailwind CSS"],
  education: [
    { school: "IIT Delhi", degree: "B.Tech Computer Science", year: "2020" },
    { school: "DPS R.K. Puram", degree: "Class XII CBSE", year: "2016" },
  ],
  experience: [
    { company: "Flipkart", role: "SDE-2", duration: "Jan 2022 - Present", description: "Building large-scale e-commerce frontend with React and micro-frontends architecture." },
    { company: "Infosys", role: "Systems Engineer", duration: "Jul 2020 - Dec 2021", description: "Developed RESTful APIs and maintained enterprise Java applications." },
  ],
  projects: [
    { name: "DevConnect", url: "https://github.com/arjun/devconnect", description: "A social platform for developers with real-time chat and project collaboration features." },
    { name: "CloudDeploy", url: "https://github.com/arjun/clouddeploy", description: "CLI tool for automated deployment to AWS, GCP, and Azure." },
  ],
  certifications: [
    { name: "AWS Solutions Architect", issuer: "Amazon Web Services", year: "2023", credentialUrl: "" },
    { name: "Meta Frontend Developer", issuer: "Meta / Coursera", year: "2022", credentialUrl: "" },
  ],
  socials: { linkedin: "https://linkedin.com/in/arjunmehta", github: "https://github.com/arjunmehta", portfolio: "https://arjunmehta.dev" },
  resumeUrl: "#",
};

const PublicProfile = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await api.get<Profile>(`/profile/${username}`, { skipAuth: true });
        setProfile(data);
      } catch {
        setProfile(mockProfile); // Fallback for demo
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 space-y-6">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
          <div className="grid gap-4 sm:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40" />)}</div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" size="sm" className="mb-6" asChild>
          <Link to="/jobs"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Link>
        </Button>

        {/* Banner */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="overflow-hidden">
            <div className="gradient-primary h-32 md:h-40" />
            <CardContent className="relative px-6 pb-6">
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end -mt-12">
                <div className="h-24 w-24 rounded-full bg-muted border-4 border-card flex items-center justify-center overflow-hidden shadow-lg">
                  {profile.photo ? (
                    <img src={profile.photo} alt={profile.name} className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-10 w-10 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="font-display text-2xl font-bold">{profile.name}</h1>
                  <p className="text-muted-foreground">{profile.title}</p>
                  {profile.location && (
                    <p className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <MapPin className="h-3.5 w-3.5" /> {profile.location}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  {profile.resumeUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer"><Download className="mr-2 h-4 w-4" /> Resume</a>
                    </Button>
                  )}
                  {profile.socials.linkedin && (
                    <Button variant="outline" size="icon" className="h-9 w-9" asChild>
                      <a href={profile.socials.linkedin} target="_blank" rel="noopener noreferrer"><Linkedin className="h-4 w-4" /></a>
                    </Button>
                  )}
                  {profile.socials.github && (
                    <Button variant="outline" size="icon" className="h-9 w-9" asChild>
                      <a href={profile.socials.github} target="_blank" rel="noopener noreferrer"><Github className="h-4 w-4" /></a>
                    </Button>
                  )}
                  {profile.socials.portfolio && (
                    <Button variant="outline" size="icon" className="h-9 w-9" asChild>
                      <a href={profile.socials.portfolio} target="_blank" rel="noopener noreferrer"><Globe className="h-4 w-4" /></a>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid gap-6 mt-6 lg:grid-cols-3">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio */}
            {profile.bio && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="font-display font-semibold mb-3">About</h2>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{profile.bio}</p>
                </CardContent>
              </Card>
            )}

            {/* Experience */}
            {profile.experience.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="font-display font-semibold mb-4 flex items-center gap-2"><Building2 className="h-5 w-5 text-primary" /> Experience</h2>
                  <div className="space-y-4">
                    {profile.experience.map((exp, i) => (
                      <div key={i} className="relative pl-6 border-l-2 border-border pb-4 last:pb-0">
                        <div className="absolute -left-[7px] top-1 h-3 w-3 rounded-full bg-primary" />
                        <h3 className="font-semibold">{exp.role}</h3>
                        <p className="text-sm text-muted-foreground">{exp.company} · {exp.duration}</p>
                        {exp.description && <p className="mt-1 text-sm text-muted-foreground">{exp.description}</p>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Education */}
            {profile.education.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="font-display font-semibold mb-4 flex items-center gap-2"><GraduationCap className="h-5 w-5 text-primary" /> Education</h2>
                  <div className="space-y-4">
                    {profile.education.map((edu, i) => (
                      <div key={i} className="relative pl-6 border-l-2 border-border pb-4 last:pb-0">
                        <div className="absolute -left-[7px] top-1 h-3 w-3 rounded-full bg-accent" />
                        <h3 className="font-semibold">{edu.degree}</h3>
                        <p className="text-sm text-muted-foreground">{edu.school} · {edu.year}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Projects */}
            {profile.projects.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="font-display font-semibold mb-4 flex items-center gap-2"><FolderOpen className="h-5 w-5 text-primary" /> Projects</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {profile.projects.map((proj, i) => (
                      <div key={i} className="rounded-lg border border-border p-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{proj.name}</h3>
                          {proj.url && (
                            <a href={proj.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                        {proj.description && <p className="mt-1 text-sm text-muted-foreground">{proj.description}</p>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Skills */}
            {profile.skills.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="font-display font-semibold mb-3">Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill) => <Badge key={skill} variant="secondary">{skill}</Badge>)}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Certifications */}
            {profile.certifications.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="font-display font-semibold mb-3 flex items-center gap-2"><Award className="h-5 w-5 text-primary" /> Certifications</h2>
                  <div className="space-y-3">
                    {profile.certifications.map((cert, i) => (
                      <div key={i} className="rounded-lg bg-muted p-3">
                        <p className="font-medium text-sm">{cert.name}</p>
                        <p className="text-xs text-muted-foreground">{cert.issuer} · {cert.year}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PublicProfile;
