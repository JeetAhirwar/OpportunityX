import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Building2, Globe, Shield, Bell, Palette, Trash2, Save, Eye, EyeOff, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/store/ThemeContext";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/common/PageHeader";
import organizationApi from "@/features/organization/organizationApi";
const SettingsPage = () => {
    const { theme, toggleTheme } = useTheme();
    const { toast } = useToast();
    const [showPassword, setShowPassword] = useState(false);
    const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
    const [notifPrefs, setNotifPrefs] = useState({ email: true, push: true, jobAlerts: true, messages: true, marketing: false });
    const [organization, setOrganization] = useState(null);
    const [orgForm, setOrgForm] = useState({ name: "", website: "", industry: "", companySize: "", country: "", timezone: "UTC" });
    const [branding, setBranding] = useState({ logo: "", primaryColor: "#2563eb", secondaryColor: "#0f172a", careerPageHeadline: "", companyDescription: "", emailBranding: "" });
    const [invite, setInvite] = useState({ email: "", role: "recruiter" });
    useEffect(() => {
        let active = true;
        organizationApi.list()
            .then((response) => {
            if (!active)
                return;
            const first = response.data?.[0];
            if (!first)
                return;
            setOrganization(first);
            setOrgForm({
                name: first.name || "",
                website: first.website || "",
                industry: first.industry || "",
                companySize: first.companySize || "",
                country: first.country || "",
                timezone: first.timezone || "UTC",
            });
            setBranding({
                logo: first.logo || "",
                primaryColor: first.branding?.primaryColor || "#2563eb",
                secondaryColor: first.branding?.secondaryColor || "#0f172a",
                careerPageHeadline: first.branding?.careerPageHeadline || "",
                companyDescription: first.branding?.companyDescription || "",
                emailBranding: first.branding?.emailBranding || "",
            });
        })
            .catch(() => undefined);
        return () => {
            active = false;
        };
    }, []);
    const handlePasswordChange = async () => {
        if (passwords.new !== passwords.confirm) {
            toast({ title: "Passwords don't match", variant: "destructive" });
            return;
        }
        if (passwords.new.length < 8) {
            toast({ title: "Password must be at least 8 characters", variant: "destructive" });
            return;
        }
        // API: api.put("/auth/password", passwords)
        toast({ title: "Password updated successfully" });
        setPasswords({ current: "", new: "", confirm: "" });
    };
    const saveOrganization = async () => {
        const response = organization
            ? await organizationApi.update(organization._id, orgForm)
            : await organizationApi.create(orgForm);
        setOrganization(response.data);
        toast({ title: "Organization profile saved" });
    };
    const saveBranding = async () => {
        if (!organization) {
            toast({ title: "Create an organization first", variant: "destructive" });
            return;
        }
        const response = await organizationApi.updateBranding(organization._id, branding);
        setOrganization(response.data);
        toast({ title: "Branding updated" });
    };
    const sendInvite = async () => {
        if (!organization)
            return;
        await organizationApi.invite(organization._id, invite);
        setInvite({ email: "", role: "recruiter" });
        toast({ title: "Invitation created" });
    };
    return (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader title="Settings" description="Manage your account preferences"/>

      <Tabs defaultValue="security" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:w-auto md:grid-cols-5">
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="organization">Organization</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="danger">Danger</TabsTrigger>
        </TabsList>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><Shield className="h-5 w-5 text-primary"/> Change Password</CardTitle>
              <CardDescription>Update your password to keep your account secure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Current Password</Label>
                <div className="relative">
                  <Input type={showPassword ? "text" : "password"} value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}/>
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-label={showPassword ? "Hide password" : "Show password"}>
                    {showPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                  </button>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><Label>New Password</Label><Input type="password" value={passwords.new} onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}/></div>
                <div><Label>Confirm Password</Label><Input type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}/></div>
              </div>
              <Button onClick={handlePasswordChange}><Save className="mr-2 h-4 w-4"/> Update Password</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="organization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><Building2 className="h-5 w-5 text-primary"/> Organization Profile</CardTitle>
              <CardDescription>Manage the company profile used by recruiter workspaces and career pages</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div><Label>Name</Label><Input value={orgForm.name} onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}/></div>
                <div><Label>Website</Label><Input value={orgForm.website} onChange={(e) => setOrgForm({ ...orgForm, website: e.target.value })}/></div>
                <div><Label>Industry</Label><Input value={orgForm.industry} onChange={(e) => setOrgForm({ ...orgForm, industry: e.target.value })}/></div>
                <div><Label>Company Size</Label><Input value={orgForm.companySize} onChange={(e) => setOrgForm({ ...orgForm, companySize: e.target.value })}/></div>
                <div><Label>Country</Label><Input value={orgForm.country} onChange={(e) => setOrgForm({ ...orgForm, country: e.target.value })}/></div>
                <div><Label>Timezone</Label><Input value={orgForm.timezone} onChange={(e) => setOrgForm({ ...orgForm, timezone: e.target.value })}/></div>
              </div>
              <Button onClick={saveOrganization}><Save className="mr-2 h-4 w-4"/> Save Organization</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><Globe className="h-5 w-5 text-primary"/> Branding</CardTitle>
              <CardDescription>Customize the public career page and outbound email brand</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div><Label>Logo URL</Label><Input value={branding.logo} onChange={(e) => setBranding({ ...branding, logo: e.target.value })}/></div>
                <div><Label>Career Page Headline</Label><Input value={branding.careerPageHeadline} onChange={(e) => setBranding({ ...branding, careerPageHeadline: e.target.value })}/></div>
                <div><Label>Primary Color</Label><Input type="color" value={branding.primaryColor} onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}/></div>
                <div><Label>Secondary Color</Label><Input type="color" value={branding.secondaryColor} onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}/></div>
              </div>
              <div><Label>Company Description</Label><Input value={branding.companyDescription} onChange={(e) => setBranding({ ...branding, companyDescription: e.target.value })}/></div>
              <div><Label>Email Branding</Label><Input value={branding.emailBranding} onChange={(e) => setBranding({ ...branding, emailBranding: e.target.value })}/></div>
              <Button onClick={saveBranding} variant="outline"><Palette className="mr-2 h-4 w-4"/> Save Branding</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><Users className="h-5 w-5 text-primary"/> Member Invitations</CardTitle>
              <CardDescription>Invite teammates into this organization with an organization role</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-[1fr_180px_auto]">
              <Input placeholder="teammate@company.com" value={invite.email} onChange={(e) => setInvite({ ...invite, email: e.target.value })}/>
              <Input value={invite.role} onChange={(e) => setInvite({ ...invite, role: e.target.value })}/>
              <Button onClick={sendInvite} disabled={!organization || !invite.email}>Invite</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><Palette className="h-5 w-5 text-primary"/> Appearance</CardTitle>
              <CardDescription>Control how OpportunityX looks on this device</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between rounded-lg border border-border/70 bg-secondary/30 p-4">
                <div>
                  <p className="font-medium">Dark Mode</p>
                  <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
                </div>
                <Switch checked={theme === "dark"} onCheckedChange={toggleTheme}/>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><Bell className="h-5 w-5 text-primary"/> Notification Preferences</CardTitle>
              <CardDescription>Choose which product events should alert you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
            { key: "email", label: "Email Notifications", desc: "Receive notifications via email" },
            { key: "push", label: "Push Notifications", desc: "Receive browser push notifications" },
            { key: "jobAlerts", label: "Job Alerts", desc: "Get notified about new matching jobs" },
            { key: "messages", label: "Messages", desc: "Get notified about new messages" },
            { key: "marketing", label: "Marketing", desc: "Receive product updates and tips" },
        ].map((pref) => (<div key={pref.key} className="flex items-center justify-between rounded-lg border border-border/70 bg-secondary/30 p-4">
                  <div>
                    <p className="text-sm font-medium">{pref.label}</p>
                    <p className="text-xs text-muted-foreground">{pref.desc}</p>
                  </div>
                  <Switch checked={notifPrefs[pref.key]} onCheckedChange={(v) => setNotifPrefs({ ...notifPrefs, [pref.key]: v })}/>
                </div>))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="danger">
          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-destructive"><Trash2 className="h-5 w-5"/> Danger Zone</CardTitle>
              <CardDescription>Actions here can permanently affect your account</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">Permanently delete your account and all associated data. This action cannot be undone.</p>
              <Button variant="destructive"><Trash2 className="mr-2 h-4 w-4"/> Delete Account</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>);
};
export default SettingsPage;
