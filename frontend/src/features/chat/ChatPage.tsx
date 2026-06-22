import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Search, Circle, Paperclip } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/utils/cn";
import { useAuth } from "@/store/AuthContext";

interface Message {
  id: string;
  text: string;
  sender: "me" | "other";
  time: string;
}

interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
}

const mockConversations: Conversation[] = [
  { id: "1", name: "Alice Johnson", lastMessage: "Thanks for the update!", time: "2m ago", unread: 2, online: true },
  { id: "2", name: "Bob Smith", lastMessage: "When can you start?", time: "1h ago", unread: 0, online: true },
  { id: "3", name: "Carol Davis", lastMessage: "I've reviewed your profile", time: "3h ago", unread: 1, online: false },
  { id: "4", name: "Dan Wilson", lastMessage: "Let me check with the team", time: "1d ago", unread: 0, online: false },
];

const mockMessages: Record<string, Message[]> = {
  "1": [
    { id: "1", text: "Hi! I saw your application for the Frontend role.", sender: "other", time: "10:30 AM" },
    { id: "2", text: "Thanks for reaching out! I'm very interested in the position.", sender: "me", time: "10:32 AM" },
    { id: "3", text: "Your profile looks great. Can we schedule an interview?", sender: "other", time: "10:35 AM" },
    { id: "4", text: "Absolutely! I'm available next week. What time works?", sender: "me", time: "10:36 AM" },
    { id: "5", text: "Thanks for the update!", sender: "other", time: "10:40 AM" },
  ],
};

const ChatPage = () => {
  const { user } = useAuth();
  const [selectedId, setSelectedId] = useState("1");
  const [search, setSearch] = useState("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(mockMessages);
  const [showSidebar, setShowSidebar] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);

  const filtered = mockConversations.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
  const currentMessages = messages[selectedId] || [];

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [currentMessages.length]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMsg: Message = { id: Date.now().toString(), text: input.trim(), sender: "me", time: "Just now" };
    setMessages((prev) => ({ ...prev, [selectedId]: [...(prev[selectedId] || []), newMsg] }));
    setInput("");
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-[calc(100vh-10rem)] overflow-hidden rounded-xl border border-border bg-card">
      {/* Sidebar */}
      <div className={cn("w-80 shrink-0 border-r border-border flex flex-col", showSidebar ? "" : "hidden md:flex")}>
        <div className="p-4 border-b border-border">
          <h2 className="font-display font-bold mb-3">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search conversations..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
        </div>
        <ScrollArea className="flex-1">
          {filtered.map((conv) => (
            <button
              key={conv.id}
              onClick={() => { setSelectedId(conv.id); setShowSidebar(false); }}
              className={cn("flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-muted/50", selectedId === conv.id && "bg-muted/50")}
            >
              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{conv.name.charAt(0)}</div>
                {conv.online && <Circle className="absolute -bottom-0.5 -right-0.5 h-3 w-3 fill-success text-success" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{conv.name}</span>
                  <span className="text-xs text-muted-foreground">{conv.time}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
              </div>
              {conv.unread > 0 && <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">{conv.unread}</span>}
            </button>
          ))}
        </ScrollArea>
      </div>

      {/* Chat */}
      <div className={cn("flex flex-1 flex-col", !showSidebar ? "" : "hidden md:flex")}>
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border p-4">
          <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setShowSidebar(true)}>â†</Button>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            {mockConversations.find((c) => c.id === selectedId)?.name.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-medium">{mockConversations.find((c) => c.id === selectedId)?.name}</p>
            <p className="text-xs text-success">Online</p>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            {currentMessages.map((msg) => (
              <div key={msg.id} className={cn("flex", msg.sender === "me" ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[70%] rounded-2xl px-4 py-2.5", msg.sender === "me" ? "gradient-primary text-primary-foreground" : "bg-muted")}>
                  <p className="text-sm">{msg.text}</p>
                  <p className={cn("mt-1 text-[10px]", msg.sender === "me" ? "text-primary-foreground/70" : "text-muted-foreground")}>{msg.time}</p>
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon"><Paperclip className="h-4 w-4" /></Button>
            <Input placeholder="Type a message..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} className="flex-1" />
            <Button onClick={sendMessage} disabled={!input.trim()} className="gradient-primary border-0" size="icon"><Send className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatPage;

