CREATE TABLE public.support_threads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL UNIQUE,
  username TEXT,
  custom_label TEXT,
  chat_mode SMALLINT NOT NULL DEFAULT 0,
  last_message_at TIMESTAMPTZ,
  unread_admin INTEGER NOT NULL DEFAULT 0,
  unread_user INTEGER NOT NULL DEFAULT 1,
  welcome_message TEXT,
  notification_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  notification_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.support_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id UUID NOT NULL REFERENCES public.support_threads(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'admin')),
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.support_settings (
  id SMALLINT NOT NULL PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  welcome_message TEXT,
  chat_label TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX support_messages_thread_idx ON public.support_messages (thread_id, created_at);
CREATE INDEX support_messages_created_idx ON public.support_messages (created_at);
CREATE INDEX support_threads_last_message_idx ON public.support_threads (last_message_at DESC NULLS LAST);

GRANT ALL ON public.support_threads TO service_role;
GRANT ALL ON public.support_messages TO service_role;
GRANT ALL ON public.support_settings TO service_role;

ALTER TABLE public.support_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No direct client access to support threads"
  ON public.support_threads FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);
CREATE POLICY "No direct client access to support messages"
  ON public.support_messages FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);
CREATE POLICY "No direct client access to support settings"
  ON public.support_settings FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);