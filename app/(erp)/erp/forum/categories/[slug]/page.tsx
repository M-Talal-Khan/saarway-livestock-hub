"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Plus, Pin, MessageCircle, Heart, Factory, User, Stethoscope, UtensilsCrossed, ShoppingBag, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const AUTHOR_TYPE_LABELS: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  farm_user: { label: "Farm Staff", icon: Factory, color: "bg-sw-green-100 text-sw-green-700" },
  buyer: { label: "Individual User", icon: User, color: "bg-blue-100 text-blue-700" },
};

const ICON_MAP: Record<string, React.ElementType> = {
  MessageCircle,
  Stethoscope,
  UtensilsCrossed,
  ShoppingBag,
};

export default function CategoryPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [posts, setPosts] = useState<any[]>([]);
  const [category, setCategory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalPosts, setTotalPosts] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetch(`/api/erp/forum/categories`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (cancelled) return;
        const cat = d?.categories?.find((c: any) => c.slug === slug) ?? null;
        setCategory(cat);
        if (!cat) setLoading(false);
      })
      .catch(error => {
        console.error("Failed to load forum category", error);
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [slug]);

  const fetchPosts = async (pageNum = 1, isLoadMore = false) => {
    if (!category?.id) return;
    if (isLoadMore) setLoadingMore(true); else setLoading(true);

    try {
      const params = new URLSearchParams({
        category: category.id,
        page: pageNum.toString(),
        limit: "10",
      });
      const res = await fetch(`/api/erp/forum?${params}`);
      const data = res.ok ? await res.json() : null;
      if (data) {
        setPosts(prev => isLoadMore ? [...prev, ...(data.posts || [])] : (data.posts || []));
        setTotalPosts(data.total ?? 0);
        setHasMore(data.hasMore ?? false);
      }
    } finally {
      if (isLoadMore) setLoadingMore(false); else setLoading(false);
    }
  };

  useEffect(() => {
    if (!category?.id) return;
    setPage(1);
    fetchPosts(1);
  }, [category?.id]);

  const loadMorePosts = () => {
    if (loadingMore || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage, true);
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const Icon = category?.icon ? (ICON_MAP[category.icon] || MessageCircle) : MessageCircle;

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.push("/erp/forum")} className="gap-2 text-muted-foreground hover:text-sw-green-700">
        <ArrowLeft className="w-4 h-4" /> Back to Forum
      </Button>

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          {category && (
            <div className="w-12 h-12 rounded-full bg-sw-green-100 flex items-center justify-center shadow-sm">
              <Icon className="w-6 h-6 text-sw-green-700" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-sw-green-950">{category?.name ?? "Category"}</h1>
            {category?.description && (
              <p className="text-sm text-muted-foreground mt-0.5">{category.description}</p>
            )}
            {totalPosts > 0 && (
              <p className="text-xs text-muted-foreground mt-1">Showing {posts.length} of {totalPosts} discussions</p>
            )}
          </div>
        </div>
        <Button onClick={() => router.push("/erp/forum/post/new")} className="gap-2 bg-sw-green-700 hover:bg-sw-green-800">
          <Plus className="w-4 h-4" /> New Post
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />)}
        </div>
      ) : posts.length === 0 ? (
        <Card className="p-10 text-center border-dashed border-2">
          <Icon className="w-10 h-10 mx-auto text-sw-green-200 mb-3" />
          <p className="text-base font-medium text-sw-green-800">No posts in this category</p>
          <p className="text-sm text-muted-foreground mt-1">Be the first to start a discussion!</p>
          <Button className="mt-4 gap-2 bg-sw-green-700 hover:bg-sw-green-800" onClick={() => router.push("/erp/forum/post/new")}>
            <Plus className="w-4 h-4" /> Start Discussion
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {posts.map(post => {
            const badge = AUTHOR_TYPE_LABELS[post.author_type] || AUTHOR_TYPE_LABELS.farm_user;
            const BadgeIcon = badge.icon;
            const commentCount = post.comment_count?.[0]?.count ?? 0;
            const likeCount = post.like_count?.[0]?.count ?? 0;
            return (
              <Card key={post.id} className="hover:shadow-md transition-all border-l-4 border-l-sw-green-500">
                <Link href={`/erp/forum/post/${post.id}`} className="block p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-sw-green-100 flex items-center justify-center text-sm font-bold text-sw-green-700 flex-shrink-0 shadow-sm">
                      {post.author?.full_name?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-1.5 mb-1.5">
                        {post.is_pinned && (
                          <span className="text-[11px] bg-sw-green-100 text-sw-green-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                            <Pin className="w-3 h-3" /> Pinned
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-sw-green-950 text-base">{post.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{post.content}</p>
                      <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-3 text-[12px] text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-sw-green-800">{post.author?.full_name ?? "Unknown"}</span>
                          <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${badge.color}`}>
                            <BadgeIcon className="w-2.5 h-2.5" /> {badge.label}
                          </span>
                        </div>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" /> {commentCount} {commentCount === 1 ? "reply" : "replies"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" /> {likeCount} likes
                        </span>
                        <span>{timeAgo(post.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </Card>
            );
          })}
          {hasMore && (
            <div className="flex justify-center pt-3">
              <Button variant="outline" onClick={loadMorePosts} disabled={loadingMore} className="gap-2 text-sw-green-700 border-sw-green-300 hover:bg-sw-green-50">
                {loadingMore ? <Clock className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
                {loadingMore ? "Loading..." : "Load More Discussions"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
