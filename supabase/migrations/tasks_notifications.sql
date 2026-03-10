-- ============================================================================
-- Migration: Tasks & Persistent Notifications
-- Run this in Supabase SQL Editor
-- ============================================================================

-- ── 1. Tasks ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid REFERENCES farms(id) NOT NULL,
  station_id uuid REFERENCES stations(id),
  title text NOT NULL,
  description text,
  assigned_to uuid REFERENCES farm_users(id) NOT NULL,
  assigned_by uuid REFERENCES farm_users(id) NOT NULL,
  priority text DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
  status text DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed')),
  due_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='tasks' AND policyname='Service role bypass tasks') THEN
    CREATE POLICY "Service role bypass tasks" ON tasks FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ── 2. Task Items (checklist) ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS task_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  text text NOT NULL,
  is_done boolean DEFAULT false,
  done_at timestamptz,
  sort_order int DEFAULT 0
);

ALTER TABLE task_items ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='task_items' AND policyname='Service role bypass task_items') THEN
    CREATE POLICY "Service role bypass task_items" ON task_items FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ── 3. Persistent Notifications ─────────────────────────────────────────────
-- Drop old table if it exists without the right columns, then recreate
DROP TABLE IF EXISTS notifications CASCADE;

CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid REFERENCES farms(id),
  user_id uuid REFERENCES farm_users(id),
  super_admin boolean DEFAULT false,
  type text NOT NULL,
  severity text DEFAULT 'info' CHECK (severity IN ('critical','warning','info')),
  title text NOT NULL,
  message text NOT NULL,
  link text DEFAULT '/',
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role bypass notifications"
  ON notifications FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Indexes ─────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_tasks_farm_id ON tasks(farm_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_task_items_task_id ON task_items(task_id);
CREATE INDEX IF NOT EXISTS idx_notifications_farm_id ON notifications(farm_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_super_admin ON notifications(super_admin) WHERE super_admin = true;
