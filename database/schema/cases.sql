-- ============================================================
-- LEGALCONNECT — SCHEMA: CLIENTS, CASES & CONSULTATIONS
-- cases.sql — Client requests, case files, exhibits, private
-- counsel notes, appointments, consultations and the payments
-- ledger.
--
-- PRIVACY MODEL (platform guarantee):
--   • case_notes.is_private rows are counsel-only. The client-facing
--     API layer MUST filter them out — there is no shared read path.
-- ============================================================

-- ------------------------------------------------------------
-- clients — consultation-request counterparties
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clients (
  id                TEXT PRIMARY KEY,                          -- 'cli_*'
  lawyer_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name              VARCHAR(120) NOT NULL,
  email             VARCHAR(160),
  phone             VARCHAR(15),
  avatar            TEXT,
  case_category     VARCHAR(80) NOT NULL,
  brief_problem     TEXT NOT NULL,
  preferred_date    DATE,
  preferred_time    VARCHAR(20),
  consultation_type TEXT CHECK (consultation_type IN ('Video Call','Audio Call','In-Person','Chat')),
  estimated_fee_inr INTEGER NOT NULL DEFAULT 0 CHECK (estimated_fee_inr >= 0),
  status            TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','accepted','rejected','completed')),
  rejection_reason  VARCHAR(200),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clients_lawyer_status ON clients (lawyer_id, status);
CREATE INDEX IF NOT EXISTS idx_clients_pending ON clients (lawyer_id, created_at DESC) WHERE status = 'pending';

-- ------------------------------------------------------------
-- cases — case files opened after acceptance or manually
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cases (
  id             TEXT PRIMARY KEY,                             -- 'case_*'
  lawyer_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id      TEXT REFERENCES clients(id) ON DELETE SET NULL,
  case_number    VARCHAR(30) NOT NULL,                         -- 'LC/YYYY/NNNN'
  client_name    VARCHAR(120) NOT NULL,                        -- denormalised snapshot for listings
  case_type      VARCHAR(120) NOT NULL,
  legal_category VARCHAR(120) NOT NULL,
  court          VARCHAR(120),
  filing_date    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status         TEXT NOT NULL DEFAULT 'New' CHECK (status IN
                 ('New','Under Review','Consultation Completed','Documents Pending',
                  'Filed','Hearing Scheduled','Ongoing','Resolved','Closed')),
  next_hearing   DATE,
  description    TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (lawyer_id, case_number)
);

CREATE INDEX IF NOT EXISTS idx_cases_lawyer_status ON cases (lawyer_id, status);
CREATE INDEX IF NOT EXISTS idx_cases_hearing_soon ON cases (lawyer_id, next_hearing)
  WHERE status NOT IN ('Resolved','Closed');

-- ------------------------------------------------------------
-- case_documents — exhibits & paperwork attached to a case file.
-- Rows reference the secure document vault (verification_documents
-- table / uploads directory); binary content is never inline here.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS case_documents (
  id          BIGSERIAL PRIMARY KEY,
  case_id     TEXT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  name        VARCHAR(255) NOT NULL,
  doc_type    VARCHAR(80),                                     -- Property Document | Court Document | Evidence…
  size_label  VARCHAR(20),                                     -- human label e.g. '1.2 MB'
  vault_document_id TEXT,                                      -- links to verification_documents when really uploaded
  uploaded    BOOLEAN NOT NULL DEFAULT FALSE,                  -- TRUE = real file in vault; FALSE = demo metadata
  added_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_casedocs_case ON case_documents (case_id);

-- ------------------------------------------------------------
-- case_notes — strategy notes. Private by default; private rows
-- are NEVER exposed on any client-visible endpoint.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS case_notes (
  id          TEXT PRIMARY KEY,                                -- 'note_*'
  case_id     TEXT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  note_text   TEXT NOT NULL CHECK (LENGTH(note_text) BETWEEN 1 AND 2000),
  is_private  BOOLEAN NOT NULL DEFAULT TRUE,                   -- platform default: counsel-only
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_casenotes_case ON case_notes (case_id, created_at DESC);

-- ------------------------------------------------------------
-- appointments — booked consultations (from accept flow or manual)
-- reminders JSON mirrors { h24Sent, m30Sent } flags used by the
-- reminder engine; in production these become scheduled jobs.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS appointments (
  id           TEXT PRIMARY KEY,                               -- 'appt_*'
  lawyer_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  case_id      TEXT REFERENCES cases(id) ON DELETE SET NULL,
  client_id    TEXT REFERENCES clients(id) ON DELETE SET NULL,
  client_name  VARCHAR(120) NOT NULL,
  case_type    VARCHAR(120),
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_min SMALLINT NOT NULL DEFAULT 45 CHECK (duration_min BETWEEN 15 AND 240),
  type         TEXT CHECK (type IN ('Video Call','Audio Call','In-Person','Chat')),
  status       TEXT NOT NULL DEFAULT 'confirmed'
               CHECK (status IN ('upcoming','confirmed','completed','cancelled')),
  fee_inr      INTEGER NOT NULL DEFAULT 0,
  reminder_24h_sent  BOOLEAN NOT NULL DEFAULT FALSE,
  reminder_30m_sent  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appts_lawyer_time ON appointments (lawyer_id, scheduled_at DESC);
CREATE INDEX IF NOT EXISTS idx_appts_reminder_scan
  ON appointments (scheduled_at)
  WHERE status IN ('upcoming','confirmed')
    AND (reminder_24h_sent = FALSE OR reminder_30m_sent = FALSE);

-- ------------------------------------------------------------
-- consultations — one row per completed session in the room;
-- captures duration + outcome for records and settlement.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS consultations (
  id             BIGSERIAL PRIMARY KEY,
  appointment_id TEXT REFERENCES appointments(id) ON DELETE SET NULL,
  case_id        TEXT REFERENCES cases(id) ON DELETE SET NULL,
  lawyer_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  started_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at       TIMESTAMPTZ,
  duration_sec   INTEGER,
  mode           TEXT CHECK (mode IN ('video','audio','chat','in_person')),
  notes_summary  TEXT
);

-- ------------------------------------------------------------
-- transactions — payments ledger (gross → platform fee → net)
-- platform_fee_pct snapshot protects historical rows from rate changes.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS transactions (
  id               TEXT PRIMARY KEY,                           -- 'txn_*'
  lawyer_id        TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  appointment_id   TEXT REFERENCES appointments(id) ON DELETE SET NULL,
  client_name      VARCHAR(120) NOT NULL,
  service          VARCHAR(120) NOT NULL,
  txn_date         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  amount_inr       INTEGER NOT NULL CHECK (amount_inr >= 0),   -- gross paid by client
  platform_fee_pct NUMERIC(4,3) NOT NULL DEFAULT 0.100,        -- snapshot of env rate
  platform_fee_inr INTEGER NOT NULL,
  net_earnings_inr INTEGER NOT NULL,
  payment_method   VARCHAR(40) DEFAULT 'Platform',
  payment_status   TEXT NOT NULL DEFAULT 'pending'
                   CHECK (payment_status IN ('pending','processing','completed','refunded')),
  CONSTRAINT chk_fee_math CHECK (platform_fee_inr = ROUND(amount_inr * platform_fee_pct)
                                 AND net_earnings_inr = amount_inr - platform_fee_inr)
);

CREATE INDEX IF NOT EXISTS idx_txn_lawyer_date ON transactions (lawyer_id, txn_date DESC);
CREATE INDEX IF NOT EXISTS idx_txn_settled ON transactions (lawyer_id, txn_date DESC) WHERE payment_status = 'completed';

-- ------------------------------------------------------------
-- reviews — post-consultation client feedback. READ-ONLY for
-- advocates: no update/delete path exists outside moderation.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
  id              TEXT PRIMARY KEY,                            -- 'rev_*'
  lawyer_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  case_id         TEXT REFERENCES cases(id) ON DELETE SET NULL,
  client_name     VARCHAR(120) NOT NULL,
  rating          SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text     TEXT NOT NULL,
  would_recommend BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_lawyer ON reviews (lawyer_id, created_at DESC);
