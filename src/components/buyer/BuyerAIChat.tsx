"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { usePathname } from "next/navigation";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function BuyerAIChat() {
  const { currentUser, buyerUser } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const userType = "buyer";
  const token = currentUser?.sessionToken;

  const isFarmUserOnPublic = !!currentUser && !pathname.startsWith("/erp");
  const isBuyer = !!buyerUser;
  const shouldHide = isFarmUserOnPublic || !isBuyer;

  useEffect(() => {
    if (shouldHide) return;
    const existingSession = localStorage.getItem("saarway_buyer_chat_session");
    if (existingSession) {
      setSessionId(existingSession);
      fetchHistory(existingSession);
    } else {
      const newSession = `buyer_${Date.now()}`;
      setSessionId(newSession);
      localStorage.setItem("saarway_buyer_chat_session", newSession);
    }
  }, [shouldHide]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchHistory = async (sid: string) => {
    try {
      const res = await fetch(`/api/ai/chat?sessionId=${sid}`);
      if (res.ok) {
        const data = await res.json();
        const formatted = data.messages.map((m: { role: string; content: string }) => ({
          role: m.role as "user" | "assistant",
          content: m.content
        }));
        setMessages(formatted);
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setLoading(true);

    setMessages(prev => [...prev, { role: "user", content: userMessage }]);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers,
        body: JSON.stringify({
          message: userMessage,
          userType,
          sessionId
        })
      });

      const data = await res.json();

      if (res.ok && data.response) {
        setMessages(prev => [...prev, { role: "assistant", content: data.response }]);
        if (data.sessionId) {
          setSessionId(data.sessionId);
          localStorage.setItem("saarway_buyer_chat_session", data.sessionId);
        }
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to get response",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (shouldHide) return null;

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg hover:scale-110 transition-all flex items-center justify-center group"
          style={{ background: 'linear-gradient(135deg, #3db83d, #1f9e1f)' }}
          aria-label="Open AI Chat"
        >
          <MessageCircle className="h-6 w-6 text-white drop-shadow-lg relative z-10" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-sw-gold-400 rounded-full border-2 border-white" />
        </button>
      )}

      {/* Chat Window - Solid Green Theme */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] h-[500px] flex flex-col shadow-2xl overflow-hidden rounded-2xl"
          style={{ background: '#ffffff', border: '1px solid #d6f5d6' }}
        >
          {/* Header with gradient */}
          <div className="px-4 py-3 flex items-center justify-between"
            style={{ background: 'linear-gradient(135deg, #3db83d, #1f9e1f)' }}
          >
            <div className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <span className="font-semibold text-sm">Saarway Assistant</span>
                <span className="text-xs text-white/70 block">AI Powered</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
            >
              <X className="h-4 w-4 text-white" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
            {messages.length === 0 && (
              <div className="text-center py-8 px-4">
                <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                  style={{ background: '#d6f5d6' }}
                >
                  <Bot className="h-8 w-8 text-sw-green-600" />
                </div>
                <p className="font-semibold text-foreground">Hello! I&apos;m Saarway Assistant</p>
                <p className="text-sm text-muted-foreground mt-2">
                  I can help you find livestock, answer questions about our marketplace, or guide you through the buying process.
                </p>
                <div className="mt-4 space-y-2">
                  {[
                    { icon: "🔍", text: "Find cattle near me" },
                    { icon: "💳", text: "How does buying work?" },
                    { icon: "🐄", text: "What breeds are available?" },
                  ].map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(suggestion.text)}
                      className="w-full text-left px-4 py-3 rounded-xl text-sm flex items-center gap-3 transition-all"
                      style={{ background: '#f0faf0', border: '1px solid #d6f5d6', color: '#1a2a1a' }}
                    >
                      <span>{suggestion.icon}</span>
                      <span>{suggestion.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex items-start gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === "user"
                    ? "bg-sw-green-100"
                    : "bg-sw-green-500"
                }`}>
                  {msg.role === "user" ? (
                    <User className="h-4 w-4 text-sw-green-700" />
                  ) : (
                    <Bot className="h-4 w-4 text-white" />
                  )}
                </div>
                <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${
                  msg.role === "user"
                    ? "bg-sw-green-500 text-white rounded-tr-sm"
                    : "bg-sw-green-50 text-foreground rounded-tl-sm border border-sw-green-100"
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-full bg-sw-green-500 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-sw-green-50 rounded-2xl rounded-tl-sm px-4 py-3 border border-sw-green-100">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sw-green-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-sw-green-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-sw-green-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-sw-green-100 bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask me anything..."
                disabled={loading}
                className="flex-1 px-4 py-3 rounded-xl bg-sw-green-50 border border-sw-green-200 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-sw-green-400 transition-all"
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all disabled:opacity-50 hover:bg-sw-green-600"
                style={{ background: '#3db83d' }}
              >
                <Send className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}