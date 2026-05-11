"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bold, Italic, List, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function PublicNewPostPage() {
  const router = useRouter();
  const { currentUser, buyerUser, isLoggedIn } = useAuth();
  const { toast } = useToast();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", categoryId: "" });
  const [userType, setUserType] = useState<"farm_user" | "buyer">("buyer");
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      setShowLoginDialog(true);
      return;
    }
    setUserType(currentUser ? "farm_user" : "buyer");

    fetch("/api/erp/forum/categories")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setCategories(d.categories || []); });
  }, [currentUser, buyerUser, isLoggedIn]);

  const insertFormatting = (before: string, after: string = before) => {
    const textarea = document.querySelector("textarea[name='content']") as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = form.content.slice(start, end);
    const newContent = form.content.slice(0, start) + before + selected + after + form.content.slice(end);
    setForm(f => ({ ...f, content: newContent }));
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;

    setLoading(true);

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 20000);

    try {
      let headers: Record<string, string> = { "Content-Type": "application/json" };
      if (buyerUser) {
        const { data: sessionData } = await createClient().auth.getSession();
        if (sessionData?.session?.access_token) {
          headers["Authorization"] = `Bearer ${sessionData.session.access_token}`;
        }
      }
      if (currentUser && !buyerUser) {
        headers["X-Farm-Session"] = currentUser.sessionToken;
      }

      if (!headers.Authorization && !headers["X-Farm-Session"]) {
        setShowLoginDialog(true);
        return;
      }

      const res = await fetch("/api/erp/forum", {
        method: "POST",
        headers,
        signal: controller.signal,
        body: JSON.stringify({ title: form.title, content: form.content, categoryId: form.categoryId || null }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        toast({ title: "Unable to post", description: data?.error ?? "Please try again.", variant: "destructive" });
        return;
      }

      router.push(`/forum/post/${data.post.id}`);
    } catch (error) {
      const isAbort = error instanceof DOMException && error.name === "AbortError";
      toast({
        title: "Unable to post",
        description: isAbort ? "The request timed out. Please try again." : "Something went wrong while posting.",
        variant: "destructive",
      });
    } finally {
      window.clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  if (showLoginDialog) {
    return (
      <div className="container mx-auto px-4 py-24 max-w-2xl text-center">
        <div className="bg-[#b2c9ab]/30 backdrop-blur-2xl rounded-[2rem] p-10 border border-white/30 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-sw-green-100 flex items-center justify-center mx-auto mb-6">
            <LogIn className="w-8 h-8 text-sw-green-800" />
          </div>
          <h1 className="text-2xl font-bold text-sw-green-950 mb-3">Login Required</h1>
          <p className="text-muted-foreground mb-8">You need to be logged in to post a discussion.</p>
          <div className="space-y-3">
            <Button onClick={() => { setShowLoginDialog(false); router.push("/login"); }} className="w-full gap-2 bg-sw-green-700 hover:bg-sw-green-800">
              <LogIn className="w-4 h-4" /> Login as Individual User
            </Button>
            <Button variant="outline" onClick={() => { setShowLoginDialog(false); router.push("/farm-login"); }} className="w-full gap-2">
              Login as Farm Staff
            </Button>
            <Button variant="ghost" onClick={() => { setShowLoginDialog(false); router.push("/forum"); }} className="text-muted-foreground">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pb-8 pt-24 max-w-2xl space-y-6">
      <Button variant="ghost" onClick={() => router.push("/forum")} className="gap-2 text-muted-foreground hover:text-sw-green-700">
        <ArrowLeft className="w-4 h-4" /> Back to Forum
      </Button>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-sw-green-950 flex items-center gap-2">
            Start a Discussion
            <Badge variant="outline" className="text-xs">
              {userType === "farm_user" ? "Farm Staff" : "Individual User"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Title</label>
              <Input
                placeholder="What's on your mind?"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                maxLength={200}
                required
                className="focus:ring-sw-green-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Category</label>
              <select
                className="w-full h-10 px-3 rounded-lg border border-border bg-white text-sm focus:ring-2 focus:ring-sw-green-500 focus:outline-none"
                value={form.categoryId}
                onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Content</label>
              <div className="flex items-center gap-1 mb-2">
                <button type="button" onClick={() => insertFormatting("**")} className="p-2 rounded-md hover:bg-muted transition-colors" title="Bold"><Bold className="w-4 h-4" /></button>
                <button type="button" onClick={() => insertFormatting("_")} className="p-2 rounded-md hover:bg-muted transition-colors" title="Italic"><Italic className="w-4 h-4" /></button>
                <button type="button" onClick={() => insertFormatting("\n- ")} className="p-2 rounded-md hover:bg-muted transition-colors" title="Bullet List"><List className="w-4 h-4" /></button>
                <button type="button" onClick={() => insertFormatting("`")} className="p-2 rounded-md hover:bg-muted transition-colors font-mono text-xs font-bold" title="Code">{"</>"}</button>
                <span className="text-xs text-muted-foreground ml-2">Use ** for bold, _ for italic</span>
              </div>
              <Textarea
                name="content"
                placeholder="Share your thoughts, questions, or tips..."
                rows={10}
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                required
                className="resize-none focus:ring-sw-green-500"
              />
              <p className="text-xs text-muted-foreground mt-1">{form.content.length} characters</p>
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={loading || !form.title.trim() || !form.content.trim()} className="gap-2 bg-sw-green-700 hover:bg-sw-green-800">
                {loading ? "Posting..." : "Post Discussion"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push("/forum")}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
