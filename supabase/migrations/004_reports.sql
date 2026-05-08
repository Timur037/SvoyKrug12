CREATE TABLE IF NOT EXISTS reports (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          UUID REFERENCES users(id) ON DELETE SET NULL,
  meetup_id        UUID REFERENCES meetups(id) ON DELETE SET NULL,
  reported_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  message          TEXT NOT NULL,
  source           TEXT NOT NULL DEFAULT 'post_event', -- 'post_event' | 'home'
  sent_to_telegram BOOLEAN DEFAULT FALSE,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_unsent ON reports (created_at)
  WHERE sent_to_telegram = FALSE;
