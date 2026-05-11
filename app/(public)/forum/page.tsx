"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  MessageCircle, Plus, Stethoscope, UtensilsCrossed, ShoppingBag,
  Pin, Search, Factory, User, Lock, LogIn, Heart, TrendingUp, Clock,
  Bookmark, X, Filter, Flame, Eye,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

const ICON_MAP: Record<string, React.ElementType> = { MessageCircle, Stethoscope, UtensilsCrossed, ShoppingBag };
const AUTHOR_TYPE_LABELS: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  farm_user: { label: "Farm Staff", icon: Factory, color: "bg-sw-green-100 text-sw-green-700" },
  buyer: { label: "Individual User", icon: User, color: "bg-blue-100 text-blue-700" },
};
type TabFilter = "all" | "mine" | "liked" | "saved";
const POSTS_PER_PAGE = 10;

export default function PublicForumPage() {
  const { currentUser, buyerUser } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const isLoggedIn = !!buyerUser || !!currentUser;

  const [categories, setCategories] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "farm_user" | "buyer">("all");
  const [sort, setSort] = useState<"recent" | "popular">("recent");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [tab, setTab] = useState<TabFilter>("all");
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [togglingLikeId, setTogglingLikeId] = useState<string | null>(null);
  const [togglingSaveId, setTogglingSaveId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalPosts, setTotalPosts] = useState(0);

  const fetchForumData = useCallback(async (pageNum = 1, isLoadMore = false) => {
    if (isLoadMore) setLoadingMore(true); else setLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (buyerUser) {
        const { data: sd } = await supabase.auth.getSession();
        if (sd?.session?.access_token) headers["Authorization"] = `Bearer ${sd.session.access_token}`;
      } else if (currentUser) {
        headers["X-Farm-Session"] = currentUser.sessionToken;
      }
      const params = new URLSearchParams();
      if (filter !== "all") params.set("author_type", filter);
      if (search) params.set("q", search);
      if (sort === "popular") params.set("sort", "popular");
      if (tab !== "all") params.set("tab", tab);
      params.set("page", pageNum.toString());
      params.set("limit", POSTS_PER_PAGE.toString());
      const url = "/api/erp/forum" + (params.size ? `?${params}` : "");
      const res = await fetch(url, { headers });
      if (!res.ok) {
        if (!isLoadMore) setPosts([]);
        setHasMore(false);
        return;
      }

      const data = await res.json();
      const nextPosts = data.posts || [];
      if (isLoadMore) {
        setPosts(prev => [...prev, ...nextPosts]);
      } else {
        setCategories(data.categories || []);
        setPosts(nextPosts);
      }
      setTotalPosts(typeof data.total === "number" ? data.total : nextPosts.length);
      setTrendingPosts(data.trendingPosts || []);
      setHasMore(data.hasMore ?? nextPosts.length === POSTS_PER_PAGE);
      if (data.likedPostIds) setLikedIds(new Set(data.likedPostIds));
      if (data.savedPostIds) setSavedIds(new Set(data.savedPostIds));
    } catch (error) {
      console.error("Failed to load forum", error);
      if (!isLoadMore) setPosts([]);
      setHasMore(false);
    } finally { if (isLoadMore) setLoadingMore(false); else setLoading(false); }
  }, [filter, search, sort, tab, buyerUser, currentUser, supabase]);

  useEffect(() => { setPage(1); fetchForumData(1); }, [fetchForumData]);

  const loadMorePosts = () => {
    if (loadingMore || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchForumData(nextPage, true);
  };

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setSearch(searchInput); };
  const handleNewPost = () => { if (!isLoggedIn) { setShowLoginDialog(true); return; } router.push("/forum/post/new"); };
  const handleTabChange = (newTab: TabFilter) => {
    if (newTab !== "all" && !isLoggedIn) { setShowLoginDialog(true); return; }
    setTab(newTab);
  };

  const getAuthHeaders = async () => {
    const h: Record<string, string> = {};
    if (buyerUser) {
      const { data: sd } = await supabase.auth.getSession();
      if (sd?.session?.access_token) h["Authorization"] = `Bearer ${sd.session.access_token}`;
    } else if (currentUser) { h["X-Farm-Session"] = currentUser.sessionToken; }
    return h;
  };

  const toggleLike = async (postId: string) => {
    if (!isLoggedIn) { setShowLoginDialog(true); return; }
    setTogglingLikeId(postId);
    const headers = await getAuthHeaders();
    const res = await fetch(`/api/erp/forum/posts/${postId}/like`, { method: "POST", headers });
    setTogglingLikeId(null);
    if (res.ok) {
      const data = await res.json();
      setLikedIds(prev => { const n = new Set(prev); data.liked ? n.add(postId) : n.delete(postId); return n; });
      setPosts(prev => prev.map(p => p.id !== postId ? p : {
        ...p, like_count: [{ count: data.liked ? (p.like_count?.[0]?.count ?? 0) + 1 : Math.max(0, (p.like_count?.[0]?.count ?? 0) - 1) }],
      }));
    }
  };

  const toggleSave = async (postId: string) => {
    if (!isLoggedIn) { setShowLoginDialog(true); return; }
    setTogglingSaveId(postId);
    const headers = await getAuthHeaders();
    const res = await fetch(`/api/erp/forum/posts/${postId}/bookmark`, { method: "POST", headers });
    setTogglingSaveId(null);
    if (res.ok) {
      const data = await res.json();
      setSavedIds(prev => { const n = new Set(prev); data.bookmarked ? n.add(postId) : n.delete(postId); return n; });
    }
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

  const tabHeading = () => {
    if (search) return `Results for "${search}"`;
    if (tab === "mine") return "My Discussions";
    if (tab === "liked") return "Liked Discussions";
    if (tab === "saved") return "Saved Discussions";
    if (sort === "popular") return "Popular Discussions";
    return "Recent Discussions";
  };

  const totalReplies = posts.reduce((sum, post) => sum + (post.comment_count?.[0]?.count ?? 0), 0);
  const totalLikes = posts.reduce((sum, post) => sum + (post.like_count?.[0]?.count ?? 0), 0);

  const ForumSidebar = () => (
    <div className="space-y-4">
      <Card className="border-sw-green-100 bg-white shadow-md overflow-hidden">
        <CardContent className="p-4">
          <h3 className="text-sm font-bold text-sw-green-950 flex items-center gap-2 mb-3">
            <Filter className="h-4 w-4 text-sw-green-600" /> Categories
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {categories.slice(0, 6).map((cat, idx) => {
              const Icon = ICON_MAP[cat.icon] || MessageCircle;
              return (
                <button
                  key={cat.id}
                  onClick={() => router.push(`/forum/categories/${cat.slug}`)}
                  className="relative p-3 rounded-xl border border-transparent bg-gradient-to-br from-sw-green-50 to-white hover:from-sw-green-100 hover:to-sw-green-50 hover:border-sw-green-200 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 group text-left overflow-hidden"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-sw-green-500/0 via-sw-green-500/5 to-sw-green-500/0 group-hover:via-sw-green-500/10 transition-all duration-300" />
                  <span className="relative flex flex-col items-center gap-1.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sw-green-100 to-sw-green-200/50 shadow-sm group-hover:scale-110 transition-transform duration-200">
                      <Icon className="h-4 w-4 text-sw-green-700" />
                    </span>
                    <span className="text-[11px] font-semibold text-sw-green-900 truncate w-full text-center leading-tight">{cat.name}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {trendingPosts.length > 0 && (
        <Card className="border-sw-green-100 bg-white shadow-md overflow-hidden">
          <CardContent className="p-4">
            <h3 className="text-sm font-bold text-sw-green-950 flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" /> Trending
            </h3>
            <div className="mt-3 space-y-1">
              {trendingPosts.slice(0, 5).map((post, idx) => (
                <Link key={post.id} href={`/forum/post/${post.id}`}
                  className="block py-2.5 px-3 rounded-lg group hover:bg-sw-green-50 transition-all duration-200 border border-transparent hover:border-sw-green-100"
                  style={{ animationDelay: `${idx * 30}ms` }}
                >
                  <p className="line-clamp-2 text-sm font-medium text-sw-green-950 group-hover:text-sw-green-700 transition-colors">{post.title}</p>
                  <div className="mt-1.5 flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1"><Heart className="h-3 w-3 text-red-400" /> {post.like_count?.[0]?.count ?? 0}</span>
                    <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3 text-sw-green-500" /> {post.comment_count?.[0]?.count ?? 0}</span>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderPostCard = (post: any) => {
    const badge = AUTHOR_TYPE_LABELS[post.author_type] || AUTHOR_TYPE_LABELS.farm_user;
    const AuthIcon = badge.icon;
    const commentCount = post.comment_count?.[0]?.count ?? 0;
    const likeCount = post.like_count?.[0]?.count ?? 0;
    const isLiked = likedIds.has(post.id);
    const isSaved = savedIds.has(post.id);
    const isLiking = togglingLikeId === post.id;
    const isSaving = togglingSaveId === post.id;

    return (
      <Card key={post.id} className="group overflow-hidden border-sw-green-100 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-sw-green-300 hover:shadow-md">
        <div className="flex items-start gap-4 p-4 sm:p-5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-sw-green-100 to-sw-green-300/40 flex items-center justify-center text-sm font-bold text-sw-green-800 flex-shrink-0 shadow-sm">
            {post.author?.full_name?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="flex-1 min-w-0">
            <Link href={`/forum/post/${post.id}`} className="block">
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                {post.is_pinned && (<span className="text-[11px] bg-sw-green-100 text-sw-green-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1"><Pin className="w-3 h-3" /> Pinned</span>)}
                {post.is_locked && (<span className="text-[11px] bg-destructive/10 text-destructive px-2 py-0.5 rounded-full font-medium flex items-center gap-1"><Lock className="w-3 h-3" /> Locked</span>)}
                {post.category && (<Badge variant="outline" className="text-[10px] border-sw-green-300 text-sw-green-700 bg-sw-green-50 font-medium">{post.category.name}</Badge>)}
              </div>
              <h3 className="font-semibold text-sw-green-950 text-lg leading-snug group-hover:text-sw-green-700 transition-colors">{post.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-2 leading-relaxed">{post.content}</p>
              <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-4 text-[12px] text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-sw-green-800">{post.author?.full_name ?? "Unknown"}</span>
                  <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${badge.color}`}>
                    <AuthIcon className="w-2.5 h-2.5" /> {badge.label}
                  </span>
                </div>
                <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {commentCount} {commentCount === 1 ? "reply" : "replies"}</span>
                <span className="flex items-center gap-1">
                  <Heart className={`w-3 h-3 ${isLiked ? "fill-current text-red-500" : ""}`} />
                  <span className={isLiked ? "text-red-500" : ""}>{likeCount} likes</span>
                </span>
                <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {post.view_count ?? 0}</span>
                <span>{timeAgo(post.created_at)}</span>
              </div>
            </Link>
          </div>
          <div className="flex flex-col gap-1 flex-shrink-0">
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleLike(post.id); }} disabled={isLiking}
              className={`p-2 rounded-lg transition-all disabled:opacity-50 ${isLiked ? "bg-red-50 hover:bg-red-100" : "hover:bg-red-50"}`} title={isLiked ? "Unlike" : "Like"}>
              {isLiking ? <Clock className="w-4 h-4 animate-spin text-muted-foreground" /> :
                <Heart className={`w-4 h-4 transition-colors ${isLiked ? "fill-current text-red-500" : "text-muted-foreground hover:text-red-500"}`} />}
            </button>
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleSave(post.id); }} disabled={isSaving}
              className={`p-2 rounded-lg transition-all disabled:opacity-50 ${isSaved ? "bg-sw-green-50 hover:bg-sw-green-100" : "hover:bg-sw-green-50"}`} title={isSaved ? "Unsave" : "Save"}>
              {isSaving ? <Clock className="w-4 h-4 animate-spin text-muted-foreground" /> :
                <Bookmark className={`w-4 h-4 transition-colors ${isSaved ? "fill-current text-sw-green-600" : "text-muted-foreground hover:text-sw-green-600"}`} />}
            </button>
          </div>
        </div>
      </Card>
    );
  };



  return (
    <div className="container mx-auto px-4 pb-8 pt-24 max-w-7xl space-y-6">
      {/* Header */}
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-sw-green-900 via-sw-green-700 to-sw-green-500 p-5 sm:p-6 text-white shadow-[0_18px_45px_-25px_rgba(20,83,45,0.65)]">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <Badge className="mb-3 border-white/20 bg-white/15 text-white hover:bg-white/20">Saarway community</Badge>
            <h1 className="text-2xl sm:text-3xl font-bold">Community Forum</h1>
            <p className="text-sm text-white/75 mt-2 max-w-2xl">Join discussions with farmers and buyers across Pakistan.</p>
          </div>
          <Button onClick={handleNewPost} className="gap-2 bg-white text-sw-green-900 hover:bg-sw-green-50 w-full md:w-auto">
            <Plus className="w-4 h-4" /> New Discussion
          </Button>
        </div>
      </div>

      {/* Community Stats Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card className="bg-sw-green-50/50 border-sw-green-100 shadow-sm">
          <CardContent className="p-3 md:p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-1">
            <div className="flex items-center gap-2 text-sw-green-800"><MessageCircle className="w-4 h-4 text-sw-green-600"/> <span className="text-xs md:text-sm font-medium">Total Discussions</span></div>
            <span className="text-lg md:text-xl font-bold text-sw-green-900">{totalPosts}</span>
          </CardContent>
        </Card>
        <Card className="bg-sw-green-50/50 border-sw-green-100 shadow-sm">
          <CardContent className="p-3 md:p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-1">
            <div className="flex items-center gap-2 text-sw-green-800"><MessageCircle className="w-4 h-4 text-sw-green-600"/> <span className="text-xs md:text-sm font-medium">Replies</span></div>
            <span className="text-lg md:text-xl font-bold text-sw-green-900">{totalReplies}</span>
          </CardContent>
        </Card>
        <Card className="bg-sw-green-50/50 border-sw-green-100 shadow-sm">
          <CardContent className="p-3 md:p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-1">
            <div className="flex items-center gap-2 text-sw-green-800"><TrendingUp className="w-4 h-4 text-sw-green-600"/> <span className="text-xs md:text-sm font-medium">Total Likes</span></div>
            <span className="text-lg md:text-xl font-bold text-sw-green-900">{totalLikes}</span>
          </CardContent>
        </Card>
        <Card className="bg-sw-green-50/50 border-sw-green-100 shadow-sm hidden md:block">
          <CardContent className="p-3 md:p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-1">
            <div className="flex items-center gap-2 text-sw-green-800"><Bookmark className="w-4 h-4 text-sw-green-600"/> <span className="text-xs md:text-sm font-medium">Saved</span></div>
            <span className="text-lg md:text-xl font-bold text-sw-green-900">{savedIds.size}</span>
          </CardContent>
        </Card>
      </div>

      {/* Controls row */}
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto md:flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search discussions..." value={searchInput} onChange={e => setSearchInput(e.target.value)} className="pl-10 w-full" />
          </div>
          <Button type="submit" variant="secondary" className="gap-1.5"><Search className="w-4 h-4" /><span className="hidden sm:inline">Search</span></Button>
        </form>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 flex-1 md:flex-none">
            <span className="text-xs text-muted-foreground font-medium hidden sm:inline">Sort:</span>
            <Button size="sm" variant={sort === "recent" ? "default" : "outline"} onClick={() => setSort("recent")} className="gap-1 text-xs flex-1 md:flex-none"><Clock className="w-3 h-3" /> Recent</Button>
            <Button size="sm" variant={sort === "popular" ? "default" : "outline"} onClick={() => setSort("popular")} className="gap-1 text-xs flex-1 md:flex-none"><TrendingUp className="w-3 h-3" /> Popular</Button>
          </div>
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
            <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">Show:</span>
            {(["all", "farm_user", "buyer"] as const).map(f => (
              <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)} className="gap-1 text-xs flex-shrink-0">
                {f === "all" ? "Everyone" : f === "farm_user" ? <><Factory className="w-3 h-3" /> Farm Staff</> : <><User className="w-3 h-3" /> Buyers</>}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab filters */}
      <div className="flex items-center gap-2 border-b pt-1 pb-2 overflow-x-auto hide-scrollbar">
        <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <span className="text-xs text-muted-foreground font-medium mr-1 flex-shrink-0">Filter:</span>
        {([
          { key: "all" as TabFilter, label: "All Posts", icon: MessageCircle },
          { key: "mine" as TabFilter, label: "My Posts", icon: User },
          { key: "liked" as TabFilter, label: "Liked", icon: Heart },
          { key: "saved" as TabFilter, label: "Saved", icon: Bookmark },
        ]).map(t => (
          <button key={t.key} onClick={() => handleTabChange(t.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all flex-shrink-0 ${
              tab === t.key
                ? t.key === "liked" ? "bg-red-50 text-red-600 ring-1 ring-red-200"
                : t.key === "saved" ? "bg-sw-green-50 text-sw-green-700 ring-1 ring-sw-green-200"
                : t.key === "mine" ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                : "bg-sw-green-100 text-sw-green-800 ring-1 ring-sw-green-300"
                : "text-muted-foreground hover:bg-muted"
            }`}>
            <t.icon className={`w-3 h-3 ${tab === t.key && t.key === "liked" ? "fill-current" : ""}`} />
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[1,2,3,4].map(i => <Card key={i} className="h-28 animate-pulse bg-muted" />)}</div>
          <div className="space-y-3">{[1,2,3].map(i => <Card key={i} className="h-24 animate-pulse bg-muted" />)}</div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
          {/* Posts Column */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-sw-green-800">
                {tabHeading()}
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  ({posts.length}{totalPosts > posts.length ? ` of ${totalPosts}` : ""} posts)
                </span>
              </h2>
            </div>
            <div className="space-y-3">
              {posts.length === 0 ? (
                <Card className="p-10 text-center border-dashed border-2">
                  {tab === "liked" ? (<><Heart className="w-10 h-10 mx-auto text-red-200 mb-3" /><p className="text-base font-medium text-sw-green-800">No liked posts yet</p><p className="text-sm text-muted-foreground mt-1">Like discussions to see them here!</p></>)
                  : tab === "saved" ? (<><Bookmark className="w-10 h-10 mx-auto text-sw-green-200 mb-3" /><p className="text-base font-medium text-sw-green-800">No saved posts yet</p><p className="text-sm text-muted-foreground mt-1">Bookmark discussions to find them here later!</p></>)
                  : (<><MessageCircle className="w-10 h-10 mx-auto text-sw-green-200 mb-3" /><p className="text-base font-medium text-sw-green-800">No discussions yet</p><p className="text-sm text-muted-foreground mt-1">Be the first to start a conversation!</p><Button onClick={handleNewPost} className="mt-4 gap-2 bg-sw-green-700 hover:bg-sw-green-800"><Plus className="w-4 h-4" /> Start a Discussion</Button></>)}
                </Card>
              ) : posts.map(renderPostCard)}
              {hasMore && posts.length > 0 && (
                <div className="flex flex-col items-center gap-2 pt-4">
                  <p className="text-xs text-muted-foreground">Showing {posts.length} of {totalPosts} discussions</p>
                  <Button variant="outline" onClick={loadMorePosts} disabled={loadingMore} className="gap-2 text-sw-green-700 border-sw-green-300 hover:bg-sw-green-50">
                    {loadingMore ? <Clock className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
                    {loadingMore ? "Loading..." : "Load More Discussions"}
                  </Button>
                </div>
              )}
            </div>
          </div>
          </div>
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <ForumSidebar />
            </div>
          </aside>
        </div>
      )}

      {/* Login dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sw-green-950">Login Required</DialogTitle>
            <DialogDescription>You need to be logged in to use this feature.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-2">
            <Button onClick={() => { setShowLoginDialog(false); router.push("/login"); }} className="gap-2 bg-sw-green-700 hover:bg-sw-green-800"><LogIn className="w-4 h-4" /> Login as Individual User</Button>
            <Button variant="outline" onClick={() => { setShowLoginDialog(false); router.push("/farm-login"); }} className="gap-2">Login as Farm Staff</Button>
            <Button variant="ghost" onClick={() => setShowLoginDialog(false)} className="text-muted-foreground"><X className="w-4 h-4 mr-1" /> Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
