-- Polished community forum demo data.
-- Creates 18 deterministic posts. Each post gets 10-20 deterministic comments.

DO $$
DECLARE
  post_titles text[] := ARRAY[
    'Morning milk yield dropped after feed change',
    'Best low-cost shade setup for summer heat',
    'How are you pricing young Sahiwal calves this week',
    'Vaccination calendar for mixed cattle and buffalo herds',
    'Silage storage smell check before monsoon',
    'Mineral mix routine for repeat breeding cases',
    'Buyer inspection checklist before farm visit',
    'Managing new animals during the first quarantine week',
    'Green fodder shortage plan for small farms',
    'Calf starter feed results after thirty days',
    'When do you call the vet for mild bloating',
    'Reliable transport options for intercity livestock sales',
    'Daily cleaning routine for water troughs',
    'What records matter most for a small dairy unit',
    'Choosing between cottonseed cake and commercial concentrate',
    'Handling price negotiation without wasting farm time',
    'Early mastitis signs that staff can catch quickly',
    'What worked for reducing heat stress at night'
  ];
  post_bodies text[] := ARRAY[
    'We changed the concentrate mix last week and the morning yield moved down by almost two liters per cow. The animals look active, so I am comparing feed timing, water intake, and roughage quality before changing anything else.',
    'Our open shed needs a better shade solution before peak summer. I am comparing green net, bamboo matting, and a simple tin extension with insulation under it. Practical experiences would help.',
    'I am preparing two young Sahiwal calves for sale and want a realistic price range before listing them online. Weight, vaccination, and temperament are documented.',
    'Our herd has cattle and buffalo of different ages. I want a simple calendar that workers can follow without missing FMD, HS, BQ, and deworming windows.',
    'One silage corner has a sharper smell than usual after recent humidity. The top layer was sealed, but I want to know what checks others use before feeding it.',
    'We have two repeat breeding cases and are reviewing mineral mix, body condition, heat detection, and timing. Share what routine helped you before moving to expensive tests.',
    'Buyers often ask for the same details before visiting. I am building a checklist with age, weight, vaccination, milk yield, photos, and transport notes.',
    'A new animal can look healthy on arrival but still bring risk. I want to compare quarantine length, separate tools, observation notes, and first-week feed plans.',
    'Green fodder availability is tight in our area. We are balancing dry fodder, silage, and concentrate while trying to keep costs controlled.',
    'We started calf starter feed and want to compare weight gain, stool consistency, and intake changes after one month. What benchmarks do you track.',
    'Mild bloating can settle quickly, but I do not want staff waiting too long. What signs make you call the vet immediately.',
    'We need safer transport for a few intercity livestock deliveries. I am comparing truck hygiene, loading ramps, water stops, and driver handling.',
    'Water troughs look clean at a glance but collect slime fast in summer. What is your daily and weekly cleaning routine.',
    'Small farms can drown in paperwork. Which records actually helped you improve profit, health, breeding, or sales decisions.',
    'Cottonseed cake is cheaper locally, but commercial concentrate is more consistent. How do you decide the mix for lactating animals.',
    'Some negotiations take too much time and still go nowhere. I am looking for polite ways to qualify serious buyers and keep pricing transparent.',
    'I want workers to catch mastitis before it becomes expensive. What simple visual or milk checks do you ask them to perform every milking.',
    'Daytime cooling is easier to plan than night-time relief. What changes helped your animals recover better overnight during hot months.'
  ];
  post_categories text[] := ARRAY[
    'feed-nutrition',
    'general',
    'marketplace-talk',
    'health-vet-tips',
    'feed-nutrition',
    'health-vet-tips',
    'marketplace-talk',
    'health-vet-tips',
    'feed-nutrition',
    'feed-nutrition',
    'health-vet-tips',
    'marketplace-talk',
    'general',
    'general',
    'feed-nutrition',
    'marketplace-talk',
    'health-vet-tips',
    'general'
  ];
  comment_templates text[] := ARRAY[
    'We had a similar issue and first checked water access. Intake was lower than expected, so the feed was not the only reason.',
    'Please check whether the change was gradual. Sudden feed changes can show up in yield before you see obvious health signs.',
    'For us, a simple daily sheet helped. We track feed offered, leftover feed, water refill timing, and any loose dung.',
    'I would separate the animals with the biggest change and compare body temperature, rumen fill, and appetite for two days.',
    'A local vet told us to review mineral balance before increasing concentrate. That saved cost in our case.',
    'Make sure workers are giving the ration at the same time every day. Timing changes can confuse the reading.',
    'Photos and short videos help a lot when asking for advice. It makes body condition and shed setup easier to judge.',
    'We use a small checklist on the shed wall so the evening worker does not miss anything during busy days.',
    'If the animal is active and eating, I usually observe closely, but I do not delay calling the vet when swelling or fever appears.',
    'Good ventilation made a bigger difference than we expected. Heat and humidity can turn a small issue into a bigger one.',
    'Try comparing one group at a time. Changing feed, timing, and supplements together makes it hard to know what worked.',
    'In our area, prices move quickly, so recent verified listings are more useful than old mandi estimates.',
    'A written vaccination card builds trust with buyers and also helps staff stay disciplined.',
    'For transport, I always check the loading ramp and floor grip before confirming the vehicle.',
    'We clean troughs daily with a brush and do a stronger wash twice a week during hot weather.',
    'Keep an eye on salt and mineral access. Small deficiencies can look like many different management problems.',
    'For quarantine, separate water buckets and tools are worth the extra effort.',
    'The best results came when we trained one person to own the checklist instead of leaving it to everyone.',
    'Please update this thread after a week. These practical follow-ups are useful for other farms.',
    'This is exactly the kind of discussion that helps new farmers avoid expensive trial and error.'
  ];
  author_ids uuid[];
  author_types text[];
  post_id uuid;
  category_id uuid;
  author_index int;
  reply_count int;
  i int;
  j int;
