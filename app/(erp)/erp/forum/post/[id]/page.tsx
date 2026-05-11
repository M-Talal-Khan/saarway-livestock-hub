"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Heart, Bookmark, Pin, Lock, Edit, Trash2, MessageCircle, Send, Factory, User, X, Check, Flame, Reply, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";

const AUTHOR_TYPE_LABELS: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  farm_user: { label: "Farm Staff", icon: Factory, color: "bg-sw-green-100 text-sw-green-700" },
  buyer: { label: "Individual User", icon: User, color: "bg-blue-100 text-blue-700" },
};
type CommentAuthorFilter = "all" | "farm_user" | "buyer";
type CommentSort = "newest" | "oldest";

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function CommentItem({ comment, replies, userId, userType, onEdit, onDelete, onSaveEdit, onCancelEdit, editingId, editText, setEditText, onReply, replyingToId, replyText, setReplyText, onCancelReply, onSubmitReply, submittingReplyId, depth = 0, isLocked }: {
  comment: any; replies: any[]; userId: string | null; userType: string; onEdit: (c: any) => void; onDelete: (id: string) => void;
  onSaveEdit: (id: string, content: string) => void; onCancelEdit: () => void;
  editingId: string | null; editText: string; setEditText: (t: string) => void;
  onReply: (comment: any) => void; replyingToId: string | null; replyText: string; setReplyText: (t: string) => void;
  onCancelReply: () => void; onSubmitReply: (parentId: string) => void; submittingReplyId: string | null; depth?: number; isLocked: boolean;
}) {
  const badge = AUTHOR_TYPE_LABELS[comment.author_type] || AUTHOR_TYPE_LABELS.farm_user;
  const Icon = badge.icon;
  const isOwner = comment.author_id === userId;

  return (
    <div className={`flex gap-3 ${depth > 0 ? "ml-6 border-l border-sw-green-100 pl-4" : ""}`}>
      <div className="w-9 h-9 rounded-full bg-sw-green-100 flex items-center justify-center text-sm font-bold text-sw-green-700 flex-shrink-0 shadow-sm">
        {comment.author?.full_name?.[0]?.toUpperCase() ?? "?"}
      </div>
      <div className="flex-1 min-w-0">
        {editingId === comment.id ? (
          <div className="bg-muted rounded-xl p-3">
            <textarea
              value={editText}
              onChange={e => setEditText(e.target.value)}
              rows={3}
              className="w-full bg-white border border-input rounded-lg p-2.5 text-sm resize-none focus:ring-2 focus:ring-sw-green-500 focus:outline-none"
              autoFocus
            />
            <div className="flex gap-2 mt-2 justify-end">
              <Button size="sm" variant="ghost" onClick={onCancelEdit} className="h-7 px-2 text-xs">
                <X className="w-3 h-3 mr-1" /> Cancel
              </Button>
              <Button size="sm" onClick={() => onSaveEdit(comment.id, editText)} className="h-7 px-2 bg-sw-green-700 hover:bg-sw-green-800 text-xs">
                <Check className="w-3 h-3 mr-1" /> Save
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-muted rounded-xl p-3.5">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="font-semibold text-sm text-sw-green-900">{comment.author?.full_name ?? "Unknown"}</span>
              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${badge.color}`}>
                <Icon className="w-2.5 h-2.5" /> {badge.label}
              </span>
              <span className="text-xs text-muted-foreground">{timeAgo(comment.created_at)}</span>
              {isOwner && (
                <div className="flex items-center gap-1 ml-auto">
                  <button
                    onClick={() => onEdit(comment)}
                    className="p-1 rounded hover:bg-white text-muted-foreground hover:text-sw-green-600 transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(comment.id)}
                    className="p-1 rounded hover:bg-white text-muted-foreground hover:text-destructive transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{comment.content}</p>
            {!isLocked && (
              <button
                onClick={() => onReply(comment)}
                className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-sw-green-700 hover:text-sw-green-900"
              >
                <Reply className="h-3.5 w-3.5" /> Reply
              </button>
            )}
          </div>
        )}
        {replyingToId === comment.id && !isLocked && (
          <div className="mt-2 rounded-xl border border-sw-green-100 bg-sw-green-50/60 p-3">
            <textarea
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              rows={2}
              placeholder={`Reply to ${comment.author?.full_name ?? "this comment"}...`}
              className="w-full resize-none rounded-lg border border-input bg-white p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sw-green-500"
              autoFocus
            />
            <div className="mt-2 flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={onCancelReply} className="h-7 px-2 text-xs">Cancel</Button>
              <Button size="sm" onClick={() => onSubmitReply(comment.id)} disabled={submittingReplyId === comment.id || !replyText.trim()} className="h-7 px-2 bg-sw-green-700 hover:bg-sw-green-800 text-xs">
                <Send className="mr-1 h-3 w-3" /> {submittingReplyId === comment.id ? "Posting..." : "Reply"}
              </Button>
            </div>
          </div>
        )}
        {replies.length > 0 && (
          <div className="mt-3 space-y-3">
            {replies.map(reply => (
              <CommentItem
                key={reply.id}
                comment={reply}
                replies={reply.children || []}
                userId={userId}
                userType={userType}
                onEdit={onEdit}
                onDelete={onDelete}
                onSaveEdit={onSaveEdit}
                onCancelEdit={onCancelEdit}
                editingId={editingId}
                editText={editText}
                setEditText={setEditText}
                onReply={onReply}
                replyingToId={replyingToId}
                replyText={replyText}
                setReplyText={setReplyText}
                onCancelReply={onCancelReply}
                onSubmitReply={onSubmitReply}
                submittingReplyId={submittingReplyId}
                depth={depth + 1}
                isLocked={isLocked}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PostDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { currentUser, buyerUser } = useAuth();
  const { toast } = useToast();
  const id = params.id as string;
  const supabase = useMemo(() => createClient(), []);

  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<any[]>([]);
  const [communityStats, setCommunityStats] = useState({ totalPosts: 0, userLikes: 0, userSaved: 0 });
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userType, setUserType] = useState<string>("buyer");

  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [submittingReplyId, setSubmittingReplyId] = useState<string | null>(null);

  const [commentPage, setCommentPage] = useState(1);
  const [commentsHasMore, setCommentsHasMore] = useState(true);
  const [loadingMoreComments, setLoadingMoreComments] = useState(false);
  const [totalComments, setTotalComments] = useState(0);
  const [allCommentsTotal, setAllCommentsTotal] = useState(0);
  const [commentFilter, setCommentFilter] = useState<CommentAuthorFilter>("all");
  const [commentSort, setCommentSort] = useState<CommentSort>("newest");

  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editPostTitle, setEditPostTitle] = useState("");
  const [editPostContent, setEditPostContent] = useState("");
  const [savingPost, setSavingPost] = useState(false);

  const fetchAuthHeaders = useCallback(async (): Promise<Record<string, string>> => {
    const headers: Record<string, string> = {};
    if (buyerUser) {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.access_token) {
        headers["Authorization"] = `Bearer ${sessionData.session.access_token}`;
      }
    } else if (currentUser) {
      headers["X-Farm-Session"] = currentUser.sessionToken;
    }
    return headers;
  }, [buyerUser, currentUser, supabase]);

  const fetchPost = useCallback(async () => {
    setLoading(true);
    try {
      const headers = await fetchAuthHeaders();
      const res = await fetch(`/api/erp/forum/posts/${id}`, { headers: { "Content-Type": "application/json", ...headers } });
      if (res.ok) {
        const data = await res.json();
        setPost(data.post);
        setTrendingPosts(data.trendingPosts || []);
        setLiked(data.liked);
        setLikeCount(data.likeCount);
        setBookmarked(data.bookmarked);
        setCommunityStats(data.communityStats || { totalPosts: 0, userLikes: 0, userSaved: 0 });
        setUserId(data.userId);
        setUserType(data.userType);
      } else {
        router.push("/erp/forum");
      }
    } catch (error) {
      console.error("Failed to load forum post", error);
      router.push("/erp/forum");
    } finally {
      setLoading(false);
    }
  }, [fetchAuthHeaders, id, router]);

  const fetchComments = async (pageNum = 1, isLoadMore = false) => {
    if (isLoadMore) setLoadingMoreComments(true);
    try {
      const headers = await fetchAuthHeaders();
      const params = new URLSearchParams();
      params.set("page", pageNum.toString());
      params.set("limit", "10");
      params.set("sort", commentSort);
      if (commentFilter !== "all") params.set("author_type", commentFilter);
      const res = await fetch(`/api/erp/forum/posts/${id}/comments?${params}`, { headers });
      if (res.ok) {
        const data = await res.json();
        if (isLoadMore) {
          setComments(prev => [...prev, ...(data.comments || [])]);
        } else {
          setComments(data.comments || []);
        }
        setTotalComments(data.total ?? 0);
        setAllCommentsTotal(data.allCommentsTotal ?? data.total ?? 0);
        setCommentsHasMore(data.hasMore ?? false);
      }
    } catch (error) {
      console.error("Failed to load forum comments", error);
      if (!isLoadMore) {
        setComments([]);
        setCommentsHasMore(false);
      }
    } finally {
      if (isLoadMore) setLoadingMoreComments(false);
    }
  };

  const loadMoreComments = () => {
    if (loadingMoreComments || !commentsHasMore) return;
    const nextPage = commentPage + 1;
    setCommentPage(nextPage);
    fetchComments(nextPage, true);
  };

  useEffect(() => { setCommentPage(1); fetchComments(1); }, [id, commentFilter, commentSort]);

  useEffect(() => { fetchPost(); }, [fetchPost]);

  const handleLike = async () => {
    const headers = await fetchAuthHeaders();
    const res = await fetch(`/api/erp/forum/posts/${id}/like`, { method: "POST", headers });
    if (res.ok) {
      const data = await res.json();
      setLiked(data.liked);
      setLikeCount(c => data.liked ? c + 1 : c - 1);
    }
  };

  const handleBookmark = async () => {
    const headers = await fetchAuthHeaders();
    const res = await fetch(`/api/erp/forum/posts/${id}/bookmark`, { method: "POST", headers });
    if (res.ok) {
      const data = await res.json();
      setBookmarked(data.bookmarked);
      toast({ title: data.bookmarked ? "Post saved" : "Post removed from saved" });
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this post? This action cannot be undone.")) return;
    setDeleting(true);
    const headers = await fetchAuthHeaders();
    const res = await fetch(`/api/erp/forum/posts/${id}`, { method: "DELETE", headers });
    if (res.ok) {
      toast({ title: "Post deleted" });
      router.push("/erp/forum");
    } else {
      const err = await res.json();
      toast({ title: "Error", description: err.error, variant: "destructive" });
      setDeleting(false);
    }
  };

  const handlePin = async () => {
    const headers = await fetchAuthHeaders();
    const res = await fetch(`/api/erp/forum/posts/${id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ isPinned: !post.is_pinned }),
    });
    if (res.ok) fetchPost();
  };

  const handleLock = async () => {
    const headers = await fetchAuthHeaders();
    const res = await fetch(`/api/erp/forum/posts/${id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ isLocked: !post.is_locked }),
    });
    if (res.ok) fetchPost();
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser && !buyerUser) return;
    if (!editPostTitle.trim() || !editPostContent.trim()) return;
    setSavingPost(true);
    const headers = await fetchAuthHeaders();
    const res = await fetch(`/api/erp/forum/posts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify({ title: editPostTitle.trim(), content: editPostContent.trim() }),
    });
    if (res.ok) {
      const data = await res.json();
      setPost(data.post);
      setIsEditingPost(false);
      toast({ title: "Post updated" });
    } else {
      const err = await res.json();
      toast({ title: "Error", description: err.error, variant: "destructive" });
    }
    setSavingPost(false);
  };

  const submitComment = async (content: string, parentId?: string | null) => {
    if (!content.trim() || post.is_locked) return false;
    setSubmitting(true);
    try {
      const headers = await fetchAuthHeaders();
      const res = await fetch(`/api/erp/forum/posts/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({ content, parentId: parentId ?? null }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok) {
        setComments(c => [data.comment, ...c]);
        setTotalComments(count => count + 1);
        toast({ title: "Reply posted" });
        return true;
      }

      toast({ title: "Error", description: data?.error ?? "Could not post reply", variant: "destructive" });
    } catch {
      toast({ title: "Error", description: "Could not post reply", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
    return false;
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await submitComment(commentText);
    if (ok) setCommentText("");
  };

  const handleReply = (comment: any) => {
    setReplyingToId(comment.id);
    setReplyText("");
    setEditingCommentId(null);
  };

  const handleSubmitReply = async (parentId: string) => {
    setSubmittingReplyId(parentId);
    const ok = await submitComment(replyText, parentId);
    if (ok) {
      setReplyText("");
      setReplyingToId(null);
    }
    setSubmittingReplyId(null);
  };

  const handleEditComment = (comment: any) => {
    setEditingCommentId(comment.id);
    setEditText(comment.content);
  };

  const handleSaveEdit = async (commentId: string, content: string) => {
    const headers = await fetchAuthHeaders();
    const res = await fetch(`/api/erp/forum/posts/${id}/comments/${commentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify({ content }),
    });
    if (res.ok) {
      const data = await res.json();
      setComments(c => c.map(cm => cm.id === commentId ? data.comment : cm));
      setEditingCommentId(null);
      toast({ title: "Reply updated" });
    } else {
      const err = await res.json();
      toast({ title: "Error", description: err.error, variant: "destructive" });
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Delete this reply?")) return;
    const headers = await fetchAuthHeaders();
    const res = await fetch(`/api/erp/forum/posts/${id}/comments/${commentId}`, {
      method: "DELETE",
      headers,
    });
    if (res.ok) {
      setCommentPage(1);
      await fetchComments(1);
      toast({ title: "Reply deleted" });
    }
  };

  const commentsTree = (() => {
    const byParent = new Map<string | null, any[]>();
    comments.forEach(comment => {
      const parentId = comment.parent_id ?? null;
      byParent.set(parentId, [...(byParent.get(parentId) ?? []), { ...comment, children: [] }]);
    });
    const attach = (items: any[]): any[] => items.map(item => ({
      ...item,
      children: attach(byParent.get(item.id) ?? []),
    }));
    return attach(byParent.get(null) ?? []);
  })();

  const isOwner = post?.author_id === userId;
  const isAdmin = currentUser?.role === "Admin";

  const SuggestedSidebar = () => {
    if (trendingPosts.length === 0) return null;
    return (
      <div className="space-y-4">
        <Card className="border-sw-green-200 bg-gradient-to-b from-sw-green-50/80 to-white shadow-sm">
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm text-sw-green-900 flex items-center gap-2 mb-3">
              <Flame className="w-4 h-4 text-orange-500" /> Suggested Discussions
            </h3>
            <div className="flex flex-col divide-y divide-sw-green-100/50">
              {trendingPosts.map(tp => {
                const likes = tp.like_count?.[0]?.count ?? 0;
                const comments = tp.comment_count?.[0]?.count ?? 0;
                return (
                  <Link key={tp.id} href={`/erp/forum/post/${tp.id}`} className="block group">
                    <div className="py-3 hover:bg-sw-green-50 transition-colors -mx-4 px-4">
                      <h4 className="text-sm font-medium text-sw-green-950 group-hover:text-sw-green-700 line-clamp-2 leading-snug">{tp.title}</h4>
                      <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
                        <span className="font-medium text-sw-green-700">{tp.author?.full_name ?? "Unknown"}</span>
                        <span className="flex items-center gap-0.5"><Heart className="w-2.5 h-2.5" /> {likes}</span>
                        <span className="flex items-center gap-0.5"><MessageCircle className="w-2.5 h-2.5" /> {comments}</span>
                      </div>
                      {tp.category && (<Badge variant="outline" className="text-[9px] mt-1.5 border-sw-green-200 text-sw-green-600 bg-sw-green-50/50">{tp.category.name}</Badge>)}
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-sw-green-200 shadow-sm">
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm text-sw-green-900 mb-3">Community Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between"><span className="text-muted-foreground flex items-center gap-1.5"><MessageCircle className="w-3.5 h-3.5" /> Total Discussions</span><span className="font-semibold text-sw-green-800">{communityStats.totalPosts}</span></div>
              <div className="flex items-center justify-between"><span className="text-muted-foreground flex items-center gap-1.5"><Heart className="w-3.5 h-3.5" /> Your Likes</span><span className="font-semibold text-sw-green-800">{communityStats.userLikes}</span></div>
              <div className="flex items-center justify-between"><span className="text-muted-foreground flex items-center gap-1.5"><Bookmark className="w-3.5 h-3.5" /> Saved Posts</span><span className="font-semibold text-sw-green-800">{communityStats.userSaved}</span></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="flex gap-6">
          <div className="flex-1 h-64 bg-muted animate-pulse rounded-xl" />
          <div className="hidden lg:block w-72 xl:w-80 h-64 bg-muted animate-pulse rounded-xl flex-shrink-0" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Back */}
      <Button variant="ghost" onClick={() => router.push("/erp/forum")} className="gap-2 text-muted-foreground hover:text-sw-green-700">
        <ArrowLeft className="w-4 h-4" /> Back to Forum
      </Button>

      <div className="flex gap-6 items-start">
        {/* Main Post & Comments Column */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Post */}
      <Card className="border-l-4 border-l-sw-green-500 shadow-sm">
        <CardContent className="p-6 space-y-4">
          {/* Header row */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                {post?.is_pinned && (
                  <span className="text-xs bg-sw-green-100 text-sw-green-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                    <Pin className="w-3 h-3" /> Pinned
                  </span>
                )}
                {post?.is_locked && (
                  <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Locked
                  </span>
                )}
                {post?.category && (
                  <Badge variant="outline" className="text-xs border-sw-green-300 text-sw-green-700 bg-sw-green-50 font-medium">
                    {post.category.name}
                  </Badge>
                )}
              </div>

              {isEditingPost ? (
                <div className="mb-4">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Title</label>
                  <Input value={editPostTitle} onChange={e => setEditPostTitle(e.target.value)} className="font-bold text-lg h-auto py-2 focus:ring-sw-green-500" />
                </div>
              ) : (
                <h1 className="text-2xl font-bold text-sw-green-950 leading-tight">{post?.title}</h1>
              )}
              <div className="flex items-center gap-3 mt-3">
                <div className="w-9 h-9 rounded-full bg-sw-green-100 flex items-center justify-center text-sm font-bold text-sw-green-700 shadow-sm">
                  {post?.author?.full_name?.[0]?.toUpperCase() ?? "?"}
                </div>
                <div>
                  <div className="font-medium text-sm text-sw-green-900">{post?.author?.full_name ?? "Unknown"}</div>
                  {post?.author_type && (() => {
                    const badge = AUTHOR_TYPE_LABELS[post.author_type] || AUTHOR_TYPE_LABELS.farm_user;
                    const Icon = badge.icon;
                    return (
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${badge.color}`}>
                        <Icon className="w-2.5 h-2.5" /> {badge.label}
                      </span>
                    );
                  })()}
                </div>
                <span className="text-xs text-muted-foreground ml-1">{timeAgo(post?.created_at)}</span>
                <span className="text-xs text-muted-foreground">{post?.view_count ?? 0} views</span>
              </div>
            </div>

            {/* Admin actions */}
            {isAdmin && (
              <div className="flex flex-col gap-1 min-w-fit bg-muted rounded-lg p-1">
                <Button size="sm" variant="ghost" onClick={handlePin} className="justify-start gap-2 text-xs h-7">
                  <Pin className="w-3 h-3" /> {post?.is_pinned ? "Unpin" : "Pin"}
                </Button>
                <Button size="sm" variant="ghost" onClick={handleLock} className="justify-start gap-2 text-xs h-7">
                  <Lock className="w-3 h-3" /> {post?.is_locked ? "Unlock" : "Lock"}
                </Button>
              </div>
            )}
          </div>

          {isEditingPost ? (
            <div className="bg-muted/30 rounded-lg p-4 border border-sw-green-200">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Content</label>
              <Textarea 
                value={editPostContent} 
                onChange={e => setEditPostContent(e.target.value)} 
                rows={6} 
                className="resize-y focus:ring-sw-green-500 min-h-[150px]" 
              />
              <div className="flex justify-end gap-2 mt-3">
                <Button size="sm" variant="outline" onClick={() => setIsEditingPost(false)} disabled={savingPost}>Cancel</Button>
                <Button size="sm" onClick={handleSavePost} disabled={savingPost || !editPostTitle.trim() || !editPostContent.trim()} className="bg-sw-green-700 hover:bg-sw-green-800">
                  {savingPost ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap leading-relaxed bg-muted/50 rounded-lg p-4 border">
              {post?.content}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2 border-t">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-all ${liked ? "text-red-500 bg-red-50 hover:bg-red-100" : "text-muted-foreground hover:text-red-500 hover:bg-red-50"}`}
            >
              <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
              <span className="font-medium">{likeCount}</span>
              <span className="text-xs">{likeCount === 1 ? "Like" : "Likes"}</span>
            </button>
            <button
              onClick={handleBookmark}
              className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-all ${bookmarked ? "text-sw-green-600 bg-sw-green-50 hover:bg-sw-green-100" : "text-muted-foreground hover:text-sw-green-600 hover:bg-sw-green-50"}`}
            >
              <Bookmark className={`w-4 h-4 ${bookmarked ? "fill-current" : ""}`} />
              <span className="text-xs">{bookmarked ? "Saved" : "Save"}</span>
            </button>

            {(isOwner || isAdmin) && (
              <div className="flex items-center gap-1 ml-auto">
                <Button size="sm" variant="outline" onClick={() => {
                  setEditPostTitle(post?.title || "");
                  setEditPostContent(post?.content || "");
                  setIsEditingPost(true);
                }} className="gap-1.5 text-xs h-8 border-sw-green-200 text-sw-green-700 hover:bg-sw-green-50">
                  <Edit className="w-3 h-3" /> Edit
                </Button>
                <Button size="sm" variant="outline" onClick={handleDelete} disabled={deleting} className="gap-1.5 text-xs h-8 border-destructive/30 text-destructive hover:bg-destructive/5">
                  <Trash2 className="w-3 h-3" /> {deleting ? "..." : "Delete"}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Comments */}
      <Card className="shadow-sm">
        <CardContent className="p-6 space-y-4">
          <h2 className="font-semibold text-sw-green-900 flex items-center gap-2 text-base border-b pb-2">
            <MessageCircle className="w-4 h-4" />
            {totalComments} {totalComments === 1 ? "Reply" : "Replies"}
            {commentFilter !== "all" && (
              <span className="text-xs font-normal text-muted-foreground">of {allCommentsTotal}</span>
            )}
          </h2>

          <div className="flex flex-col gap-3 rounded-xl border border-sw-green-100 bg-sw-green-50/50 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Show:</span>
              {([
                { key: "all" as CommentAuthorFilter, label: "All", icon: MessageCircle },
                { key: "farm_user" as CommentAuthorFilter, label: "Farm Staff", icon: Factory },
                { key: "buyer" as CommentAuthorFilter, label: "Buyers", icon: User },
              ]).map(option => (
                <Button
                  key={option.key}
                  type="button"
                  size="sm"
                  variant={commentFilter === option.key ? "default" : "outline"}
                  onClick={() => setCommentFilter(option.key)}
                  className="h-8 gap-1.5 text-xs"
                >
                  <option.icon className="h-3.5 w-3.5" /> {option.label}
                </Button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Sort:</span>
              <Button type="button" size="sm" variant={commentSort === "newest" ? "default" : "outline"} onClick={() => setCommentSort("newest")} className="h-8 gap-1.5 text-xs">
                <Clock className="h-3.5 w-3.5" /> Newest
              </Button>
              <Button type="button" size="sm" variant={commentSort === "oldest" ? "default" : "outline"} onClick={() => setCommentSort("oldest")} className="h-8 gap-1.5 text-xs">
                <Clock className="h-3.5 w-3.5" /> Oldest
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {commentsTree.map(comment => (
              <CommentItem
                key={comment.id}
                comment={comment}
                replies={comment.children || []}
                userId={userId}
                userType={userType}
                onEdit={handleEditComment}
                onDelete={handleDeleteComment}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={() => setEditingCommentId(null)}
                editingId={editingCommentId}
                editText={editText}
                setEditText={setEditText}
                onReply={handleReply}
                replyingToId={replyingToId}
                replyText={replyText}
                setReplyText={setReplyText}
                onCancelReply={() => { setReplyingToId(null); setReplyText(""); }}
                onSubmitReply={handleSubmitReply}
                submittingReplyId={submittingReplyId}
                isLocked={!!post?.is_locked}
              />
            ))}
            {comments.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                {commentFilter === "all" ? "No replies yet. Be the first to respond!" : "No replies match this filter yet."}
              </p>
            )}
            {commentsHasMore && comments.length > 0 && (
              <div className="flex flex-col items-center gap-2 pt-2">
                <p className="text-xs text-muted-foreground">Showing {comments.length} of {totalComments} replies</p>
                <Button variant="outline" onClick={loadMoreComments} disabled={loadingMoreComments} className="gap-2 text-sm text-sw-green-700 border-sw-green-300 hover:bg-sw-green-50">
                  {loadingMoreComments ? <Clock className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
                  {loadingMoreComments ? "Loading..." : "Load More Replies"}
                </Button>
              </div>
            )}
          </div>

          {/* Reply form */}
          {!post?.is_locked ? (
            <form onSubmit={handleComment} className="space-y-3 pt-2 border-t">
              <Textarea
                placeholder="Write your reply..."
                rows={4}
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                className="resize-none focus:ring-sw-green-500"
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={submitting || !commentText.trim()} className="gap-2 bg-sw-green-700 hover:bg-sw-green-800">
                  <Send className="w-4 h-4" /> {submitting ? "Posting..." : "Post Reply"}
                </Button>
              </div>
            </form>
          ) : (
            <div className="text-center py-6 bg-destructive/5 rounded-xl border border-destructive/10">
              <Lock className="w-5 h-5 mx-auto mb-2 text-destructive" />
              <p className="text-sm text-destructive font-medium">This post is locked</p>
              <p className="text-xs text-muted-foreground mt-0.5">No new replies are allowed</p>
            </div>
          )}
        </CardContent>
      </Card>
        </div>

        {/* Sidebar - Suggested Discussions */}
        <div className="hidden lg:block w-72 xl:w-80 flex-shrink-0 sticky top-4">
          <SuggestedSidebar />
        </div>
      </div>

      {/* Mobile: Suggested below */}
      <div className="lg:hidden">
        <SuggestedSidebar />
      </div>
    </div>
  );
}
