# LegalConnect

AI-Powered Advocate Portal & Virtual Court Platform — a legal-tech
platform where verified advocates manage clients, cases,
consultations and earnings.

## Repository layout

| Path | Purpose |
|---|---|
| `frontend/lawyer/` | Advocate portal SPA (vanilla JS + glassmorphism design system) |
| `frontend/admin/` | Verification desk console for admin reviewers |
| `frontend/user/` | Client portal (coming soon — holding page) |
| `frontend/shared/` | Design tokens, components, router, store, auth manager |
| `backend/src/` | Express API: auth/2FA, verification pipeline, workspace sync |
| `database/` | PostgreSQL DDL mirror of the data layer (`schema/`, `migrations/`, `seeders/`) |
| `ai-service/` | Python microservice skeleton (planned client-side AI features) |

## Quick start

```bash
cd backend
npm install
npm start          # http://localhost:3000 → advocate portal
```

The server seeds demo data on first boot:

- **Advocate:** `demo@legalconnect.in` / `Demo@1234`
- **Admin desk:** `admin@legalconnect.in` / `Admin@1234` (console at `/admin`)

Sign-in uses two-factor OTP. Outside production the API returns the
code as `devOtp` (also printed in the server console) because no
SMS/email gateway is connected.

## Data layer

Development uses an atomic file-backed JSON store
(`backend/data/db.json`) that mirrors the relational model 1:1.
For production PostgreSQL:

```bash
psql -d legalconnect -f database/migrations/001_initial_schema.sql
psql -d legalconnect -f database/seeders/demo_data.sql
```

## Environment

Copy `.env.example` → `.env` and set at minimum `JWT_SECRET`
before any deployment. See `.env.example` for all options
(`PORT`, `BCRYPT_ROUNDS`, `MAX_UPLOAD_MB`, …).
