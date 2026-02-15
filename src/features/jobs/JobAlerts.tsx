import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Plus, Trash2, MapPin, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";

interface JobAlert {
  id: string;
  keyword: string;
  location: string;
  type: string;
  frequency: string;
  active: boolean;
}

const JobAlerts = () => {
  const [alerts, setAlerts] = useState<JobAlert[]>([
    { id: "1", keyword: "React Developer", location: "Remote", type: "Full-time", frequency: "daily", active: true },
    { id: "2", keyword: "Frontend Engineer", location: "San Francisco", type: "Any", frequency: "weekly", active: false },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ keyword: "", location: "", type: "any", frequency: "daily" });

  const addAlert = () => {
    if (!form.keyword) return;
    setAlerts((prev) => [...prev, { id: Date.now().toString(), ...form, active: true }]);
    setForm({ keyword: "", location: "", type: "any", frequency: "daily" });
    setShowForm(false);
  };

  const toggleAlert = (id: string) => setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, active: !a.active } : a));
  const removeAlert = (id: string) => setAlerts((prev) => prev.filter((a) => a.id !== id));

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader title="Job Alerts" description="Get notified when new jobs match your criteria" action={{ label: "New Alert", icon: Plus, onClick: () => setShowForm(true) }} />

      {showForm && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Create Alert</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>Keywords</Label><Input placeholder="e.g. React Developer" value={form.keyword} onChange={(e) => setForm({ ...form, keyword: e.target.value })} /></div>
              <div><Label>Location</Label><Input placeholder="e.g. Remote, New York" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>Job Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Frequency</Label>
                <Select value={form.frequency} onValueChange={(v) => setForm({ ...form, frequency: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instant">Instant</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={addAlert} className="gradient-primary border-0">Create Alert</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {alerts.length === 0 ? (
        <EmptyState icon={Bell} title="No job alerts" description="Create alerts to get notified when new jobs match your criteria." />
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <Card key={alert.id}>
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <h3 className="font-medium">{alert.keyword}</h3>
                  <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    {alert.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {alert.location}</span>}
                    <span>{alert.type}</span>
                    <span className="capitalize">{alert.frequency}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={alert.active} onCheckedChange={() => toggleAlert(alert.id)} />
                  <Button variant="ghost" size="icon" onClick={() => removeAlert(alert.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default JobAlerts;
