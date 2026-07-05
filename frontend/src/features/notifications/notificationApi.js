import api from "@/services/api";

export const normalizeNotification = (notification) => ({
  ...notification,
  recipient: notification.recipient || notification.user,
  read: Boolean(notification.read || notification.isRead),
  isRead: Boolean(notification.isRead || notification.read),
});

export const getNotificationsPage = async ({ page = 1, limit = 20, unreadOnly = false, type = "" } = {}) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (unreadOnly) params.set("unreadOnly", "true");
  if (type) params.set("type", type);
  const response = await api.get(`/notifications?${params.toString()}`);
  return {
    notifications: (response.notifications || []).map(normalizeNotification),
    pagination: response.pagination || { page, limit, total: 0, pages: 1, hasMore: false },
    unreadCount: response.unreadCount || 0,
  };
};

export const getUnreadNotificationCount = async () => {
  const response = await api.get("/notifications/unread-count");
  return response.unreadCount || 0;
};

export const markNotificationRead = (id) => api.patch(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => api.patch("/notifications/read-all");
export const deleteNotification = (id) => api.delete(`/notifications/${id}`);
export const clearNotifications = () => api.delete("/notifications/clear");
