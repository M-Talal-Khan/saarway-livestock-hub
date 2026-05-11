"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { createClient } from "@/lib/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function PublicEditPostPage() {
  const router = useRouter();
  const params = useParams();
  const { currentUser, buyerUser, isLoggedIn } = useAuth();
  const { toast } = useToast();
  const id = params.id as string;
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const fetchAuthHeaders = async () => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (buyerUser) {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.access_token) {
        headers["Authorization"] = `Bearer ${sessionData.session.access_token}`;
      }
    } else if (currentUser) {
      headers["X-Farm-Session"] = currentUser.sessionToken;
    }
    return headers;
  };

  useEffect(() => {
    if (!isLoggedIn) {
      setShowLoginDialog(true);
      return;
    }

    fetchAuthHeaders().then(headers =>
      fetch(`/api/erp/forum/posts/${id}`, { headers: { "Content-Type": "application/json", ...headers } })
        .then(r => r.ok ? r.json() : null)
        .then(d => {
          if (d?.post) {
            setTitle(d.post.title || "");
            setContent(d.post.content || "");
          } else {
            router.push("/forum");
          }
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
          router.push("/forum");
        })
    );
  }, [id, isLoggedIn]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSaving(true);
    const headers = await fetchAuthHeaders();
    const res = await fetch(`/api/erp/forum/posts/${id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ title: title.trim(), content: content.trim() }),
    });

    if (res.ok) {
      toast({ title: "Post updated" });
      router.push(`/forum/post/${id}`);
    } else {
      const err = await res.json();
      toast({ title: "Error", description: err.error, variant: "destructive" });
      setSaving(false);
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
          <p className="text-muted-foreground mb-8">You need to be logged in to edit this post.</p>
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 pb-8 pt-24 max-w-2xl">
        <div className="h-8 w-48 bg-muted animate-pulse rounded mb-6" />
        <div className="h-64 bg-muted animate-pulse rounded-xl" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pb-8 pt-24 max-w-2xl space-y-6">
      <Button variant="ghost" onClick={() => router.push(`/forum/post/${id}`)} className="gap-2 text-muted-foreground hover:text-sw-green-700">
        <ArrowLeft className="w-4 h-4" /> Back to Post
      </Button>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-sw-green-950">Edit Post</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Title</label>
              <Input value={title} onChange={e => setTitle(e.target.value)} maxLength={200} required className="focus:ring-sw-green-500" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Content</label>
              <Textarea value={content} onChange={e => setContent(e.target.value)} rows={10} required className="resize-none focus:ring-sw-green-500" />
              <p className="text-xs text-muted-foreground mt-1">{content.length} characters</p>
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={saving || !title.trim() || !content.trim()} className="gap-2 bg-sw-green-700 hover:bg-sw-green-800">
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push(`/forum/post/${id}`)}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
