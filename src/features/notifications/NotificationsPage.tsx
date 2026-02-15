import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, BellOff, Check, CheckCheck, Briefcase, MessageSquare, UserCheck, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: "application" | "message" | "alert" | "system";
  title: string;
  description: string;
  time: string;
  read: boolean;
}

const icons = { application: Briefcase, message: MessageSquare, alert: AlertCircle, system: UserCheck };

const mockNotifs: Notification[] = [
  { id: "1", type: "application", title: "Application Update", description: "Your application for Senior Frontend Engineer at TechCorp has been shortlisted.", time: "5m ago", read: false },
  { id: "2", type: "message", title: "New Message", description: "Alice Johnson sent you a message about the interview schedule.", time: "30m ago", read: false },
  { id: "3", type: "alert", title: "New Job Match", description: "A new job matching your preferences has been posted: Full Stack Developer at Vercel.", time: "2h ago", read: false },
  { id: "4", type: "system", title: "Profile Viewed", description: "A recruiter from Linear viewed your profile.", time: "5h ago", read: true },
  { id: "5", type: "application", title: "Application Received", description: "Your application for UI/UX Developer at DesignCo has been received.", time: "1d ago", read: true },
];

const NotificationsPage = () => {
  const [notifs, setNotifs] = useState(mockNotifs);
  const [tab, setTab] = useState("all");

  const filtered = tab === "all" ? notifs : tab === "unread" ? notifs.filter((n) => !n.read) : notifs.filter((n) => n.type === tab);
  const unreadCount = notifs.filter((n) => !n.read).length;

  const markRead = (id: string) => setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () => setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader title="Notifications" description={unreadCount > 0 ? `${unreadCount} unread notifications` : "You're all caught up"}>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead}><CheckCheck className="mr-1 h-4 w-4" /> Mark all read</Button>
        )}
      </PageHeader>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread {unreadCount > 0 && `(${unreadCount})`}</TabsTrigger>
          <TabsTrigger value="application">Applications</TabsTrigger>
          <TabsTrigger value="message">Messages</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          {filtered.length === 0 ? (
            <EmptyState icon={BellOff} title="No notifications" description="You're all caught up! Check back later." />
          ) : (
            <div className="space-y-2">
              {filtered.map((notif) => {
                const Icon = icons[notif.type];
                return (
                  <Card key={notif.id} className={cn("transition-all cursor-pointer hover:shadow-md", !notif.read && "border-primary/30 bg-primary/5")} onClick={() => markRead(notif.id)}>
                    <CardContent className="flex items-start gap-4 p-4">
                      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", !notif.read ? "bg-primary/10" : "bg-muted")}>
                        <Icon className={cn("h-5 w-5", !notif.read ? "text-primary" : "text-muted-foreground")} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className={cn("text-sm", !notif.read ? "font-semibold" : "font-medium")}>{notif.title}</h3>
                          <span className="text-xs text-muted-foreground shrink-0 ml-2">{notif.time}</span>
                        </div>
                        <p className="mt-0.5 text-sm text-muted-foreground">{notif.description}</p>
                      </div>
                      {!notif.read && <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default NotificationsPage;
