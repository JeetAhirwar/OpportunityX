import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BellOff, CheckCheck, Briefcase, MessageSquare, UserCheck, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import { cn } from "@/utils/cn";
import api from "@/services/api";
import { useChat } from "@/features/chat/ChatContext";
import { useAuth } from "@/store/AuthContext";

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  link?: string;
  createdAt: string;
}

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [tab, setTab] = useState("all");
  const { reloadNotifications } = useChat();
  const { user } = useAuth();
  const navigate = useNavigate();

  const load = async () => setNotifications(await api.get<Notification[]>("/notifications"));
  useEffect(() => { void load(); }, []);

  const unreadCount = notifications.filter((item) => !item.read).length;
  const filtered = useMemo(() => {
    if (tab === "unread") return notifications.filter((item) => !item.read);
    if (tab === "application") return notifications.filter((item) => item.title.toLowerCase().includes("application"));
    if (tab === "message") return notifications.filter((item) => item.title === "New Message");
    return notifications;
  }, [notifications, tab]);

  const markRead = async (notification: Notification) => {
    if (!notification.read) {
      await api.patch(`/notifications/${notification._id}/read`);
      setNotifications((items) => items.map((item) => item._id === notification._id ? { ...item, read: true } : item));
      await reloadNotifications();
    }
    if (notification.link) {
      const chatPath = user?.role === "recruiter" ? "/recruiter/chat" : "/candidate/chat";
      navigate(notification.link === "/messages" ? chatPath : notification.link);
    }
  };
  const markAllRead = async () => {
    await api.patch("/notifications/read-all");
    setNotifications((items) => items.map((item) => ({ ...item, read: true })));
    await reloadNotifications();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader title="Notifications" description={unreadCount > 0 ? `${unreadCount} unread notifications` : "You're all caught up"}>
        {unreadCount > 0 && <Button variant="outline" size="sm" onClick={markAllRead}><CheckCheck className="mr-1 h-4 w-4" /> Mark all read</Button>}
      </PageHeader>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread {unreadCount > 0 && `(${unreadCount})`}</TabsTrigger>
          <TabsTrigger value="application">Applications</TabsTrigger>
          <TabsTrigger value="message">Messages</TabsTrigger>
        </TabsList>
        <TabsContent value={tab} className="mt-4">
          {!filtered.length ? <EmptyState icon={BellOff} title="No notifications" description="You're all caught up! Check back later." /> : (
            <div className="space-y-2">
              {filtered.map((notification) => {
                const Icon = notification.title === "New Message" ? MessageSquare : notification.title.toLowerCase().includes("application") ? Briefcase : notification.type === "error" ? AlertCircle : UserCheck;
                return (
                  <Card key={notification._id} className={cn("transition-all cursor-pointer hover:shadow-md", !notification.read && "border-primary/30 bg-primary/5")} onClick={() => void markRead(notification)}>
                    <CardContent className="flex items-start gap-4 p-4">
                      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", !notification.read ? "bg-primary/10" : "bg-muted")}><Icon className={cn("h-5 w-5", !notification.read ? "text-primary" : "text-muted-foreground")} /></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className={cn("text-sm", !notification.read ? "font-semibold" : "font-medium")}>{notification.title}</h3>
                          <span className="text-xs text-muted-foreground shrink-0 ml-2">{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</span>
                        </div>
                        <p className="mt-0.5 text-sm text-muted-foreground">{notification.message}</p>
                      </div>
                      {!notification.read && <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />}
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
