import { useState } from "react";
import { motion } from "framer-motion";
import { Bot, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import PageHeader from "@/components/common/PageHeader";
import { askCareerAssistant } from "@/features/ai/aiApi";

interface Message {
  role: "user" | "assistant";
  text: string;
}

const CandidateAIAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    const text = input.trim();
    if (!text) return;
    setMessages((items) => [...items, { role: "user", text }]);
    setInput("");
    setLoading(true);
    setError("");
    try {
      const response = await askCareerAssistant(text);
      setMessages((items) => [...items, { role: "assistant", text: response.reply }]);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "AI assistant is unavailable.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader title="AI Career Assistant" description="Private career guidance based on your OpportunityX profile" />
      <Card>
        <CardContent className="flex h-[520px] flex-col p-0">
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {!messages.length && !error && (
              <div className="flex h-full flex-col items-center justify-center text-center text-sm text-muted-foreground">
                <Bot className="mb-3 h-8 w-8 text-primary" />
                Ask about resume positioning, interview prep, job search strategy, or skills to develop next.
              </div>
            )}
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={message.role === "user" ? "text-right" : "text-left"}>
                <div className={`inline-block max-w-[80%] rounded-2xl px-4 py-2 text-sm ${message.role === "user" ? "gradient-primary text-primary-foreground" : "bg-muted"}`}>
                  {message.text}
                </div>
              </div>
            ))}
            {loading && <p className="flex items-center text-sm text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Thinking...</p>}
            {error && <div className="rounded-lg border border-destructive/30 p-3 text-sm text-destructive">{error}</div>}
          </div>
          <div className="flex gap-2 border-t border-border p-4">
            <Input value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => event.key === "Enter" && void submit()} placeholder="Ask a career question..." />
            <Button onClick={() => void submit()} disabled={loading || !input.trim()} size="icon" className="gradient-primary border-0"><Send className="h-4 w-4" /></Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CandidateAIAssistant;
