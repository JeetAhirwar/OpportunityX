import api from "@/services/api";

export interface ChatUser {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role: "candidate" | "recruiter";
}

export interface Conversation {
  _id: string;
  participants: ChatUser[];
  job?: { _id: string; title: string; company: string };
  application?: { _id: string; status: string };
  lastMessageText: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface ChatMessage {
  _id: string;
  conversation: string;
  sender: ChatUser | string;
  content: string;
  status: "sent" | "delivered" | "seen";
  reactions: { user: string; emoji: string }[];
  editedAt?: string | null;
  createdAt: string;
}

export const getConversations = () =>
  api.get<{ success: true; conversations: Conversation[] }>("/chat/conversations");

export const startConversation = (applicationId: string) =>
  api.post<{ success: true; conversation: Conversation }>("/chat/conversations/start", {
    applicationId,
  });

export const getMessages = (conversationId: string) =>
  api.get<{ success: true; messages: ChatMessage[] }>(`/chat/messages/${conversationId}`);

export const markConversationRead = (conversationId: string) =>
  api.patch(`/chat/conversations/${conversationId}/read`);
