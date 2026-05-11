-- ============================================================================
-- Migration: Community Forum
-- Run this in Supabase SQL Editor
-- ============================================================================

-- ── 1. Forum Categories ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS forum_categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id     uuid,
  name        text NOT NULL,
  slug        text NOT NULL,
  description text,
  icon        text DEFAULT 'MessageCircle',
  sort_order  int DEFAULT 0,
  is_active   boolean DEFAULT true,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='forum_categories' AND policyname='Service role bypass categories') THEN
    CREATE POLICY "Service role bypass categories" ON forum_categories FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_forum_categories_farm_id ON forum_categories(farm_id);
CREATE INDEX IF NOT EXISTS idx_forum_categories_slug   ON forum_categories(slug);

-- ── 2. Forum Posts ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS forum_posts (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id      uuid,
  author_id    uuid NOT NULL,
  author_type  text DEFAULT 'farm_user' CHECK (author_type IN ('farm_user', 'buyer')),
  category_id  uuid REFERENCES forum_categories(id),
  title        text NOT NULL,
  content      text NOT NULL,
  is_pinned    boolean DEFAULT false,
  is_locked    boolean DEFAULT false,
  view_count   int DEFAULT 0,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='forum_posts' AND policyname='Service role bypass posts') THEN
    CREATE POLICY "Service role bypass posts" ON forum_posts FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_forum_posts_farm_id    ON forum_posts(farm_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_author_id ON forum_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_category  ON forum_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_created  ON forum_posts(created_at DESC);

-- ── 3. Forum Comments ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS forum_comments (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    uuid REFERENCES forum_posts(id) ON DELETE CASCADE NOT NULL,
  author_id  uuid NOT NULL,
  author_type text DEFAULT 'farm_user' CHECK (author_type IN ('farm_user', 'buyer')),
  parent_id  uuid REFERENCES forum_comments(id) ON DELETE CASCADE,
  content    text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE forum_comments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='forum_comments' AND policyname='Service role bypass comments') THEN
    CREATE POLICY "Service role bypass comments" ON forum_comments FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_forum_comments_post   ON forum_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_comments_parent ON forum_comments(parent_id);

-- ── 4. Forum Likes ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS forum_post_likes (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    uuid REFERENCES forum_posts(id) ON DELETE CASCADE NOT NULL,
  user_id    uuid NOT NULL,
  user_type  text DEFAULT 'farm_user' CHECK (user_type IN ('farm_user', 'buyer')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id, user_type)
);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='forum_post_likes' AND policyname='Service role bypass likes') THEN
    CREATE POLICY "Service role bypass likes" ON forum_post_likes FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_forum_likes_post ON forum_post_likes(post_id);

-- ── 5. Forum Bookmarks ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS forum_bookmarks (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    uuid REFERENCES forum_posts(id) ON DELETE CASCADE NOT NULL,
  user_id    uuid NOT NULL,
  user_type  text DEFAULT 'farm_user' CHECK (user_type IN ('farm_user', 'buyer')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id, user_type)
);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='forum_bookmarks' AND policyname='Service role bypass bookmarks') THEN
    CREATE POLICY "Service role bypass bookmarks" ON forum_bookmarks FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_forum_bookmarks_user ON forum_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_bookmarks_post ON forum_bookmarks(post_id);

-- ── 7. RPC: Increment View Count ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION increment_view_count(post_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE forum_posts SET view_count = view_count + 1 WHERE id = post_id;
END;
$$;

-- ── 8. Seed Default Categories ────────────────────────────────────────────────

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM forum_categories) THEN
    INSERT INTO forum_categories (name, slug, description, icon, sort_order) VALUES
      ('General', 'general', 'General discussion about farm life, updates, and announcements', 'MessageCircle', 1),
      ('Health & Vet Tips', 'health-vet-tips', 'Share and learn about livestock health, vaccination, and vet advice', 'Stethoscope', 2),
      ('Feed & Nutrition', 'feed-nutrition', 'Discuss feed types, nutrition plans, and feeding schedules', 'UtensilsCrossed', 3),
      ('Marketplace Talk', 'marketplace-talk', 'Talk about pricing, buyers, sales, and marketplace experiences', 'ShoppingBag', 4);
  END IF;
END $$;

-- ── 9. Seed Dummy Forum Posts & Comments ───────────────────────────────────────

DO $$ DECLARE
  -- Get existing farm users and buyers
  buyer_ids uuid[];
  farm_user_ids uuid[];
