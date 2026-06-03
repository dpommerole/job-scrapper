CREATE TABLE IF NOT EXISTS collector_runs (
  id TEXT PRIMARY KEY NOT NULL,
  source_id TEXT NOT NULL,
  collector_name TEXT NOT NULL,
  collector_type TEXT NOT NULL,
  status TEXT NOT NULL,
  started_at TEXT NOT NULL,
  finished_at TEXT,
  collected_count INTEGER NOT NULL,
  imported_count INTEGER NOT NULL,
  duplicate_count INTEGER NOT NULL,
  invalid_count INTEGER NOT NULL,
  warning_count INTEGER NOT NULL,
  error_count INTEGER NOT NULL,
  warnings_json TEXT NOT NULL,
  errors_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (source_id) REFERENCES sources(id)
);

CREATE INDEX IF NOT EXISTS collector_runs_source_id_idx ON collector_runs(source_id);
CREATE INDEX IF NOT EXISTS collector_runs_started_at_idx ON collector_runs(started_at);
CREATE INDEX IF NOT EXISTS collector_runs_status_idx ON collector_runs(status);
