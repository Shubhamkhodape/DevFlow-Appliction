-- DevFlow CI/CD Platform — Initial Schema
-- Apply: psql -U devflow_user -d devflow -f backend/migrations/001_init.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── users ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  username      VARCHAR(50)  UNIQUE NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(20)  NOT NULL DEFAULT 'Developer',
  avatar        VARCHAR(10)  NOT NULL,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  last_login    TIMESTAMPTZ
);

-- ── projects ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(100) UNIQUE NOT NULL,
  repo        VARCHAR(500) NOT NULL,
  branch      VARCHAR(100) NOT NULL DEFAULT 'main',
  lang        VARCHAR(50)  NOT NULL,
  description TEXT,
  env         VARCHAR(20)  NOT NULL DEFAULT 'staging',
  stages      JSONB        NOT NULL DEFAULT '[]',
  owner_id    UUID         REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── pipeline_runs ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pipeline_runs (
  id           VARCHAR(20)  PRIMARY KEY,
  project_id   UUID         REFERENCES projects(id) ON DELETE SET NULL,
  project_name VARCHAR(100) NOT NULL,
  branch       VARCHAR(100) NOT NULL,
  trigger      VARCHAR(20)  NOT NULL DEFAULT 'manual',
  env          VARCHAR(20)  NOT NULL DEFAULT 'staging',
  status       VARCHAR(20)  NOT NULL DEFAULT 'pending',
  stages       JSONB        NOT NULL DEFAULT '[]',
  duration     INTEGER      NOT NULL DEFAULT 0,
  triggered_by UUID         REFERENCES users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  finished_at  TIMESTAMPTZ
);

-- ── vulnerabilities ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vulnerabilities (
  id           UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  run_id       VARCHAR(20)  REFERENCES pipeline_runs(id) ON DELETE CASCADE,
  project_name VARCHAR(100) NOT NULL,
  vuln_id      VARCHAR(20)  NOT NULL,
  title        TEXT         NOT NULL,
  severity     VARCHAR(20)  NOT NULL,
  tool         VARCHAR(50)  NOT NULL,
  cvss         DECIMAL(3,1),
  cve          VARCHAR(30),
  cwe          VARCHAR(30),
  file_path    VARCHAR(500),
  line_number  INTEGER,
  package_name VARCHAR(255),
  fix          TEXT,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── artifacts ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS artifacts (
  id        UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  name      VARCHAR(100) NOT NULL,
  version   VARCHAR(50)  NOT NULL,
  type      VARCHAR(20)  NOT NULL,
  size      VARCHAR(20),
  digest    VARCHAR(100),
  project   VARCHAR(100) NOT NULL,
  run_id    VARCHAR(20)  REFERENCES pipeline_runs(id) ON DELETE SET NULL,
  pushed_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_runs_project   ON pipeline_runs(project_id);
CREATE INDEX IF NOT EXISTS idx_runs_name      ON pipeline_runs(project_name);
CREATE INDEX IF NOT EXISTS idx_runs_status    ON pipeline_runs(status);
CREATE INDEX IF NOT EXISTS idx_runs_created   ON pipeline_runs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vulns_run      ON vulnerabilities(run_id);
CREATE INDEX IF NOT EXISTS idx_vulns_severity ON vulnerabilities(severity);
CREATE INDEX IF NOT EXISTS idx_arts_project   ON artifacts(project);
CREATE INDEX IF NOT EXISTS idx_arts_pushed    ON artifacts(pushed_at DESC);