BEGIN
  -- Collect buyer user IDs from auth.users (non-super-admin)
  SELECT array_agg(id) INTO buyer_ids
  FROM auth.users
  WHERE (app_metadata IS NULL OR app_metadata->>'role' IS NULL OR app_metadata->>'role' != 'super_admin')
  LIMIT 4;

  -- Collect farm user IDs
  SELECT array_agg(id) INTO farm_user_ids
  FROM farm_users
  LIMIT 4;

  -- Seed posts only if none exist
  IF NOT EXISTS (SELECT 1 FROM forum_posts LIMIT 1) THEN
    -- Get first category IDs
    WITH cat_ids AS (
      SELECT id FROM forum_categories LIMIT 4
    )
    INSERT INTO forum_posts (farm_id, author_id, author_type, category_id, title, content, is_pinned, view_count, created_at)
    SELECT
      NULL,
      COALESCE(farm_user_ids[1], buyer_ids[1]),
      CASE WHEN array_length(farm_user_ids, 1) >= 1 THEN 'farm_user' ELSE 'buyer' END,
      (SELECT id FROM forum_categories WHERE slug = 'general' LIMIT 1),
      'Welcome to the Saarway Community Forum!',
      'Hello everyone! We are excited to launch our community forum where farmers and buyers can connect, share experiences, and learn from each other. Feel free to post questions, share tips, and engage with the community.',
      true,
      127,
      now() - interval '7 days'
    WHERE EXISTS (SELECT 1 FROM forum_categories LIMIT 1);

    INSERT INTO forum_posts (farm_id, author_id, author_type, category_id, title, content, view_count, created_at)
    SELECT
      NULL,
      COALESCE(buyer_ids[1], farm_user_ids[1]),
      'buyer',
      (SELECT id FROM forum_categories WHERE slug = 'marketplace-talk' LIMIT 1),
      'Best practices for selling cattle at marketplace?',
      'I have been selling cattle at the local mandi for years, but I am thinking of moving to online platforms like Saarway. What tips would you give to someone new to online livestock trading? How do you handle buyer trust issues and price negotiations? Any advice would be appreciated!',
      89,
      now() - interval '5 days'
    WHERE EXISTS (SELECT 1 FROM forum_categories LIMIT 1);

    INSERT INTO forum_posts (farm_id, author_id, author_type, category_id, title, content, view_count, created_at)
    SELECT
      NULL,
      COALESCE(farm_user_ids[2], buyer_ids[2]),
      'farm_user',
      (SELECT id FROM forum_categories WHERE slug = 'health-vet-tips' LIMIT 1),
      'FMD outbreak in our region - need advice',
      'We have noticed several cases of Foot and Mouth Disease in nearby farms. We have already started isolating affected animals, but I would like to know what preventive measures others have used successfully. Also, what vaccinations are recommended for different age groups?',
      203,
      now() - interval '4 days'
    WHERE EXISTS (SELECT 1 FROM forum_categories LIMIT 1);

    INSERT INTO forum_posts (farm_id, author_id, author_type, category_id, title, content, view_count, created_at)
    SELECT
      NULL,
      COALESCE(buyer_ids[2], farm_user_ids[1]),
      'buyer',
      (SELECT id FROM forum_categories WHERE slug = 'feed-nutrition' LIMIT 1),
      'What is the ideal feed ratio for growing buffalo calves?',
      'I recently started buffalo farming and I am confused about feed combinations. My calves are 6 months old. What should be the ratio of green fodder to dry fodder and concentrates? Also, are there any supplements you recommend for healthy growth?',
      156,
      now() - interval '3 days'
    WHERE EXISTS (SELECT 1 FROM forum_categories LIMIT 1);

    INSERT INTO forum_posts (farm_id, author_id, author_type, category_id, title, content, view_count, created_at)
    SELECT
      NULL,
      COALESCE(farm_user_ids[3], buyer_ids[3]),
      'farm_user',
      (SELECT id FROM forum_categories WHERE slug = 'general' LIMIT 1),
      'How to improve milk yield during summer months?',
      'Every summer, our milk yield drops by 15-20%. We have shade and water sprinklers, but it is still happening. What additional measures can we take to keep our cows comfortable and maintain milk production? Any cooling systems that have worked for you?',
      178,
      now() - interval '2 days'
    WHERE EXISTS (SELECT 1 FROM forum_categories LIMIT 1);

    INSERT INTO forum_posts (farm_id, author_id, author_type, category_id, title, content, view_count, created_at)
    SELECT
      NULL,
      COALESCE(buyer_ids[3], farm_user_ids[2]),
      'buyer',
      (SELECT id FROM forum_categories WHERE slug = 'marketplace-talk' LIMIT 1),
      'Is it worth registering as a verified buyer on Saarway?',
      'I see there are verification levels for buyers. Does being verified actually help get better prices or faster responses from sellers? What has been your experience as a verified buyer?',
      94,
      now() - interval '1 day'
    WHERE EXISTS (SELECT 1 FROM forum_categories LIMIT 1);

    INSERT INTO forum_posts (farm_id, author_id, author_type, category_id, title, content, view_count, created_at)
    SELECT
      NULL,
      COALESCE(farm_user_ids[4], buyer_ids[4]),
      'farm_user',
      (SELECT id FROM forum_categories WHERE slug = 'health-vet-tips' LIMIT 1),
      'Signs of mastitis in early stage - how to detect?',
      'Mastitis is every dairy farmers nightmare. I want to learn the early signs so we can catch it before it becomes severe. What visual and physical indicators should we check daily? Also, what is the best immediate treatment once detected?',
      212,
      now() - interval '12 hours'
    WHERE EXISTS (SELECT 1 FROM forum_categories LIMIT 1);
  END IF;

  -- Seed comments only if none exist
  IF NOT EXISTS (SELECT 1 FROM forum_comments LIMIT 1) THEN
    WITH post_ids AS (SELECT id FROM forum_posts LIMIT 5)
    INSERT INTO forum_comments (post_id, author_id, author_type, content, created_at)
    SELECT p.id, COALESCE(farm_user_ids[1], buyer_ids[1]), 'farm_user',
      'Great to see this platform finally! I have been looking for a proper forum to discuss livestock issues with other farmers.',
      now() - interval '6 days'
    FROM post_ids p WHERE NOT EXISTS (SELECT 1 FROM forum_comments);

    INSERT INTO forum_comments (post_id, author_id, author_type, content, created_at)
    SELECT p.id, COALESCE(buyer_ids[1], farm_user_ids[1]), 'buyer',
      'Thank you for starting this! Really helpful for people like me who are new to farming.',
      now() - interval '6 days' + interval '2 hours'
    FROM post_ids p WHERE NOT EXISTS (SELECT 1 FROM forum_comments WHERE author_id = buyer_ids[1]);

    INSERT INTO forum_comments (post_id, author_id, author_type, content, created_at)
    SELECT p.id, COALESCE(farm_user_ids[2], buyer_ids[2]), 'farm_user',
      'For FMD, we use regular vaccination every 6 months plus biosecurity measures at farm entry points.',
      now() - interval '3 days'
    FROM post_ids p WHERE NOT EXISTS (SELECT 1 FROM forum_comments WHERE content LIKE '%FMD%');

    INSERT INTO forum_comments (post_id, author_id, author_type, content, created_at)
    SELECT p.id, COALESCE(buyer_ids[2], farm_user_ids[2]), 'buyer',
      'The vaccination schedule should include FMD, BQ, and HS vaccines. Consult your local vet for the exact calendar.',
      now() - interval '3 days' + interval '1 hour'
    FROM post_ids p WHERE NOT EXISTS (SELECT 1 FROM forum_comments WHERE content LIKE '%vaccination%');

    INSERT INTO forum_comments (post_id, author_id, author_type, content, created_at)
    SELECT p.id, COALESCE(farm_user_ids[3], buyer_ids[1]), 'farm_user',
      'For summer, try using fans with evaporative cooling pads. We saw a 10% improvement in yield.',
      now() - interval '1 day'
    FROM post_ids p WHERE NOT EXISTS (SELECT 1 FROM forum_comments WHERE content LIKE '%summer%');

    INSERT INTO forum_comments (post_id, author_id, author_type, content, created_at)
    SELECT p.id, COALESCE(buyer_ids[3], farm_user_ids[3]), 'buyer',
      'Also important: provide fresh cool water at all times and consider adding electrolytes to drinking water.',
      now() - interval '1 day' + interval '30 minutes'
    FROM post_ids p WHERE NOT EXISTS (SELECT 1 FROM forum_comments WHERE content LIKE '%electrolyte%');

    INSERT INTO forum_comments (post_id, author_id, author_type, content, created_at)
    SELECT p.id, COALESCE(farm_user_ids[4], buyer_ids[4]), 'farm_user',
      'For mastitis detection, check for swelling, redness, and abnormal milk texture before every milking session.',
      now() - interval '10 hours'
    FROM post_ids p WHERE NOT EXISTS (SELECT 1 FROM forum_comments WHERE content LIKE '%mastitis%');
  END IF;
END $$;
