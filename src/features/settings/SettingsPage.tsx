import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Bell, Palette, Trash2, Save, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/common/PageHeader";

const SettingsPage = () => {
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [notifPrefs, setNotifPrefs] = useState({ email: true, push: true, jobAlerts: true, messages: true, marketing: false });

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

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader title="Settings" description="Manage your account preferences" />

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg"><Shield className="h-5 w-5 text-primary" /> Change Password</CardTitle>
          <CardDescription>Update your password to keep your account secure</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Current Password</Label>
            <div className="relative">
              <Input type={showPassword ? "text" : "password"} value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} />
              <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label>New Password</Label><Input type="password" value={passwords.new} onChange={(e) => setPasswords({ ...passwords, new: e.target.value })} /></div>
            <div><Label>Confirm Password</Label><Input type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} /></div>
          </div>
          <Button onClick={handlePasswordChange} className="gradient-primary border-0"><Save className="mr-2 h-4 w-4" /> Update Password</Button>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg"><Palette className="h-5 w-5 text-primary" /> Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Dark Mode</p>
              <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
            </div>
            <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg"><Bell className="h-5 w-5 text-primary" /> Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: "email", label: "Email Notifications", desc: "Receive notifications via email" },
            { key: "push", label: "Push Notifications", desc: "Receive browser push notifications" },
            { key: "jobAlerts", label: "Job Alerts", desc: "Get notified about new matching jobs" },
            { key: "messages", label: "Messages", desc: "Get notified about new messages" },
            { key: "marketing", label: "Marketing", desc: "Receive product updates and tips" },
          ].map((pref) => (
            <div key={pref.key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{pref.label}</p>
                <p className="text-xs text-muted-foreground">{pref.desc}</p>
              </div>
              <Switch checked={notifPrefs[pref.key as keyof typeof notifPrefs]} onCheckedChange={(v) => setNotifPrefs({ ...notifPrefs, [pref.key]: v })} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Danger */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-destructive"><Trash2 className="h-5 w-5" /> Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">Permanently delete your account and all associated data. This action cannot be undone.</p>
          <Button variant="destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete Account</Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SettingsPage;
