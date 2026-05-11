const { Client } = require('pg');

const client = new Client({
  host: 'aws-0-ap-south-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.jmxitiocgsqpksnceoyd',
  password: process.env.SUPABASE_DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  try {
    if (!process.env.SUPABASE_DB_PASSWORD) {
      console.log('SUPABASE_DB_PASSWORD not set. Let me try with service role key...');
      // Can't connect without password - Supabase pooler needs password
      console.log('');
      console.log('To run this migration, you need your Supabase database password.');
      console.log('Find it at: https://supabase.com/dashboard/project/jmxitiocgsqpksnceoyd/settings/database');
      console.log('Look for "Connection string" → "URI" → copy the password part after ":".');
      process.exit(1);
    }

    await client.connect();
    console.log('Connected to Supabase!');

    const sql = `
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

DROP POLICY IF EXISTS "users_read_own_sessions" ON public.ai_chat_messages;
CREATE POLICY "users_read_own_sessions" ON public.ai_chat_messages
  FOR SELECT USING (user_id = auth.uid()::text OR auth.jwt() ->> 'role' = 'Admin');

DROP POLICY IF EXISTS "service_insert_chat" ON public.ai_chat_messages;
CREATE POLICY "service_insert_chat" ON public.ai_chat_messages
  FOR INSERT WITH CHECK (true);
    `;

    await client.query(sql);
    console.log('AI Chat migration completed successfully!');

    // Verify
    const result = await client.query('SELECT COUNT(*) FROM public.ai_chat_messages');
    console.log('Current rows:', result.rows[0].count);

  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();