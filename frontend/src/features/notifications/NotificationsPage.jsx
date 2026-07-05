import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, BellOff, Briefcase, CheckCheck, Loader2, MessageSquare, Trash2, UserCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import { cn } from "@/utils/cn";
import { useChat } from "@/features/chat/ChatContext";
import { useAuth } from "@/store/AuthContext";
import {
  deleteNotification,
  getNotificationsPage,
  markAllNotificationsRead,
  markNotificationRead,
} from "./notificationApi";

const PAGE_SIZE = 20;

const iconFor = (notification) => {
  if (notification.icon === "message" || notification.type?.includes("message")) return MessageSquare;
  if (notification.icon === "briefcase" || notification.type?.includes("application") || notification.type?.includes("job")) return Briefcase;
  if (notification.icon === "alert" || notification.priority === "critical" || notification.type?.includes("failed")) return AlertCircle;
  return UserCheck;
};

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [tab, setTab] = useState("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [serverUnreadCount, setServerUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const { reloadNotifications } = useChat();
  const { user } = useAuth();
  const navigate = useNavigate();

  const unreadCount = serverUnreadCount;
  const typeFilter = tab === "application" ? "application" : tab === "message" ? "message" : "";
  const unreadOnly = tab === "unread";

  const loadPage = useCallback(async (nextPage = 1, append = false) => {
    append ? setLoadingMore(true) : setLoading(true);
    setError("");
    try {
      const response = await getNotificationsPage({
        page: nextPage,
        limit: PAGE_SIZE,
        unreadOnly,
      });
      const items = typeFilter
        ? response.notifications.filter((item) => item.type?.includes(typeFilter) || item.title?.toLowerCase().includes(typeFilter))
        : response.notifications;
      setNotifications((current) => append ? [...current, ...items.filter((item) => !current.some((existing) => existing._id === item._id))] : items);
      setPage(response.pagination.page);
      setHasMore(response.pagination.hasMore);
      setServerUnreadCount(response.unreadCount);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not load notifications");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [typeFilter, unreadOnly]);

  useEffect(() => {
    void loadPage(1, false);
  }, [loadPage]);

  const markRead = async (notification) => {
    if (!notification.read) {
      await markNotificationRead(notification._id);
      setNotifications((items) => items.map((item) => item._id === notification._id ? { ...item, read: true, isRead: true } : item));
      setServerUnreadCount((count) => Math.max(count - 1, 0));
      await reloadNotifications();
    }
    if (notification.link) {
      const chatPath = user?.role === "recruiter" ? "/recruiter/chat" : "/candidate/chat";
      navigate(notification.link === "/messages" ? chatPath : notification.link);
    }
  };

  const markAllRead = async () => {
    await markAllNotificationsRead();
    setNotifications((items) => items.map((item) => ({ ...item, read: true, isRead: true })));
    setServerUnreadCount(0);
    await reloadNotifications();
  };

  const removeNotification = async (event, notification) => {
    event.stopPropagation();
    await deleteNotification(notification._id);
    setNotifications((items) => items.filter((item) => item._id !== notification._id));
    if (!notification.read)
      setServerUnreadCount((count) => Math.max(count - 1, 0));
    await reloadNotifications();
  };

  const filtered = useMemo(() => notifications, [notifications]);

  return (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader title="Notifications" description={unreadCount > 0 ? `${unreadCount} unread notifications` : "You're all caught up"}>
        {unreadCount > 0 && <Button variant="outline" size="sm" onClick={markAllRead}><CheckCheck className="mr-1 h-4 w-4"/> Mark all read</Button>}
      </PageHeader>
      <Tabs value={tab} onValueChange={(value) => { setTab(value); setPage(1); }}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread {unreadCount > 0 && `(${unreadCount})`}</TabsTrigger>
          <TabsTrigger value="application">Applications</TabsTrigger>
          <TabsTrigger value="message">Messages</TabsTrigger>
        </TabsList>
        <TabsContent value={tab} className="mt-4">
          {loading ? (<div className="flex min-h-[260px] items-center justify-center rounded-xl border border-border"><Loader2 className="mr-2 h-5 w-5 animate-spin text-primary"/> Loading notifications...</div>) : error ? (<EmptyState icon={AlertCircle} title="Could not load notifications" description={error} action={{ label: "Try again", onClick: () => void loadPage(1, false) }}/>) : !filtered.length ? <EmptyState icon={BellOff} title="No notifications" description="You're all caught up! Check back later."/> : (<div className="space-y-2">
              {filtered.map((notification) => {
                const Icon = iconFor(notification);
                return (<Card key={notification._id} className={cn("transition-all cursor-pointer hover:shadow-md", !notification.read && "border-primary/30 bg-primary/5")} onClick={() => void markRead(notification)}>
                    <CardContent className="flex items-start gap-4 p-4">
                      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", !notification.read ? "bg-primary/10" : "bg-muted")}><Icon className={cn("h-5 w-5", !notification.read ? "text-primary" : "text-muted-foreground")}/></div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <h3 className={cn("text-sm", !notification.read ? "font-semibold" : "font-medium")}>{notification.title}</h3>
                          <span className="shrink-0 text-xs text-muted-foreground">{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</span>
                        </div>
                        <p className="mt-0.5 text-sm text-muted-foreground">{notification.message}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" aria-label="Delete notification" onClick={(event) => void removeNotification(event, notification)}><Trash2 className="h-4 w-4"/></Button>
                      {!notification.read && <div className="mt-3 h-2 w-2 shrink-0 rounded-full bg-primary"/>}
                    </CardContent>
                  </Card>);
              })}
              {hasMore && <div className="pt-3 text-center"><Button variant="outline" disabled={loadingMore} onClick={() => void loadPage(page + 1, true)}>{loadingMore && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}Load more</Button></div>}
            </div>)}
        </TabsContent>
      </Tabs>
    </motion.div>);
};
export default NotificationsPage;
