CREATE TABLE IF NOT EXISTS public.ai_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  user_type text NOT NULL CHECK (user_type IN ('buyer', 'farm_user', 'super_admin')),
  session_id text NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON public.ai_chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user ON public.ai_chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON public.ai_chat_messages(created_at DESC);

ALTER TABLE public.ai_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own_sessions" ON public.ai_chat_messages
  FOR SELECT USING (user_id = auth.uid()::text OR auth.jwt() ->> 'role' = 'Admin');

CREATE POLICY "service_insert_chat" ON public.ai_chat_messages
  FOR INSERT WITH CHECK (true);