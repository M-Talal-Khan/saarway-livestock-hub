"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, ArrowLeft, Pin, MessageCircle, Heart, Factory, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

const AUTHOR_TYPE_LABELS: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  farm_user: { label: "Farm Staff", icon: Factory, color: "bg-sw-green-100 text-sw-green-700" },
  buyer: { label: "Individual User", icon: User, color: "bg-blue-100 text-blue-700" },
};

export default function BookmarksPage() {
  const router = useRouter();
  const { currentUser, buyerUser } = useAuth();
  const supabase = createClient();
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookmarks = async () => {
      const headers: Record<string, string> = {};
      if (buyerUser) {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.access_token) {
          headers["Authorization"] = `Bearer ${sessionData.session.access_token}`;
        }
      } else if (currentUser) {
        headers["X-Farm-Session"] = currentUser.sessionToken;
      }

      fetch("/api/erp/forum/bookmarks", { headers })
        .then(r => r.ok ? r.json() : null)
        .then(d => {
          if (d) setBookmarks(d.bookmarks || []);
          setLoading(false);
        });
    };
    fetchBookmarks();
  }, [buyerUser, currentUser, supabase]);

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.push("/erp/forum")} className="gap-2 text-muted-foreground hover:text-sw-green-700">
        <ArrowLeft className="w-4 h-4" /> Back to Forum
      </Button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-sw-green-950 flex items-center gap-2">
            <Bookmark className="w-5 h-5" /> Saved Posts
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Posts you've bookmarked for later</p>
        </div>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">{bookmarks.length} saved</span>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />)}
        </div>
      ) : bookmarks.length === 0 ? (
        <Card className="p-10 text-center border-dashed border-2">
          <Bookmark className="w-10 h-10 mx-auto text-sw-green-200 mb-3" />
          <p className="text-base font-medium text-sw-green-800">No saved posts yet</p>
          <p className="text-sm text-muted-foreground mt-1">Bookmark posts to read them later</p>
          <Button className="mt-4 gap-2 bg-sw-green-700 hover:bg-sw-green-800" onClick={() => router.push("/erp/forum")}>
            Browse Forum
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {bookmarks.map(bm => {
            const post = bm.post;
            const badge = AUTHOR_TYPE_LABELS[post?.author_type] || AUTHOR_TYPE_LABELS.farm_user;
            const Icon = badge.icon;
            return (
              <Card key={bm.id} className="hover:shadow-md transition-all border-l-4 border-l-sw-green-500">
                <Link href={`/erp/forum/post/${post.id}`} className="block p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-sw-green-100 flex items-center justify-center text-sm font-bold text-sw-green-700 flex-shrink-0 shadow-sm">
                      {post?.author?.full_name?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-1.5 mb-1.5">
                        {post.is_pinned && (
                          <span className="text-[11px] bg-sw-green-100 text-sw-green-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                            <Pin className="w-3 h-3" /> Pinned
                          </span>
                        )}
                        {post.category && (
                          <Badge variant="outline" className="text-[10px] border-sw-green-300 text-sw-green-700 bg-sw-green-50 font-medium">
                            {post.category.name}
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-sw-green-950 text-base">{post.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{post.content}</p>
                      <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-3 text-[12px] text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-sw-green-800">{post.author?.full_name ?? "Unknown"}</span>
                          <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${badge.color}`}>
                            <Icon className="w-2.5 h-2.5" /> {badge.label}
                          </span>
                        </div>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" /> {post.comment_count?.[0]?.count ?? 0} replies
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" /> {post.like_count?.[0]?.count ?? 0} likes
                        </span>
                        <span>Saved {timeAgo(bm.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}