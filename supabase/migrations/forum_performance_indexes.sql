-- Forum load-time indexes for listing, detail, reactions, and threaded replies.

CREATE INDEX IF NOT EXISTS idx_forum_posts_pinned_created
  ON forum_posts(is_pinned DESC, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_forum_posts_views_created
  ON forum_posts(view_count DESC, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_forum_posts_author_created
  ON forum_posts(author_type, author_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_forum_comments_post_root_created
  ON forum_comments(post_id, created_at DESC)
  WHERE parent_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_forum_comments_post_parent_created
  ON forum_comments(post_id, parent_id, created_at);

CREATE INDEX IF NOT EXISTS idx_forum_likes_user_post
  ON forum_post_likes(user_id, user_type, post_id);

CREATE INDEX IF NOT EXISTS idx_forum_bookmarks_user_post
  ON forum_bookmarks(user_id, user_type, post_id);

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_forum_posts_title_trgm
  ON forum_posts USING gin (title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_forum_posts_content_trgm
  ON forum_posts USING gin (content gin_trgm_ops);
