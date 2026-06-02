CREATE TABLE IF NOT EXISTS outreach_items (
  id TEXT PRIMARY KEY,
  opportunity_id TEXT REFERENCES opportunities(id),
  recruiter_name TEXT,
  recruiter_company TEXT,
  related_opportunity_title TEXT,
  channel TEXT NOT NULL,
  status TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  sent_at TEXT,
  follow_up_at TEXT,
  replied_at TEXT,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS outreach_items_opportunity_id_idx ON outreach_items(opportunity_id);
CREATE INDEX IF NOT EXISTS outreach_items_follow_up_at_idx ON outreach_items(follow_up_at);
CREATE INDEX IF NOT EXISTS outreach_items_status_idx ON outreach_items(status);
