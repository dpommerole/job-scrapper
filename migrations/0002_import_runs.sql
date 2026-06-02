CREATE TABLE IF NOT EXISTS import_runs (
  id TEXT PRIMARY KEY NOT NULL,
  source_id TEXT,
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  file_name TEXT,
  started_at TEXT NOT NULL,
  finished_at TEXT,
  imported_count INTEGER NOT NULL,
  skipped_duplicate_count INTEGER NOT NULL,
  failed_count INTEGER NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (source_id) REFERENCES sources(id)
);

CREATE INDEX IF NOT EXISTS import_runs_source_id_idx ON import_runs(source_id);
CREATE INDEX IF NOT EXISTS import_runs_started_at_idx ON import_runs(started_at);
