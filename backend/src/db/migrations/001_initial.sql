-- FlowTrack AI — Initial Schema
-- Run automatically by Docker on first boot

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Users ────────────────────────────────────────────────────────────────────
CREATE TABLE users (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email        TEXT UNIQUE NOT NULL,
  name         TEXT NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Projects ─────────────────────────────────────────────────────────────────
CREATE TABLE projects (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  description  TEXT,
  color        TEXT DEFAULT '#6366F1',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Raw Events ───────────────────────────────────────────────────────────────
-- Every inbound signal from Slack, GitHub, Jira, Calendar, etc.
CREATE TABLE raw_events (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source       TEXT NOT NULL CHECK (source IN ('slack','github','jira','calendar','vscode','other')),
  user_id      UUID REFERENCES users(id) ON DELETE SET NULL,
  payload      JSONB NOT NULL,
  processed    BOOLEAN DEFAULT FALSE,
  job_id       TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── AI-Generated Drafts ──────────────────────────────────────────────────────
-- Pending approval from the user
CREATE TABLE drafts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES users(id) ON DELETE CASCADE,
  project_id       UUID REFERENCES projects(id) ON DELETE SET NULL,
  task             TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  confidence       NUMERIC(5,2) DEFAULT 0,
  notes            TEXT,
  sources          JSONB DEFAULT '[]',       -- ["slack","github"]
  raw_event_ids    JSONB DEFAULT '[]',       -- UUIDs of source events
  ai_reasoning     TEXT,
  status           TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Approved Work Logs ───────────────────────────────────────────────────────
CREATE TABLE work_logs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES users(id) ON DELETE CASCADE,
  project_id       UUID REFERENCES projects(id) ON DELETE SET NULL,
  draft_id         UUID REFERENCES drafts(id) ON DELETE SET NULL,
  task             TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  notes            TEXT,
  logged_date      DATE DEFAULT CURRENT_DATE,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Agent Memory / Context Store ─────────────────────────────────────────────
-- Persistent context the AI reads before each analysis
CREATE TABLE agent_memory (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  key          TEXT NOT NULL,
  value        JSONB NOT NULL,
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, key)
);

-- ─── Audit Log ────────────────────────────────────────────────────────────────
CREATE TABLE audit_log (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES users(id) ON DELETE SET NULL,
  action       TEXT NOT NULL,
  entity_type  TEXT NOT NULL,
  entity_id    UUID,
  before_state JSONB,
  after_state  JSONB,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX idx_raw_events_user       ON raw_events(user_id);
CREATE INDEX idx_raw_events_processed  ON raw_events(processed);
CREATE INDEX idx_raw_events_source     ON raw_events(source);
CREATE INDEX idx_raw_events_created    ON raw_events(created_at DESC);
CREATE INDEX idx_drafts_user           ON drafts(user_id);
CREATE INDEX idx_drafts_status         ON drafts(status);
CREATE INDEX idx_drafts_created        ON drafts(created_at DESC);
CREATE INDEX idx_work_logs_user        ON work_logs(user_id);
CREATE INDEX idx_work_logs_project     ON work_logs(project_id);
CREATE INDEX idx_work_logs_date        ON work_logs(logged_date DESC);
CREATE INDEX idx_agent_memory_user     ON agent_memory(user_id);

-- ─── Trigger: auto-update drafts.updated_at ───────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER drafts_updated_at
  BEFORE UPDATE ON drafts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Seed: default local user ─────────────────────────────────────────────────
INSERT INTO users (id, email, name) VALUES
  ('00000000-0000-0000-0000-000000000001', 'user@localhost', 'You');

INSERT INTO agent_memory (user_id, key, value) VALUES
  ('00000000-0000-0000-0000-000000000001', 'context', '{
    "active_projects": [],
    "recent_tasks": [],
    "work_hours": "09:00-18:00",
    "timezone": "UTC"
  }');
