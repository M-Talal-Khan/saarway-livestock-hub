"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/card";
import { Bot, User, Trash2, Copy } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIChatPage() {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const token = currentUser?.sessionToken ?? "";
  const role = currentUser?.role ?? "Admin";

  useEffect(() => {
    setMounted(true);
    const sessionKey = `ai_chat_session_${currentUser?.fullName || 'anonymous'}`;
    const messagesKey = `ai_chat_messages_${currentUser?.fullName || 'anonymous'}`;
    
    const existingSession = localStorage.getItem(sessionKey);
    const savedMessages = localStorage.getItem(messagesKey);
    
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error("Failed to parse saved messages");
      }
    }
    
    if (existingSession) {
      setSessionId(existingSession);
      if (!savedMessages) {
        fetchHistory(existingSession);
      }
    } else {
      const newSession = `ai_${role}_${Date.now()}`;
      setSessionId(newSession);
      localStorage.setItem(sessionKey, newSession);
    }
  }, [currentUser?.fullName, role]);

  useEffect(() => {
    if (messages.length > 0) {
      const messagesKey = `ai_chat_messages_${currentUser?.fullName || 'anonymous'}`;
      localStorage.setItem(messagesKey, JSON.stringify(messages));
    }
    scrollToBottom();
  }, [messages, currentUser?.fullName]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchHistory = async (sid: string) => {
    try {
      const res = await fetch(`/api/ai/chat?sessionId=${sid}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
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

  const clearChat = () => {
    setMessages([]);
    const sessionKey = `ai_chat_session_${currentUser?.fullName || 'anonymous'}`;
    const messagesKey = `ai_chat_messages_${currentUser?.fullName || 'anonymous'}`;
    localStorage.removeItem(sessionKey);
    localStorage.removeItem(messagesKey);
    setSessionId(`ai_${role}_${Date.now()}`);
    toast({ title: "Chat cleared" });
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({ title: "Copied to clipboard" });
  };

  const getRoleKey = (r: string) => {
    const map: Record<string, string> = {
      "Admin": "admin",
      "Manager": "manager",
      "Veterinarian": "vet",
      "Accounts Officer": "accounts",
      "Worker": "worker",
    };
    return map[r] || "admin";
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setLoading(true);

    setMessages(prev => [...prev, { role: "user", content: userMessage }]);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          message: userMessage,
          userType: getRoleKey(role),
          sessionId
        })
      });

      const data = await res.json();

      if (res.ok && data.response) {
        setMessages(prev => [...prev, { role: "assistant", content: data.response }]);
        if (data.sessionId) {
          setSessionId(data.sessionId);
          const sessionKey = `ai_chat_session_${currentUser?.fullName || 'anonymous'}`;
          localStorage.setItem(sessionKey, data.sessionId);
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
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const renderMarkdown = (text: string) => {
    // Replace **text** with <strong>text</strong>
    // Replace *text* with <em>text</em>
    // Replace newlines with <br /> handled by whitespace-pre-wrap
    let html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
  };

  if (!mounted) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-16 bg-sw-green-50 rounded-xl" />
        <div className="h-[calc(100vh-220px)] bg-sw-green-50 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between erp-slide-up">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #3db83d, #1f9e1f)' }}
          >
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">AI Assistant</h1>
            <p className="text-sm text-muted-foreground">{role}</p>
          </div>
        </div>
        <button
          onClick={clearChat}
          disabled={messages.length === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-sw-green-200 hover:bg-sw-green-50 transition-all text-sm text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Trash2 className="h-4 w-4" />
          Clear
        </button>
      </div>

      {/* Chat Container */}
      <div className="rounded-2xl overflow-hidden shadow-lg erp-slide-up erp-stagger-1"
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #f0faf0 100%)',
          border: '1px solid #d6f5d6',
          height: 'calc(100vh - 180px)'
        }}
      >
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 h-full">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6 erp-stagger-2"
                style={{ background: 'linear-gradient(135deg, #d6f5d6, #b3e6b3)' }}
              >
                <Bot className="h-12 w-12 text-sw-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3 erp-stagger-3">How can I help you?</h2>
              <p className="text-muted-foreground max-w-md erp-stagger-4">
                Ask me anything about farm operations, cattle management, health, finance, or any other questions.
              </p>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex items-end gap-2 animate-fade-in-up ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    msg.role === "user"
                      ? "bg-sw-green-500"
                      : "bg-sw-green-100"
                  }`}>
                    {msg.role === "user" ? (
                      <User className="h-4 w-4 text-white" />
                    ) : (
                      <Bot className="h-4 w-4 text-sw-green-600" />
                    )}
                  </div>
                  <div className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-sm transition-all duration-200 hover:shadow-md ${
                    msg.role === "user"
                      ? "bg-sw-green-500 text-white rounded-br-sm"
                      : "bg-white text-foreground rounded-bl-sm border border-sw-green-100"
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{renderMarkdown(msg.content)}</p>
                    <div className={`flex items-center gap-1 mt-2 ${msg.role === "user" ? "justify-end" : ""}`}>
                      <button
                        onClick={() => copyMessage(msg.content)}
                        className="p-1.5 rounded-lg hover:bg-black/5 transition-colors"
                        title="Copy"
                      >
                        <Copy className={`h-3.5 w-3.5 ${msg.role === "user" ? "text-white/70" : "text-muted-foreground"} hover:text-foreground`} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-end gap-2 animate-fade-in-up">
                  <div className="w-8 h-8 rounded-lg bg-sw-green-100 flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-sw-green-600" />
                  </div>
                  <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 border border-sw-green-100 shadow-sm">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-sw-green-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 rounded-full bg-sw-green-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 rounded-full bg-sw-green-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-sw-green-100 bg-white">
          <div className="flex gap-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message..."
              disabled={loading}
              rows={1}
              className="flex-1 px-4 py-3 rounded-xl bg-sw-green-50 border border-sw-green-200 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-sw-green-400 focus:ring-2 focus:ring-sw-green-100 resize-none transition-all"
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #3db83d, #1f9e1f)' }}
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-3 text-center">
            Powered by Groq AI · Responses are AI-generated
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}