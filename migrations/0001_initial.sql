CREATE TABLE IF NOT EXISTS sources (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  url TEXT,
  type TEXT NOT NULL,
  collection_method TEXT NOT NULL,
  priority TEXT NOT NULL,
  compliance_risk TEXT NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS opportunities (
  id TEXT PRIMARY KEY NOT NULL,
  source_id TEXT,
  source TEXT NOT NULL,
  source_url TEXT,
  title TEXT NOT NULL,
  company TEXT,
  recruiter_name TEXT,
  recruiter_company TEXT,
  recruiter_contact_url TEXT,
  recruiter_email TEXT,
  location TEXT,
  remote_policy TEXT NOT NULL,
  contract_type TEXT NOT NULL,
  seniority TEXT,
  duration TEXT,
  start_date TEXT,
  rate_min INTEGER,
  rate_max INTEGER,
  currency TEXT,
  required_skills_json TEXT NOT NULL,
  nice_to_have_skills_json TEXT NOT NULL,
  description TEXT NOT NULL,
  published_at TEXT,
  collected_at TEXT NOT NULL,
  updated_at TEXT,
  status TEXT NOT NULL,
  score INTEGER,
  opportunity_class TEXT,
  positive_signals_json TEXT NOT NULL,
  negative_signals_json TEXT NOT NULL,
  missing_information_json TEXT NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (source_id) REFERENCES sources(id)
);

CREATE INDEX IF NOT EXISTS opportunities_source_url_idx ON opportunities(source_url);
CREATE INDEX IF NOT EXISTS opportunities_source_id_idx ON opportunities(source_id);
CREATE INDEX IF NOT EXISTS opportunities_collected_at_idx ON opportunities(collected_at);