BEGIN
  SELECT array_agg(id)
  INTO author_ids
  FROM (
    SELECT id
    FROM farm_users
    ORDER BY created_at
    LIMIT 8
  ) seed_users;

  IF author_ids IS NULL OR array_length(author_ids, 1) = 0 THEN
    RAISE NOTICE 'No farm users found, skipping forum dummy data.';
    RETURN;
  END IF;

  author_types := array_fill('farm_user'::text, ARRAY[array_length(author_ids, 1)]);

  INSERT INTO forum_categories (name, slug, description, icon, sort_order)
  SELECT name, slug, description, icon, sort_order
  FROM (VALUES
    ('General', 'general', 'General discussion about farm life, operations, and announcements', 'MessageCircle', 1),
    ('Health & Vet Tips', 'health-vet-tips', 'Livestock health, vaccination, treatment, and vet advice', 'Stethoscope', 2),
    ('Feed & Nutrition', 'feed-nutrition', 'Feed planning, fodder, minerals, and nutrition routines', 'UtensilsCrossed', 3),
    ('Marketplace Talk', 'marketplace-talk', 'Pricing, buyers, sales, and marketplace experiences', 'ShoppingBag', 4)
  ) AS seed(name, slug, description, icon, sort_order)
  WHERE NOT EXISTS (
    SELECT 1 FROM forum_categories existing WHERE existing.slug = seed.slug
  );

  FOR i IN 1..array_length(post_titles, 1) LOOP
    post_id := (md5('saarway-forum-demo-post-' || i))::uuid;
    author_index := ((i - 1) % array_length(author_ids, 1)) + 1;

    SELECT id INTO category_id
    FROM forum_categories
    WHERE slug = post_categories[i]
    LIMIT 1;

    INSERT INTO forum_posts (
      id,
      farm_id,
      author_id,
      author_type,
      category_id,
      title,
      content,
      is_pinned,
      view_count,
      created_at,
      updated_at
    )
    VALUES (
      post_id,
      NULL,
      author_ids[author_index],
      author_types[author_index],
      category_id,
      post_titles[i],
      post_bodies[i],
      i = 1,
      40 + (i * 17),
      now() - (i * interval '2 minutes'),
      now() - (i * interval '2 minutes')
    )
    ON CONFLICT (id) DO UPDATE SET
      category_id = EXCLUDED.category_id,
      title = EXCLUDED.title,
      content = EXCLUDED.content,
      view_count = GREATEST(forum_posts.view_count, EXCLUDED.view_count);

    reply_count := 10 + (i % 11);

    FOR j IN 1..reply_count LOOP
      author_index := ((i + j - 2) % array_length(author_ids, 1)) + 1;

      INSERT INTO forum_comments (
        id,
        post_id,
        author_id,
        author_type,
        content,
        parent_id,
        created_at,
        updated_at
      )
      VALUES (
        (md5('saarway-forum-demo-comment-' || i || '-' || j))::uuid,
        post_id,
        author_ids[author_index],
        author_types[author_index],
        comment_templates[((j - 1) % array_length(comment_templates, 1)) + 1],
        NULL,
        now() - (i * interval '2 minutes') + (j * interval '5 seconds'),
        now() - (i * interval '2 minutes') + (j * interval '5 seconds')
      )
      ON CONFLICT (id) DO UPDATE SET
        content = EXCLUDED.content,
        author_id = EXCLUDED.author_id,
        author_type = EXCLUDED.author_type;
    END LOOP;

    FOR j IN 1..LEAST(5, array_length(author_ids, 1)) LOOP
      author_index := ((i + j - 1) % array_length(author_ids, 1)) + 1;
      INSERT INTO forum_post_likes (id, post_id, user_id, user_type, created_at)
      VALUES (
        (md5('saarway-forum-demo-like-' || i || '-' || j))::uuid,
        post_id,
        author_ids[author_index],
        author_types[author_index],
        now() - (i * interval '2 minutes') + (j * interval '3 seconds')
      )
      ON CONFLICT (id) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;
