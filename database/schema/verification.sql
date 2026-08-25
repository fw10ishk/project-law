-- ============================================================
-- LEGALCONNECT — SCHEMA: VERIFICATION & FRAUD PREVENTION
-- verification.sql — Verification pipeline stages, credential
-- document vault, duplicate/risk records and admin decisions.
--
-- HONESTY CONTRACT mirrored from the service layer:
--   • No fabricated authenticity scores. Documents stay
--     'submitted_awaiting_review' until a human decides.
--   • Internal fraud signals are desk-only; lawyer-facing
--     summaries expose statuses, never signal details.
-- ============================================================

-- ------------------------------------------------------------
-- verification_records — one per advocate; stage machine
-- overall_status recomputed on every stage write (recomputeOverall).
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS verification_records (
  id              TEXT PRIMARY KEY,                            -- 'ver_*'
  lawyer_id       TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,

  -- Stage: Bar Council registry
  bar_status      TEXT NOT NULL DEFAULT 'pending' CHECK (bar_status IN
                  ('pending','verified','information_mismatch','unable_to_verify','manual_verification_required')),
  bar_detail      JSONB,                                       -- lookup result snapshot (checks + source label)
  bar_checked_at  TIMESTAMPTZ,

  -- Stage: documents
  docs_status     TEXT NOT NULL DEFAULT 'pending' CHECK (docs_status IN
                  ('pending','submitted_awaiting_review','manual_verification_required','verified','rejected')),
  docs_submitted  SMALLINT NOT NULL DEFAULT 0,

  -- Stage: identity / liveness (manual review until provider connected)
  identity_status TEXT NOT NULL DEFAULT 'not_started' CHECK (identity_status IN
                  ('not_started','pending','manual_verification_required','verified','failed')),
  identity_meta   JSONB,                                       -- { selfieCaptured, idDocSubmitted, livenessProvider }
  identity_at     TIMESTAMPTZ,

  -- Stage: duplicates
  duplicate_status TEXT NOT NULL DEFAULT 'clear' CHECK (duplicate_status IN
                   ('clear','collision_found','cleared_after_review')),
  collision_lawyer_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  duplicate_checked_at TIMESTAMPTZ,

  -- Stage: manual review
  manual_status   TEXT NOT NULL DEFAULT 'not_required' CHECK (manual_status IN
                  ('not_required','required','completed')),
  reviewer_id     TEXT REFERENCES users(id) ON DELETE SET NULL,
  manual_decision TEXT CHECK (manual_decision IN ('approve','reject','request_documents')),
  manual_reason   TEXT,
  decided_at      TIMESTAMPTZ,

  -- Rollups
  overall_status  TEXT NOT NULL DEFAULT 'pending' CHECK (overall_status IN
                  ('pending','verified','action_required')),
  fraud_status    TEXT NOT NULL DEFAULT 'low_risk' CHECK (fraud_status IN
                  ('low_risk','medium_risk_manual_review','high_risk_verification_failed')),
  risk_signals    JSONB NOT NULL DEFAULT '[]',                 -- INTERNAL — never serialised to the lawyer UI

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ver_overall ON verification_records (overall_status);

-- ------------------------------------------------------------
-- verification_documents — secure upload vault metadata.
-- Files live under data/uploads with randomised names; only the
-- owning lawyer (or an admin reviewer) can read/download.
-- checksum column powers duplicate-upload rejection.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS verification_documents (
  id               TEXT PRIMARY KEY,                           -- 'doc_*'
  lawyer_id        TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category         TEXT NOT NULL DEFAULT 'other' CHECK (category IN
                   ('bar_enrollment','cop','llb_degree','govt_id','llm','other_cert',
                    'case_document','identity_selfie')),
  label            VARCHAR(255),
  stored_name      TEXT NOT NULL,                              -- randomised filename server-side
  original_name    VARCHAR(255) NOT NULL,
  mime_type        VARCHAR(80) NOT NULL,
  size_bytes       INTEGER NOT NULL CHECK (size_bytes BETWEEN 1 AND 10485760),
  checksum_sha16   CHAR(16) NOT NULL,                          -- sha256[:16] duplicate detection
  integrity        JSONB NOT NULL DEFAULT '{"readable": true, "tamperingIndicators": "not_scanned"}',
  profile_match    JSONB NOT NULL DEFAULT '{}',                -- { nameMatches, regNumberMatches } set during review
  review_status    TEXT NOT NULL DEFAULT 'submitted_awaiting_review' CHECK (review_status IN
                   ('submitted_awaiting_review','verified','information_mismatch','rejected')),
  reviewed_by      TEXT REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at      TIMESTAMPTZ,
  review_notes     TEXT DEFAULT '',
  uploaded_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (lawyer_id, checksum_sha16)
);

CREATE INDEX IF NOT EXISTS idx_docs_lawyer_cat ON verification_documents (lawyer_id, category);

-- Link certificates table to the vault now that it exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_cert_document'
  ) THEN
    ALTER TABLE certificates
      ADD CONSTRAINT fk_cert_document
      FOREIGN KEY (document_id) REFERENCES verification_documents(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ------------------------------------------------------------
-- fraud_risk_records — internal screening outcomes.
-- SENSITIVE: exposed ONLY via admin endpoints, never to lawyers.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fraud_risk_records (
  id          TEXT PRIMARY KEY,                                -- 'fraud_*'
  lawyer_id   TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status      TEXT NOT NULL CHECK (status IN
              ('low_risk','medium_risk_manual_review','high_risk_verification_failed')),
  signals     JSONB NOT NULL DEFAULT '[]',                     -- internal detail
  action_taken TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fraud_lawyer ON fraud_risk_records (lawyer_id, created_at DESC);

-- ------------------------------------------------------------
-- admin_actions — full audit trail of desk operations:
-- verification decisions, re-verification triggers, incidents.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_actions (
  id          TEXT PRIMARY KEY,                                -- 'adm_*'
  type        TEXT NOT NULL CHECK (type IN
              ('verification_decision','reverification_triggered','security_incident')),
  lawyer_id   TEXT REFERENCES users(id) ON DELETE CASCADE,
  reviewer_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  decision    TEXT CHECK (decision IN ('approve','reject','request_documents')),
  reason      TEXT DEFAULT '',
  summary     TEXT,
  status      TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','resolved')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_admin_open ON admin_actions (status, created_at DESC);
