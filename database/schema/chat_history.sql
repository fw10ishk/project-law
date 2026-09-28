-- ============================================================
-- LEGALCONNECT — SCHEMA: SECURE CLIENT CHAT
-- chat_history.sql — Conversation threads and messages.
-- PRIVACY MODEL:
--   This is the client-visible channel. Private counsel notes live in
--   case_notes and are structurally prevented from entering here.
-- ============================================================

-- ------------------------------------------------------------
-- conversations — one thread per active client engagement
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS conversations (
  id                TEXT PRIMARY KEY,                          -- 'conv_*'
  lawyer_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id         TEXT REFERENCES clients(id) ON DELETE SET NULL,
  client_name       VARCHAR(120) NOT NULL,
  category          VARCHAR(80),                               -- case category label for the header
  last_message      VARCHAR(500),
  last_message_time TIMESTAMPTZ,
  unread_count      SMALLINT NOT NULL DEFAULT 0 CHECK (unread_count >= 0),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conv_lawyer_recent ON conversations (lawyer_id, last_message_time DESC);

-- ------------------------------------------------------------
-- chat_messages — immutable message log with optional attachment
-- pointing into the document vault.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS chat_messages (
  id              TEXT PRIMARY KEY,                            -- 'm_*'
  conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender          TEXT NOT NULL CHECK (sender IN ('lawyer','client')),
  text            VARCHAR(4000) NOT NULL,
  attachment_id   TEXT,                                        -- verification_documents.id when uploaded
  attachment_meta JSONB,                                       -- { size, uploaded } display hints
  time            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_msg_conv_time ON chat_messages (conversation_id, time);
