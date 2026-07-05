import api from "@/services/api";
export const getConversations = () => api.get("/chat/conversations");
export const startConversation = (applicationId) => api.post("/chat/conversations/start", {
    applicationId,
});
export const getMessages = (conversationId) => api.get(`/chat/messages/${conversationId}`);
export const getOlderMessages = (conversationId, page) => api.get(`/chat/messages/${conversationId}?page=${page}`);
export const markConversationRead = (conversationId) => api.patch(`/chat/conversations/${conversationId}/read`);
export const editMessage = (messageId, content) => api.patch(`/chat/messages/${messageId}`, { content });
export const deleteMessage = (messageId) => api.delete(`/chat/messages/${messageId}`);
export const uploadChatAttachment = (file) => {
    const formData = new FormData();
    formData.append("attachment", file);
    return api.upload("/chat/upload", formData);
};
