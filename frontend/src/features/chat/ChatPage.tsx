import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Check, Circle, Edit3, FileText, Paperclip, Search, Send, Trash2, X } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/utils/cn";
import { useAuth } from "@/store/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { publicAssetUrl } from "@/services/api";
import { useChat } from "./ChatContext";
import {
  deleteMessage,
  editMessage,
  getMessages,
  getOlderMessages,
  markConversationRead,
  uploadChatAttachment,
  type ChatMessage,
} from "./messageApi";
import { getChatSocket } from "./socketClient";

const ChatPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { conversations, onlineUsers, reloadConversations } = useChat();
  const [params, setParams] = useSearchParams();
  const [selectedId, setSelectedId] = useState(params.get("conversation") || "");
  const [search, setSearch] = useState("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [typing, setTyping] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [editInput, setEditInput] = useState("");
  const [pendingAttachments, setPendingAttachments] = useState<NonNullable<ChatMessage["attachments"]>>([]);
  const [uploading, setUploading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout>>();
  const socket = getChatSocket();
  const currentUserId = user?.id || user?._id || "";

  useEffect(() => {
    if (!selectedId && conversations.length) setSelectedId(conversations[0]._id);
  }, [conversations, selectedId]);

  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      setHasMore(false);
      return;
    }
    setParams({ conversation: selectedId }, { replace: true });
    socket.emit("join_conversation", selectedId);
    setPage(1);
    void getMessages(selectedId)
      .then((response) => {
        setMessages(response.messages);
        setHasMore(Boolean(response.hasMore));
      })
      .catch((error) => toast({ title: "Could not load messages", description: error.message, variant: "destructive" }));
    socket.emit("mark_conversation_read", { conversationId: selectedId });
    void markConversationRead(selectedId).then(reloadConversations);
  }, [reloadConversations, selectedId, setParams, socket, toast]);

  useEffect(() => {
    const receive = (message: ChatMessage) => {
      if (String(message.conversation) === selectedId) {
        setMessages((items) => items.some((item) => item._id === message._id) ? items : [...items, message]);
        socket.emit("mark_conversation_read", { conversationId: selectedId });
      }
    };
    const edit = (message: ChatMessage) =>
      setMessages((items) => items.map((item) => item._id === message._id ? { ...item, ...message } : item));
    const remove = ({ messageId }: { messageId: string }) =>
      setMessages((items) => items.filter((item) => item._id !== messageId));
    const reaction = ({ messageId, reactions }: { messageId: string; reactions: ChatMessage["reactions"] }) =>
      setMessages((items) => items.map((item) => item._id === messageId ? { ...item, reactions } : item));
    const typingStart = ({ conversationId }: { conversationId: string }) => {
      if (conversationId === selectedId) setTyping(true);
    };
    const typingStop = ({ conversationId }: { conversationId: string }) => {
      if (conversationId === selectedId) setTyping(false);
    };
    const actionError = ({ message }: { message: string }) =>
      toast({ title: "Message action failed", description: message, variant: "destructive" });

    socket.on("receive_message", receive);
    socket.on("message_updated", edit);
    socket.on("message_edited", edit);
    socket.on("message_deleted", remove);
    socket.on("message_reaction_updated", reaction);
    socket.on("typing_start", typingStart);
    socket.on("typing_stop", typingStop);
    socket.on("message_action_error", actionError);
    return () => {
      socket.off("receive_message", receive);
      socket.off("message_updated", edit);
      socket.off("message_edited", edit);
      socket.off("message_deleted", remove);
      socket.off("message_reaction_updated", reaction);
      socket.off("typing_start", typingStart);
      socket.off("typing_stop", typingStop);
      socket.off("message_action_error", actionError);
    };
  }, [selectedId, socket, toast]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, typing]);

  const filtered = useMemo(() => conversations.filter((conversation) => {
    const other = conversation.participants.find((participant) => participant._id !== currentUserId);
    return other?.name.toLowerCase().includes(search.toLowerCase());
  }), [conversations, currentUserId, search]);
  const selected = conversations.find((conversation) => conversation._id === selectedId);
  const otherUser = selected?.participants.find((participant) => participant._id !== currentUserId);
  const isOnline = otherUser ? onlineUsers.includes(otherUser._id) : false;

  const sendMessage = () => {
    if ((!input.trim() && !pendingAttachments.length) || !selectedId) return;
    socket.emit("send_message", { conversationId: selectedId, content: input.trim(), attachments: pendingAttachments });
    setInput("");
    setPendingAttachments([]);
    socket.emit("typing_stop", { conversationId: selectedId });
  };

  const handleTyping = (value: string) => {
    setInput(value);
    if (!selectedId) return;
    socket.emit("typing_start", { conversationId: selectedId });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => socket.emit("typing_stop", { conversationId: selectedId }), 900);
  };

  const loadOlder = async () => {
    if (!selectedId || !hasMore) return;
    const nextPage = page + 1;
    const response = await getOlderMessages(selectedId, nextPage);
    setMessages((items) => [...response.messages.filter((message) => !items.some((item) => item._id === message._id)), ...items]);
    setPage(nextPage);
    setHasMore(response.hasMore);
  };

  const handleAttachment = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const response = await uploadChatAttachment(file);
      setPendingAttachments((items) => [...items, response.attachment]);
    } catch (requestError) {
      toast({ title: "Attachment upload failed", description: requestError instanceof Error ? requestError.message : "Unknown error", variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const saveEdit = async (messageId: string) => {
    if (!editInput.trim()) return;
    try {
      const response = await editMessage(messageId, editInput.trim());
      setMessages((items) => items.map((item) => item._id === messageId ? { ...item, ...response.message } : item));
      setEditingId("");
      setEditInput("");
    } catch (requestError) {
      toast({ title: "Could not edit message", description: requestError instanceof Error ? requestError.message : "Unknown error", variant: "destructive" });
    }
  };

  const removeMessage = async (messageId: string) => {
    if (!window.confirm("Delete this message?")) return;
    try {
      await deleteMessage(messageId);
      setMessages((items) => items.filter((item) => item._id !== messageId));
    } catch (requestError) {
      toast({ title: "Could not delete message", description: requestError instanceof Error ? requestError.message : "Unknown error", variant: "destructive" });
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-[calc(100vh-10rem)] overflow-hidden rounded-xl border border-border bg-card">
      <div className={cn("w-80 shrink-0 border-r border-border flex flex-col", showSidebar ? "" : "hidden md:flex")}>
        <div className="p-4 border-b border-border">
          <h2 className="font-display font-bold mb-3">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search conversations..." value={search} onChange={(event) => setSearch(event.target.value)} className="pl-10" />
          </div>
        </div>
        <ScrollArea className="flex-1">
          {filtered.map((conversation) => {
            const other = conversation.participants.find((participant) => participant._id !== currentUserId);
            const online = other ? onlineUsers.includes(other._id) : false;
            return (
              <button key={conversation._id} onClick={() => { setSelectedId(conversation._id); setShowSidebar(false); }}
                className={cn("flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-muted/50", selectedId === conversation._id && "bg-muted/50")}>
                <div className="relative">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{other?.name.charAt(0)}</div>
                  {online && <Circle className="absolute -bottom-0.5 -right-0.5 h-3 w-3 fill-success text-success" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{other?.name}</span>
                    <span className="text-xs text-muted-foreground">{conversation.lastMessageAt ? formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: true }) : ""}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{conversation.lastMessageText || conversation.job?.title || "Start a conversation"}</p>
                </div>
                {conversation.unreadCount > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs text-primary-foreground">{conversation.unreadCount}</span>}
              </button>
            );
          })}
          {!filtered.length && <p className="p-6 text-center text-sm text-muted-foreground">No eligible conversations yet.</p>}
        </ScrollArea>
      </div>

      <div className={cn("flex flex-1 flex-col", !showSidebar ? "" : "hidden md:flex")}>
        <div className="flex items-center gap-3 border-b border-border p-4">
          <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setShowSidebar(true)}>Back</Button>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{otherUser?.name.charAt(0) || "?"}</div>
          <div>
            <p className="text-sm font-medium">{otherUser?.name || "Select a conversation"}</p>
            <p className={cn("text-xs", isOnline ? "text-success" : "text-muted-foreground")}>{isOnline ? "Online" : "Offline"}</p>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            {hasMore && <div className="text-center"><Button variant="ghost" size="sm" onClick={() => void loadOlder()}>Load older messages</Button></div>}
            {messages.map((message) => {
              const senderId = typeof message.sender === "string" ? message.sender : message.sender._id;
              const mine = senderId === currentUserId;
              return (
                <div key={message._id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                  <div className={cn("max-w-[70%] rounded-2xl px-4 py-2.5", mine ? "gradient-primary text-primary-foreground" : "bg-muted")}>
                    {editingId === message._id ? (
                      <div className="flex items-center gap-2">
                        <Input value={editInput} onChange={(event) => setEditInput(event.target.value)} className="h-8 bg-background text-foreground" />
                        <Button size="icon" variant="ghost" onClick={() => void saveEdit(message._id)}><Check className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => setEditingId("")}><X className="h-4 w-4" /></Button>
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                    )}
                    {!!message.attachments?.length && <div className="mt-2 space-y-2">
                      {message.attachments.map((attachment) => {
                        const url = publicAssetUrl(attachment.url);
                        const image = attachment.mimeType.startsWith("image/");
                        return <a key={attachment.url} href={url} target="_blank" rel="noreferrer" className={cn("block rounded-lg border p-2 text-xs", mine ? "border-primary-foreground/30 text-primary-foreground" : "border-border text-foreground")}>
                          {image ? <img src={url} alt={attachment.name} className="mb-1 max-h-40 rounded-md object-cover" /> : <span className="flex items-center gap-2"><FileText className="h-4 w-4" /> {attachment.name}</span>}
                        </a>;
                      })}
                    </div>}
                    <div className={cn("mt-1 flex items-center gap-2 text-[10px]", mine ? "text-primary-foreground/70" : "text-muted-foreground")}>
                      <span>{format(new Date(message.createdAt), "p")}{message.editedAt ? " - edited" : ""}{mine ? ` - ${message.status}` : ""}</span>
                      <button type="button" onClick={() => socket.emit("message_reaction", { messageId: message._id, emoji: "+1" })} className="rounded px-1 hover:bg-background/20">+1 {message.reactions?.length || ""}</button>
                      {mine && editingId !== message._id && <>
                        <button type="button" onClick={() => { setEditingId(message._id); setEditInput(message.content); }} className="hover:text-foreground"><Edit3 className="h-3 w-3" /></button>
                        <button type="button" onClick={() => void removeMessage(message._id)} className="hover:text-foreground"><Trash2 className="h-3 w-3" /></button>
                      </>}
                    </div>
                  </div>
                </div>
              );
            })}
            {typing && <p className="text-xs text-muted-foreground">{otherUser?.name} is typing...</p>}
            {!selectedId && <p className="py-12 text-center text-sm text-muted-foreground">Choose a conversation to begin.</p>}
            <div ref={endRef} />
          </div>
        </ScrollArea>

        <div className="border-t border-border p-4">
          {!!pendingAttachments.length && <div className="mb-2 flex flex-wrap gap-2">
            {pendingAttachments.map((attachment) => <span key={attachment.url} className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs">{attachment.name}<button type="button" onClick={() => setPendingAttachments((items) => items.filter((item) => item.url !== attachment.url))}><X className="h-3 w-3" /></button></span>)}
          </div>}
          <div className="flex items-center gap-2">
            <input ref={fileInputRef} type="file" className="hidden" accept="image/*,.pdf,.doc,.docx" onChange={(event) => void handleAttachment(event.target.files?.[0])} />
            <Button variant="ghost" size="icon" disabled={!selectedId || uploading} title="Attach file" onClick={() => fileInputRef.current?.click()}><Paperclip className="h-4 w-4" /></Button>
            <Input placeholder="Type a message..." value={input} disabled={!selectedId} onChange={(event) => handleTyping(event.target.value)} onKeyDown={(event) => event.key === "Enter" && sendMessage()} className="flex-1" />
            <Button onClick={sendMessage} disabled={(!input.trim() && !pendingAttachments.length) || !selectedId} className="gradient-primary border-0" size="icon"><Send className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatPage;
