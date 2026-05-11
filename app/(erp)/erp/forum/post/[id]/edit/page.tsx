"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { createClient } from "@/lib/supabase/client";

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const { currentUser, buyerUser } = useAuth();
  const { toast } = useToast();
  const id = params.id as string;
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
    fetchAuthHeaders().then(headers =>
      fetch(`/api/erp/forum/posts/${id}`, { headers: { "Content-Type": "application/json", ...headers } })
        .then(r => r.ok ? r.json() : null)
        .then(d => {
          if (d?.post) {
            setTitle(d.post.title || "");
            setContent(d.post.content || "");
          }
          setLoading(false);
        })
    );
  }, [id]);

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
      router.push(`/erp/forum/post/${id}`);
    } else {
      const err = await res.json();
      toast({ title: "Error", description: err.error, variant: "destructive" });
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="h-8 w-48 bg-muted animate-pulse rounded" />;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => router.back()} className="gap-2">
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-sw-green-950">Edit Post</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Title</label>
              <Input value={title} onChange={e => setTitle(e.target.value)} maxLength={200} required />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Content</label>
              <Textarea value={content} onChange={e => setContent(e.target.value)} rows={10} required />
              <p className="text-xs text-muted-foreground mt-1">{content.length} characters</p>
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={saving || !title.trim() || !content.trim()}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}