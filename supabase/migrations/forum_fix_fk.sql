-- Fix FK constraints that block buyers from commenting
-- Run this in Supabase SQL Editor

-- Drop FK constraints on author_id (both tables reference farm_users which doesn't have buyer IDs)
ALTER TABLE forum_comments DROP CONSTRAINT IF EXISTS forum_comments_author_id_fkey;
ALTER TABLE forum_posts DROP CONSTRAINT IF EXISTS forum_posts_author_id_fkey;

-- Make author_id nullable (optional, for buyers who don't have farm_users entry)
ALTER TABLE forum_comments ALTER COLUMN author_id DROP NOT NULL;
ALTER TABLE forum_posts ALTER COLUMN author_id DROP NOT NULL;

-- Ensure seed data is inserted (if not already)
DO $$
DECLARE
  fu1 uuid;
  fu2 uuid;
  fu3 uuid;
  fu4 uuid;
  cat_general uuid;
  cat_health uuid;
  cat_feed uuid;
  cat_marketplace uuid;
  p1_id uuid;
  p2_id uuid;
  p3_id uuid;
  p4_id uuid;
  p5_id uuid;
  p6_id uuid;
  p7_id uuid;
BEGIN
  -- Only seed if no posts exist
  IF EXISTS (SELECT 1 FROM forum_posts LIMIT 1) THEN
    RAISE NOTICE 'Posts already exist, skipping post seed.';
    RETURN;
  END IF;

  -- Get farm user ids
  SELECT id INTO fu1 FROM farm_users LIMIT 1 OFFSET 0;
  SELECT id INTO fu2 FROM farm_users LIMIT 1 OFFSET 1;
  SELECT id INTO fu3 FROM farm_users LIMIT 1 OFFSET 2;
  SELECT id INTO fu4 FROM farm_users LIMIT 1 OFFSET 3;

  -- Get category ids
  SELECT id INTO cat_general FROM forum_categories WHERE slug = 'general' LIMIT 1;
  SELECT id INTO cat_health FROM forum_categories WHERE slug = 'health-vet-tips' LIMIT 1;
  SELECT id INTO cat_feed FROM forum_categories WHERE slug = 'feed-nutrition' LIMIT 1;
  SELECT id INTO cat_marketplace FROM forum_categories WHERE slug = 'marketplace-talk' LIMIT 1;

  -- Seed posts
  INSERT INTO forum_posts (farm_id, author_id, author_type, category_id, title, content, is_pinned, view_count, created_at)
  VALUES (NULL, fu1, 'farm_user', cat_general,
    'Welcome to the Saarway Community Forum!',
    'Hello everyone! We are excited to launch our community forum where farmers and buyers can connect, share experiences, and learn from each other.',
    true, 127, now() - interval '7 days')
  RETURNING id INTO p1_id;

  INSERT INTO forum_posts (farm_id, author_id, author_type, category_id, title, content, view_count, created_at)
  VALUES (NULL, fu2, 'farm_user', cat_marketplace,
    'Best practices for selling cattle at marketplace?',
    'I have been selling cattle at the local mandi for years. What tips would you give for online trading?',
    89, now() - interval '5 days')
  RETURNING id INTO p2_id;

  INSERT INTO forum_posts (farm_id, author_id, author_type, category_id, title, content, view_count, created_at)
  VALUES (NULL, fu3, 'farm_user', cat_health,
    'FMD outbreak in our region - need advice',
    'We have noticed several cases of FMD in nearby farms. What preventive measures work best?',
    203, now() - interval '4 days')
  RETURNING id INTO p3_id;

  INSERT INTO forum_posts (farm_id, author_id, author_type, category_id, title, content, view_count, created_at)
  VALUES (NULL, fu4, 'farm_user', cat_feed,
    'What is the ideal feed ratio for growing buffalo calves?',
    'My calves are 6 months old. What should be the ratio of green fodder to dry fodder and concentrates?',
    156, now() - interval '3 days')
  RETURNING id INTO p4_id;

  INSERT INTO forum_posts (farm_id, author_id, author_type, category_id, title, content, view_count, created_at)
  VALUES (NULL, fu1, 'farm_user', cat_general,
    'How to improve milk yield during summer months?',
    'Every summer, our milk yield drops by 15-20%. What additional measures can we take?',
    178, now() - interval '2 days')
  RETURNING id INTO p5_id;

  INSERT INTO forum_posts (farm_id, author_id, author_type, category_id, title, content, view_count, created_at)
  VALUES (NULL, fu2, 'farm_user', cat_marketplace,
    'Is it worth registering as a verified buyer on Saarway?',
    'Does being verified actually help get better prices or faster responses?',
    94, now() - interval '1 day')
  RETURNING id INTO p6_id;

  INSERT INTO forum_posts (farm_id, author_id, author_type, category_id, title, content, view_count, created_at)
  VALUES (NULL, fu3, 'farm_user', cat_health,
    'Signs of mastitis in early stage - how to detect?',
    'I want to learn the early signs so we can catch mastitis before it becomes severe.',
    212, now() - interval '12 hours')
  RETURNING id INTO p7_id;

  -- Seed comments only if none exist
  IF NOT EXISTS (SELECT 1 FROM forum_comments LIMIT 1) THEN
    INSERT INTO forum_comments (post_id, author_id, author_type, content, created_at)
    VALUES
      (p1_id, fu2, 'farm_user', 'Great to see this platform finally! Very helpful for livestock discussions.', now() - interval '6 days'),
      (p1_id, fu3, 'farm_user', 'Thank you for starting this! Really helpful for new farmers.', now() - interval '6 days' + interval '2 hours'),
      (p3_id, fu4, 'farm_user', 'For FMD, we use regular vaccination every 6 months plus biosecurity measures.', now() - interval '3 days'),
      (p3_id, fu1, 'farm_user', 'The vaccination schedule should include FMD, BQ, and HS vaccines.', now() - interval '3 days' + interval '1 hour'),
      (p5_id, fu2, 'farm_user', 'For summer cooling, try using fans with evaporative cooling pads.', now() - interval '1 day'),
      (p5_id, fu4, 'farm_user', 'Provide fresh cool water at all times and add electrolytes to drinking water.', now() - interval '1 day' + interval '30 minutes'),
      (p7_id, fu1, 'farm_user', 'For mastitis detection, check for swelling, redness, and abnormal milk texture.', now() - interval '10 hours'),
      (p7_id, fu3, 'farm_user', 'Early treatment: Intramammary antibiotics plus frequent milking to drain infection.', now() - interval '8 hours');
  END IF;

  RAISE NOTICE 'Forum data seeded successfully!';
END $$;