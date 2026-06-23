import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Building2, Globe, Loader2, UserCheck, UserX, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import api from "@/services/api";
import { AdminCompany, getAdminRecruiters, unwrapAdminData } from "@/features/admin/adminApi";
import { useToast } from "@/hooks/use-toast";

const RecruiterApproval = () => {
  const { toast } = useToast();
  const [companies, setCompanies] = useState<AdminCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    getAdminRecruiters().then(setCompanies)
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Could not load recruiter profiles"))
      .finally(() => setLoading(false));
  }, []);

  const approve = async (company: AdminCompany) => {
    if (!window.confirm(`Approve ${company.companyName || company.recruiterName}?`)) return;
    try {
      const updated = unwrapAdminData(await api.patch<unknown>(`/admin/recruiters/${company._id}/approve`)) as AdminCompany;
      setCompanies((items) => items.map((item) => item._id === company._id ? { ...item, ...updated } : item));
      toast({ title: "Recruiter approved" });
    } catch (requestError) {
      toast({ title: "Approval failed", description: requestError instanceof Error ? requestError.message : "Unknown error", variant: "destructive" });
    }
  };

  const reject = async (company: AdminCompany) => {
    const reason = window.prompt("Enter the rejection reason:");
    if (!reason?.trim()) return;
    try {
      const updated = unwrapAdminData(await api.patch<unknown>(`/admin/recruiters/${company._id}/reject`, { reason })) as AdminCompany;
      setCompanies((items) => items.map((item) => item._id === company._id ? { ...item, ...updated } : item));
      toast({ title: "Recruiter rejected" });
    } catch (requestError) {
      toast({ title: "Rejection failed", description: requestError instanceof Error ? requestError.message : "Unknown error", variant: "destructive" });
    }
  };

  const pending = companies.filter((item) => item.verificationStatus === "pending").length;
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader title="Recruiter Approval" description={`${pending} pending requests`} />
      {loading ? <div className="flex min-h-[300px] items-center justify-center"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading recruiter profiles...</div>
        : error ? <EmptyState icon={AlertCircle} title="Could not load approvals" description={error} />
        : !companies.length ? <EmptyState icon={Users} title="No recruiter profiles" description="Recruiter verification submissions will appear here." />
        : <div className="space-y-3">{companies.map((company) => (
          <Card key={company._id}><CardContent className="p-5"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4"><div className="flex h-11 w-11 items-center justify-center rounded-full bg-warning/10 font-bold text-warning">{(company.companyName || company.recruiterName || "R").charAt(0)}</div><div>
              <div className="flex items-center gap-2"><h3 className="font-semibold">{company.companyName || "Unnamed company"}</h3><Badge variant="outline" className="capitalize">{company.verificationStatus}</Badge></div>
              <p className="text-sm text-muted-foreground">{company.recruiterName || company.recruiter?.name || "Recruiter unavailable"} · {company.officialEmail || company.recruiter?.email || "Email unavailable"}</p>
              <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground"><span className="flex items-center gap-1"><Building2 className="h-3 w-3" /> {company.industry || "Industry unavailable"}</span><span className="flex items-center gap-1"><Globe className="h-3 w-3" /> {company.website || "Website unavailable"}</span><span className="flex items-center gap-1"><Users className="h-3 w-3" /> {company.companySize || "Size unavailable"}</span></div>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{company.description || "No company description provided."}</p>
              {company.rejectionReason && <p className="mt-2 text-xs text-destructive">Previous rejection: {company.rejectionReason}</p>}
            </div></div>
            <div className="flex gap-2"><Button size="sm" disabled={company.verificationStatus === "verified"} onClick={() => void approve(company)}><UserCheck className="mr-1 h-4 w-4" /> Approve</Button><Button size="sm" variant="outline" className="text-destructive" onClick={() => void reject(company)}><UserX className="mr-1 h-4 w-4" /> Reject</Button></div>
          </div></CardContent></Card>
        ))}</div>}
    </motion.div>
  );
};
export default RecruiterApproval;
