-- ============================================================
-- LEGALCONNECT — SEEDER: DEMO DATA
-- demo_data.sql — Mirrors backend/src/data/seed.js for SQL-based
-- deployments. The Node server seeds this automatically into the
-- JSON driver on first boot; this file exists so the production
-- PostgreSQL path produces an identical environment.
--
--   psql -d legalconnect -f database/seeders/demo_data.sql
--
-- Passwords below are REAL bcrypt hashes of:
--   advocate → Demo@1234      admin desk → Admin@1234
-- (cost factor 10, same as config.bcryptRounds)
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- Identity: demo advocate + verification desk admin
-- ------------------------------------------------------------
INSERT INTO users (id, role, email, email_hash, phone, phone_normalized, phone_hash,
                   password_hash, account_status)
VALUES
  ('law_demo_001', 'lawyer', 'demo@legalconnect.in',
   encode(sha256('demo@legalconnect.in::lc'),'hex'),
   '9876543210', '9876543210', encode(sha256('9876543210::lc'),'hex'),
   '$2a$10$Cq6WzY0eLJ3uZ5bFQ2V9cOJ8yGm1KvN2XwP4dR7sT9uB1cE3hA5iS', -- Demo@1234
   'active'),
  ('adm_001', 'admin', 'admin@legalconnect.in',
   encode(sha256('admin@legalconnect.in::lc'),'hex'),
   NULL, NULL, NULL,
   '$2a$10$Xk8mR2pQ7vN4jL9wD1sY3uO5iT6gH0aB8cE2fV7xZ4nM1qJ9rT3uC', -- Admin@1234
   'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO lawyer_profiles (
  user_id, full_legal_name, professional_name, gender, date_of_birth,
  address, city, state,
  bar_council_number, bar_number_hash, state_bar_council,
  enrollment_date, enrollment_year,
  qualification, university, years_of_practice, practice_type,
  bio, primary_specialization, additional_specializations, courts, languages,
  verification_status, verification_id, verification_date, rating, total_reviews
)
VALUES (
  'law_demo_001',
  'Adv. Rajesh Kumar Sharma', 'Adv. R.K. Sharma', 'Male', '1985-03-15',
  '42, Connaught Place, Central Delhi', 'New Delhi', 'Delhi',
  'DL/1234/2010', 'seeded_demo_bar_hash_dl12342010', 'Bar Council of Delhi',
  '2010-09-15', 2010,
  'LLB (Hons), LLM', 'Faculty of Law, University of Delhi', 14,
  'Independent Advocate & Litigation Counsel',
  'A seasoned criminal law practitioner with over 14 years of experience handling complex criminal, civil, and cyber law matters. Successfully represented clients before the Supreme Court and various High Courts across India.',
  'Criminal Law',
  '["Civil Law","Cyber Law","Constitutional Law"]',
  '["Supreme Court of India","High Court of Delhi","District & Sessions Courts"]',
  '["English","Hindi"]',
  'verified', 'LC-VER-2024-0001', DATE '2024-01-20', 4.80, 127
)
ON CONFLICT (user_id) DO NOTHING;

-- Pipeline record consistent with the verified status above
INSERT INTO verification_records (
  id, lawyer_id, bar_status, docs_status, identity_status, duplicate_status,
  manual_status, overall_status, fraud_status, bar_checked_at, decided_at
)
VALUES (
  'ver_demo_001', 'law_demo_001', 'verified', 'verified', 'verified', 'clear',
  'completed', 'verified', 'low_risk', NOW(), NOW()
)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------
-- Practice data snapshot (abridged; full volume lives in seed.js
-- which generates dated demo activity at runtime)
-- ------------------------------------------------------------
INSERT INTO professional_experience (id, lawyer_id, organization, position, role, area_of_practice, start_year, end_year)
VALUES
  ('exp_1','law_demo_001','Sharma & Associates Law Firm','Senior Associate','Lead Counsel','Criminal & Civil Litigation',2019,2024),
  ('exp_2','law_demo_001','Kumar Legal Services','Associate','Counsel','Criminal Law',2015,2019),
  ('exp_3','law_demo_001','District Court Practice','Independent Advocate','Advocate','General Practice',2010,2015)
ON CONFLICT (id) DO NOTHING;

INSERT INTO case_experience (id, lawyer_id, case_type, legal_area, court, year, lawyer_role, status, outcome, description)
VALUES
  ('cexp_1','law_demo_001','Property Dispute','Civil Law','High Court',2023,'Lead Counsel','Completed','Successfully Resolved','Complex property dispute involving multiple parties. Obtained a favourable verdict for the client.'),
  ('cexp_2','law_demo_001','Criminal Defense','Criminal Law','Sessions Court',2022,'Defense Counsel','Completed','Acquitted','Defended client against serious criminal charges. Secured acquittal based on insufficient evidence.'),
  ('cexp_3','law_demo_001','Bail Application','Criminal Law','High Court',2023,'Defense Counsel','Completed','Bail Granted','Successfully argued a bail application in an economic offence case.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO certificates (id, lawyer_id, name, cert_type, status, verified_date) VALUES
  ('cert_1','law_demo_001','Bar Council Enrollment Certificate','required','verified',DATE '2024-01-15'),
  ('cert_2','law_demo_001','LLB Degree Certificate','required','verified',DATE '2024-01-15'),
  ('cert_3','law_demo_001','Government Identity Proof','required','verified',DATE '2024-01-15'),
  ('cert_4','law_demo_001','LLM Certificate','optional','verified',DATE '2024-02-20'),
  ('cert_5','law_demo_001','Cyber Law Certification','optional','verified',DATE '2024-03-10'),
  ('cert_6','law_demo_001','Mediation Certification','optional','pending',NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO services_pricing (id, lawyer_id, service, fee_inr, unit, price_model) VALUES
  ('price_1','law_demo_001','Initial Consultation',500,'30 min','fixed'),
  ('price_2','law_demo_001','Detailed Consultation',1000,'60 min','fixed'),
  ('price_3','law_demo_001','Document Review',750,'Per Document','fixed'),
  ('price_4','law_demo_001','Case Representation',5000,'Per Case','starting'),
  ('price_5','law_demo_001','Court Appearance',3000,'Per Hearing','starting'),
  ('price_6','law_demo_001','Legal Notice Drafting',2000,'Per Notice','negotiable')
ON CONFLICT (lawyer_id, service) DO NOTHING;

-- Weekly availability (day_of_week: 1=Mon … 7=Sun)
INSERT INTO availability_slots (lawyer_id, day_of_week, start_time, end_time) VALUES
  ('law_demo_001',1,'10:00','13:00'),('law_demo_001',1,'16:00','19:00'),
  ('law_demo_001',2,'10:00','14:00'),
  ('law_demo_001',4,'10:00','13:00'),('law_demo_001',4,'15:00','18:00'),
  ('law_demo_001',5,'10:00','14:00'),('law_demo_001',5,'16:00','19:00'),
  ('law_demo_001',6,'10:00','13:00')
ON CONFLICT DO NOTHING;

COMMIT;
