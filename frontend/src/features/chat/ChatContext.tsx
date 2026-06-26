import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/store/AuthContext";
import api from "@/services/api";
import { getConversations, type Conversation } from "./messageApi";
import { disconnectChatSocket, getChatSocket } from "./socketClient";

interface ChatContextValue {
  conversations: Conversation[];
  unreadMessages: number;
  unreadNotifications: number;
  onlineUsers: string[];
  reloadConversations: () => Promise<void>;
  reloadNotifications: () => Promise<void>;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const receivedNotificationIds = useRef(new Set<string>());

  const reloadConversations = useCallback(async () => {
    if (!isAuthenticated || user?.role === "admin") return;
    const response = await getConversations();
    setConversations(response.conversations);
  }, [isAuthenticated, user?.role]);

  const reloadNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    const notifications = await api.get<{ read: boolean }[]>("/notifications");
    setUnreadNotifications(notifications.filter((item) => !item.read).length);
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setConversations([]);
      setUnreadNotifications(0);
      disconnectChatSocket();
      return;
    }
    void reloadNotifications();
    if (user?.role !== "admin") void reloadConversations();

    const socket = getChatSocket();
    const onConversations = (items: Conversation[]) => setConversations(items);
    const onNotification = (notification?: { _id?: string }) => {
      if (notification?._id) {
        if (receivedNotificationIds.current.has(notification._id)) return;
        receivedNotificationIds.current.add(notification._id);
      }
      setUnreadNotifications((count) => count + 1);
    };
    if (user?.role !== "admin") socket.on("conversations_updated", onConversations);
    socket.on("online_users", setOnlineUsers);
    socket.on("notification_created", onNotification);
    socket.on("notification_received", onNotification);
    socket.connect();
    return () => {
      socket.off("conversations_updated", onConversations);
      socket.off("online_users", setOnlineUsers);
      socket.off("notification_created", onNotification);
      socket.off("notification_received", onNotification);
    };
  }, [isAuthenticated, reloadConversations, reloadNotifications, user?.role]);

  const value = useMemo(
    () => ({
      conversations,
      unreadMessages: conversations.reduce((sum, item) => sum + item.unreadCount, 0),
      unreadNotifications,
      onlineUsers,
      reloadConversations,
      reloadNotifications,
    }),
    [conversations, onlineUsers, reloadConversations, reloadNotifications, unreadNotifications]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChat must be used within ChatProvider");
  return context;
};
