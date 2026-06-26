import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin, GraduationCap, Building2, FolderOpen, Globe,
  Award, Download, ExternalLink, Github, Linkedin, ArrowLeft, User,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import SEOHead from "@/components/common/SEOHead";
import api from "@/services/api";
import type { Profile } from "@/types";

const PublicProfile = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await api.get<Profile>(`/profile/${username}`, { skipAuth: true });
        setProfile(data);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Could not load profile");
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

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <User className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h1 className="font-display text-2xl font-bold">Profile unavailable</h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{error || "This public profile could not be found."}</p>
          <Button className="mt-6" variant="outline" asChild><Link to="/jobs">Browse Jobs</Link></Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`${profile.name} - OpportunityX`}
        description={profile.bio?.slice(0, 155) || `${profile.name}'s professional profile`}
        canonical={`https://opportunityx.com/profile/${username}`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: profile.name,
          jobTitle: profile.title,
          url: `https://opportunityx.com/profile/${username}`,
          sameAs: [profile.socials.linkedin, profile.socials.github, profile.socials.portfolio].filter(Boolean),
        }}
      />
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
                        <p className="text-sm text-muted-foreground">{exp.company} - {exp.duration}</p>
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
                        <p className="text-sm text-muted-foreground">{edu.school} - {edu.year}</p>
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
                        <p className="text-xs text-muted-foreground">{cert.issuer} - {cert.year}</p>
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

