import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Building2, CheckCircle, Clock, Loader2, Save, Send, ShieldAlert, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/common/PageHeader";
import {
  CompanyProfileData, getCompanyProfile, saveCompanyProfile, submitCompanyVerification,
} from "@/features/recruiter/recruiterApi";

const emptyCompany: CompanyProfileData = {
  companyName: "", recruiterName: "", officialEmail: "", phone: "", website: "",
  linkedin: "", location: "", companySize: "", industry: "", designation: "",
  description: "", registrationNumber: "", logo: "", verificationStatus: "unverified",
};

const verificationMeta = {
  unverified: { label: "Unverified", icon: ShieldAlert, className: "bg-muted text-muted-foreground" },
  pending: { label: "Pending", icon: Clock, className: "bg-warning/10 text-warning" },
  verified: { label: "Verified", icon: CheckCircle, className: "bg-success/10 text-success" },
  rejected: { label: "Rejected", icon: XCircle, className: "bg-destructive/10 text-destructive" },
};

const CompanyProfile = () => {
  const { toast } = useToast();
  const [form, setForm] = useState<CompanyProfileData>(emptyCompany);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getCompanyProfile()
      .then((company) => setForm({ ...emptyCompany, ...company }))
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Could not load company profile"))
      .finally(() => setLoading(false));
  }, []);

  const update = (key: keyof CompanyProfileData, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const handleSave = async () => {
    setSaving(true);
    try {
      setForm({ ...emptyCompany, ...(await saveCompanyProfile(form)) });
      toast({ title: "Company profile saved" });
    } catch (requestError) {
      toast({ title: "Could not save company profile", description: requestError instanceof Error ? requestError.message : "Unknown error", variant: "destructive" });
    } finally { setSaving(false); }
  };
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await saveCompanyProfile(form);
      setForm({ ...emptyCompany, ...(await submitCompanyVerification()) });
      toast({ title: "Verification submitted", description: "Your company profile is now pending review." });
    } catch (requestError) {
      toast({ title: "Could not submit verification", description: requestError instanceof Error ? requestError.message : "Unknown error", variant: "destructive" });
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="flex min-h-[300px] items-center justify-center"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading company profile...</div>;
  if (error) return <div className="rounded-xl border border-destructive/30 p-6 text-sm text-destructive">{error}</div>;
  const status = verificationMeta[form.verificationStatus];
  const StatusIcon = status.icon;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader title="Company Profile" description="Showcase your company to attract top talent">
        <Badge className={status.className}><StatusIcon className="mr-1 h-3.5 w-3.5" /> {status.label}</Badge>
        <Button variant="outline" onClick={() => void handleSave()} disabled={saving}><Save className="mr-2 h-4 w-4" /> {saving ? "Saving..." : "Save"}</Button>
        {!["verified", "pending"].includes(form.verificationStatus) && <Button onClick={() => void handleSubmit()} disabled={submitting} className="gradient-primary border-0"><Send className="mr-2 h-4 w-4" /> {submitting ? "Submitting..." : "Submit Verification"}</Button>}
      </PageHeader>
      {form.verificationStatus === "rejected" && form.rejectionReason && <Card className="border-destructive/30"><CardContent className="p-4 text-sm text-destructive">Verification rejected: {form.rejectionReason}</CardContent></Card>}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Building2 className="h-5 w-5 text-primary" /> Company Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label>Company Name *</Label><Input value={form.companyName} onChange={(e) => update("companyName", e.target.value)} /></div>
            <div><Label>Industry *</Label><Input value={form.industry} onChange={(e) => update("industry", e.target.value)} /></div>
            <div><Label>Company Size *</Label><Input placeholder="50-200" value={form.companySize} onChange={(e) => update("companySize", e.target.value)} /></div>
            <div><Label>Location *</Label><Input value={form.location} onChange={(e) => update("location", e.target.value)} /></div>
            <div><Label>Website</Label><Input value={form.website} onChange={(e) => update("website", e.target.value)} /></div>
            <div><Label>LinkedIn</Label><Input value={form.linkedin} onChange={(e) => update("linkedin", e.target.value)} /></div>
            <div><Label>Registration Number</Label><Input value={form.registrationNumber} onChange={(e) => update("registrationNumber", e.target.value)} /></div>
            <div><Label>Logo URL</Label><Input value={form.logo} onChange={(e) => update("logo", e.target.value)} /></div>
          </div>
          <div><Label>Description *</Label><Textarea rows={5} value={form.description} onChange={(e) => update("description", e.target.value)} /></div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-lg">Recruiter Contact</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div><Label>Recruiter Name *</Label><Input value={form.recruiterName} onChange={(e) => update("recruiterName", e.target.value)} /></div>
          <div><Label>Designation *</Label><Input value={form.designation} onChange={(e) => update("designation", e.target.value)} /></div>
          <div><Label>Official Email *</Label><Input type="email" value={form.officialEmail} onChange={(e) => update("officialEmail", e.target.value)} /></div>
          <div><Label>Phone *</Label><Input value={form.phone} onChange={(e) => update("phone", e.target.value)} /></div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CompanyProfile;
