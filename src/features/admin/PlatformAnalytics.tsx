import { motion } from "framer-motion";
import { Users, Briefcase, FileText, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import PageHeader from "@/components/common/PageHeader";

const monthlyData = [
  { month: "Sep", users: 1200, jobs: 340, apps: 4500 },
  { month: "Oct", users: 1800, jobs: 420, apps: 6200 },
  { month: "Nov", users: 2400, jobs: 580, apps: 8100 },
  { month: "Dec", users: 3100, jobs: 650, apps: 9800 },
  { month: "Jan", users: 3800, jobs: 780, apps: 12400 },
  { month: "Feb", users: 4200, jobs: 850, apps: 14200 },
];

const roleData = [
  { name: "Candidates", value: 18500, color: "hsl(225, 73%, 57%)" },
  { name: "Recruiters", value: 4800, color: "hsl(262, 83%, 58%)" },
  { name: "Admins", value: 12, color: "hsl(142, 71%, 45%)" },
];

const PlatformAnalytics = () => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
    <PageHeader title="Platform Analytics" description="Overview of platform performance and growth" />

    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[
        { label: "Total Users", value: "23.3K", icon: Users, change: "+12% this month" },
        { label: "Total Jobs", value: "3.6K", icon: Briefcase, change: "+9% this month" },
        { label: "Applications", value: "55.2K", icon: FileText, change: "+15% this month" },
        { label: "Active Users (30d)", value: "8.4K", icon: TrendingUp, change: "+18% this month" },
      ].map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="font-display text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-success">{stat.change}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader><CardTitle className="text-lg">Growth Trends</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
              <Line type="monotone" dataKey="users" stroke="hsl(225, 73%, 57%)" strokeWidth={2} name="Users" />
              <Line type="monotone" dataKey="jobs" stroke="hsl(262, 83%, 58%)" strokeWidth={2} name="Jobs" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">User Distribution</CardTitle></CardHeader>
        <CardContent className="flex items-center justify-center">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={roleData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {roleData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader><CardTitle className="text-lg">Monthly Applications</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
              <Bar dataKey="apps" fill="hsl(225, 73%, 57%)" radius={[4, 4, 0, 0]} name="Applications" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  </motion.div>
);

export default PlatformAnalytics;
