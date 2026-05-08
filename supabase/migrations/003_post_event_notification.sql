-- Add post_event_sent flag to meetups so we don't double-notify
ALTER TABLE meetups ADD COLUMN IF NOT EXISTS post_event_sent BOOLEAN DEFAULT FALSE;

-- Index for the notification query (find unnotified past meetups)
CREATE INDEX IF NOT EXISTS idx_meetups_post_event
  ON meetups (scheduled_at, post_event_sent)
  WHERE post_event_sent = FALSE;
