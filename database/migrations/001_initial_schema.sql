-- ============================================================
-- LEGALCONNECT — MIGRATION 001: INITIAL SCHEMA
-- Applies all domain schemas in dependency order.
--
--   psql -d legalconnect -f database/migrations/001_initial_schema.sql
--
-- Idempotent: every object uses IF NOT EXISTS / guarded DO blocks,
-- so re-running is safe.
-- ============================================================

\ir ../schema/users.sql          -- identity, security, sessions
\ir ../schema/lawyers.sql        -- practice data, pricing, availability
\ir ../schema/verification.sql   -- pipeline, document vault, fraud, admin
\ir ../schema/cases.sql          -- clients, cases, appointments, payments
\ir ../schema/chat_history.sql   -- conversations & messages

-- ------------------------------------------------------------
-- updated_at maintenance triggers
-- ------------------------------------------------------------
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['users','lawyer_profiles','cases','services_pricing'] LOOP
    EXECUTE format('
      CREATE OR REPLACE FUNCTION touch_updated_at_%1$s() RETURNS trigger AS $fn$
      BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
      $fn$ LANGUAGE plpgsql;
      DROP TRIGGER IF EXISTS trg_touch_%1$s ON %1$s;
      CREATE TRIGGER trg_touch_%1$s BEFORE UPDATE ON %1$s
      FOR EACH ROW EXECUTE FUNCTION touch_updated_at_%1$s();', t);
  END LOOP;
END $$;

-- ------------------------------------------------------------
-- Verification rollup guard: a lawyer row may only carry
-- 'verified' when the pipeline record confirms it. Enforced as a
-- DEFERRABLE constraint trigger so the approval transaction can
-- update both rows atomically.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION check_verified_alignment() RETURNS trigger AS $fn$
BEGIN
  IF NEW.verification_status = 'verified' THEN
    IF NOT EXISTS (
      SELECT 1 FROM verification_records v
      WHERE v.lawyer_id = NEW.user_id AND v.overall_status = 'verified'
    ) THEN
      RAISE EXCEPTION 'Cannot mark advocate % verified without a verified pipeline record', NEW.user_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$fn$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_verified_alignment ON lawyer_profiles;
CREATE CONSTRAINT TRIGGER trg_verified_alignment
  AFTER INSERT OR UPDATE OF verification_status ON lawyer_profiles
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION check_verified_alignment();
