import { useState } from "react";
import { motion } from "framer-motion";
import { Building2, Globe, Users, Save, Plus, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/common/PageHeader";
import FileUpload from "@/components/common/FileUpload";

const CompanyProfile = () => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", industry: "", size: "", location: "", website: "",
    description: "", culture: "",
    benefits: [] as string[], newBenefit: "",
    linkedin: "", twitter: "",
  });
  const [logo, setLogo] = useState<{ name: string } | null>(null);

  const update = (key: string, value: any) => setForm((p) => ({ ...p, [key]: value }));

  const addBenefit = () => {
    if (form.newBenefit.trim()) {
      update("benefits", [...form.benefits, form.newBenefit.trim()]);
      update("newBenefit", "");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    toast({ title: "Company profile saved" });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader title="Company Profile" description="Showcase your company to attract top talent" action={{ label: saving ? "Saving..." : "Save", icon: Save, onClick: handleSave }} />

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Building2 className="h-5 w-5 text-primary" /> Company Logo</CardTitle></CardHeader>
        <CardContent>
          <FileUpload accept=".png,.jpg,.jpeg,.svg" maxSize={5} onFileSelect={(f) => setLogo({ name: f.name })} onRemove={() => setLogo(null)} currentFile={logo} label="Upload company logo" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Company Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label>Company Name</Label><Input placeholder="Acme Inc" value={form.name} onChange={(e) => update("name", e.target.value)} /></div>
            <div><Label>Industry</Label><Input placeholder="Technology" value={form.industry} onChange={(e) => update("industry", e.target.value)} /></div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label>Company Size</Label><Input placeholder="50-200" value={form.size} onChange={(e) => update("size", e.target.value)} /></div>
            <div><Label>Headquarters</Label><Input placeholder="San Francisco, CA" value={form.location} onChange={(e) => update("location", e.target.value)} /></div>
          </div>
          <div><Label>Website</Label><Input placeholder="https://example.com" value={form.website} onChange={(e) => update("website", e.target.value)} /></div>
          <div><Label>About the Company</Label><Textarea placeholder="Tell candidates about your company's mission, vision, and values..." value={form.description} onChange={(e) => update("description", e.target.value)} rows={4} /></div>
          <div><Label>Company Culture</Label><Textarea placeholder="Describe your work environment, team dynamics, and growth opportunities..." value={form.culture} onChange={(e) => update("culture", e.target.value)} rows={3} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Benefits & Perks</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-3">
            {form.benefits.map((b) => (
              <Badge key={b} variant="secondary" className="gap-1 pr-1">{b}<button onClick={() => update("benefits", form.benefits.filter((x) => x !== b))} className="ml-1 hover:text-destructive">×</button></Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input placeholder="e.g. Remote work, Health insurance" value={form.newBenefit} onChange={(e) => update("newBenefit", e.target.value)} onKeyDown={(e) => e.key === "Enter" && addBenefit()} />
            <Button variant="outline" onClick={addBenefit}><Plus className="h-4 w-4" /></Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Globe className="h-5 w-5 text-primary" /> Social Links</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><Label>LinkedIn</Label><Input placeholder="https://linkedin.com/company/..." value={form.linkedin} onChange={(e) => update("linkedin", e.target.value)} /></div>
          <div><Label>Twitter / X</Label><Input placeholder="https://x.com/..." value={form.twitter} onChange={(e) => update("twitter", e.target.value)} /></div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CompanyProfile;
