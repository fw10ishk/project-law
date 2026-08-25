-- ============================================================
-- LEGALCONNECT — SCHEMA: ADVOCATE PRACTICE DATA
-- lawyers.sql — Professional experience, case track record,
-- certifications, service pricing and weekly availability.
--
-- Workspace collections map 1:1 from the JSON driver:
--   experience | caseExperience | certificates | pricing |
--   availability | notifications
-- ============================================================

-- ------------------------------------------------------------
-- professional_experience — firms / chambers timeline
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS professional_experience (
  id            TEXT PRIMARY KEY,                              -- 'exp_*'
  lawyer_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization  VARCHAR(160) NOT NULL,
  position      VARCHAR(120) NOT NULL DEFAULT 'Advocate',
  role          VARCHAR(120),
  area_of_practice VARCHAR(160),
  start_year    SMALLINT NOT NULL CHECK (start_year BETWEEN 1950 AND 2100),
  end_year      SMALLINT CHECK (end_year IS NULL OR end_year >= start_year), -- NULL = present
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exp_lawyer ON professional_experience (lawyer_id);

-- ------------------------------------------------------------
-- case_experience — anonymised public track record
-- Confidentiality rule: NO client names / case numbers allowed here;
-- enforced in UI validation and by review.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS case_experience (
  id          TEXT PRIMARY KEY,                                -- 'cexp_*'
  lawyer_id   TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  case_type   VARCHAR(120) NOT NULL,
  legal_area  VARCHAR(120) NOT NULL,
  court       VARCHAR(120) NOT NULL,
  year        SMALLINT NOT NULL CHECK (year BETWEEN 1950 AND 2100),
  lawyer_role VARCHAR(80) NOT NULL,
  status      TEXT NOT NULL DEFAULT 'Completed'
              CHECK (status IN ('Ongoing','Completed','Disposed')),
  outcome     VARCHAR(160) NOT NULL,
  description VARCHAR(500)
              CHECK (description IS NULL OR description !~* '\bvs\.?\b'), -- party-name guard
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cexp_lawyer ON case_experience (lawyer_id);

-- ------------------------------------------------------------
-- certificates — additional legal qualifications with honest states
-- 'verified' label may only be set through admin approval.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS certificates (
  id             TEXT PRIMARY KEY,                             -- 'cert_*'
  lawyer_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name           VARCHAR(160) NOT NULL,
  cert_type      TEXT NOT NULL DEFAULT 'optional'
                 CHECK (cert_type IN ('required','optional')),
  status         TEXT NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending','verified','rejected')),
  verified_date  DATE,
  document_id    TEXT,                                         -- FK added after verification_documents exists
  file_label     VARCHAR(255),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_verified_needs_date CHECK (
    status <> 'verified' OR verified_date IS NOT NULL
  )
);

CREATE INDEX IF NOT EXISTS idx_cert_lawyer ON certificates (lawyer_id);

-- ------------------------------------------------------------
-- services_pricing — rate card shown to prospective clients
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS services_pricing (
  id          TEXT PRIMARY KEY,                                -- 'price_*'
  lawyer_id   TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service     VARCHAR(120) NOT NULL,                           -- Initial Consultation, Document Review…
  fee_inr     INTEGER NOT NULL CHECK (fee_inr BETWEEN 0 AND 1000000),
  unit        VARCHAR(40) NOT NULL,                            -- '30 min' | 'Per Hearing' …
  price_model TEXT NOT NULL DEFAULT 'fixed'
              CHECK (price_model IN ('fixed','starting','negotiable','complexity')),
  active      BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (lawyer_id, service)
);

-- ------------------------------------------------------------
-- availability_slots — weekly recurring booking windows
-- Consultations may only be booked inside these windows.
-- Overlap inside a day is prevented app-side before insert.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS availability_slots (
  id           BIGSERIAL PRIMARY KEY,
  lawyer_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day_of_week  SMALLINT NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),  -- 1=Monday … 7=Sunday
  start_time   TIME NOT NULL,
  end_time     TIME NOT NULL,
  CONSTRAINT chk_slot_window CHECK (end_time > start_time)
);

CREATE INDEX IF NOT EXISTS idx_avail_lawyer_day ON availability_slots (lawyer_id, day_of_week);
CREATE UNIQUE INDEX IF NOT EXISTS uq_avail_no_dup_slot
  ON availability_slots (lawyer_id, day_of_week, start_time, end_time);

-- ------------------------------------------------------------
-- notifications — lawyer-facing inbox (requests, payments,
-- appointments, verification updates, security alerts, hearings)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id         TEXT PRIMARY KEY,                                 -- 'notif_*'
  lawyer_id  TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       TEXT NOT NULL CHECK (type IN
             ('client','appointment','payment','verification','security','case')),
  title      VARCHAR(160) NOT NULL,
  message    TEXT NOT NULL,
  link       VARCHAR(200),
  read       BOOLEAN NOT NULL DEFAULT FALSE,
  time       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notif_unread ON notifications (lawyer_id, time DESC) WHERE read = FALSE;
