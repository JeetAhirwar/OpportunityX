import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Users, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import PageHeader from "@/components/common/PageHeader";

const appData = [
  { name: "Frontend Eng", applications: 45, views: 320 },
  { name: "Backend Dev", applications: 28, views: 210 },
  { name: "Designer", applications: 67, views: 450 },
  { name: "DevOps", applications: 12, views: 90 },
  { name: "PM", applications: 34, views: 280 },
];

const weeklyData = [
  { week: "W1", views: 120, applications: 18 },
  { week: "W2", views: 200, applications: 32 },
  { week: "W3", views: 180, applications: 24 },
  { week: "W4", views: 310, applications: 45 },
];

const RecruiterAnalytics = () => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
    <PageHeader title="Analytics" description="Track the performance of your job postings" />

    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[
        { label: "Total Views", value: "1,350", icon: Eye, change: "+18%" },
        { label: "Applications", value: "186", icon: Users, change: "+12%" },
        { label: "Conversion Rate", value: "13.8%", icon: TrendingUp, change: "+2.1%" },
        { label: "Active Jobs", value: "4", icon: BarChart3, change: "" },
      ].map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="font-display text-2xl font-bold">{stat.value}</p>
                {stat.change && <p className="text-xs text-success">{stat.change}</p>}
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
        <CardHeader><CardTitle className="text-lg">Applications per Job</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={appData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
              <Bar dataKey="applications" fill="hsl(225, 73%, 57%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Weekly Trends</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="week" tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
              <Line type="monotone" dataKey="views" stroke="hsl(225, 73%, 57%)" strokeWidth={2} />
              <Line type="monotone" dataKey="applications" stroke="hsl(262, 83%, 58%)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  </motion.div>
);

export default RecruiterAnalytics;
