# PROFIT Training Club — High-Performance Gym Management SaaS Platform

> **Commercial-Grade Gym Management SaaS** built with React 18, Vite, Tailwind CSS, TypeScript, Supabase, Stripe, Recharts, and QR Biometric Turnstile Terminal.

---

## 🌟 Overview (Hinglish Guide)

Yeh project **PROFIT Training Club** (`https://profitgym-ten.vercel.app/`) ka complete SaaS transformation hai. Isme gym website ka **dark athletic aesthetic**, typography (`Barlow Condensed` + `Inter`), colors (`#0d0e10`, surfaces `#141518`, lime accent `#ccff00`), aur animations 100% preserve kiye gaye hain, aur backend par full **Gym Management SaaS** banaya gaya hai.

### Key Roles & Permissions:
1. **Athlete Member (`/member/*`)**:
   - Live Membership status card (Active, Expiring Soon, Expired, Days Remaining).
   - Digital Gym Pass QR code for entry turnstile gates.
   - Periodized workout schedule with interactive sets, reps & weight logger.
   - Recharts visual graphs for attendance frequency and 1RM compound lifts (Bench, Squat, Deadlift).
   - Stripe membership upgrades and invoice receipts.
2. **Master Coach / Trainer (`/trainer/*`)**:
   - Assigned athletes roster with live biomechanics PRs.
   - Program Architect: Create and assign custom workout splits to athletes with sets, reps, kg, and rest timers.
   - Real-time floor attendance feed.
3. **Executive Admin (`/admin/*`)**:
   - Executive operations telemetry: Monthly revenue ($64,850+), 300-member cap counter, gate scans.
   - Member Directory with search, filters (Active, Expiring, Expired), and onboarding modals.
   - Master Coach roster and credentials management.
   - Dynamic Membership Tiers CRUD (Starter, Performance, Elite).
   - Stripe Financial Ledger with transaction audits and export.
   - Live Turnstile QR Terminal for gate hardware scanning.

---

## 🔑 Account Access Credentials

Aap direct credentials enter karke login kar sakte hain:

| Role | Email | Password | Landing Page |
|---|---|---|---|
| **Member (Athlete)** | `member@profitgym.com` | `password123` | `/member/dashboard` |
| **Master Coach** | `trainer@profitgym.com` | `password123` | `/trainer/dashboard` |
| **Club Admin** | `admin@profitgym.com` | `password123` | `/admin/dashboard` |

---

## 🏗️ Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS
- **Routing**: React Router v6 with strict Protected Routes & Role-Based Access Control (RBAC)
- **Database & Auth**: Supabase (PostgreSQL schema with Row Level Security policies in `supabase/schema.sql`)
- **Payments**: Stripe Checkout & Subscriptions (`@stripe/stripe-js`)
- **QR Terminal**: `qrcode.react` (Encrypted digital pass & turnstile token generation)
- **Analytics & Charts**: `Recharts` (Area charts, Bar charts, Compound 1RM line graphs)
- **Icons**: `Lucide React`

---

## 🚀 How to Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Start Vite development server
npm run dev

# 3. Production build
npm run build
```

Open `http://localhost:3000` in your browser.

---

## 🗄️ Database Architecture (`supabase/schema.sql`)

Relational tables with strict PostgreSQL foreign keys and Row Level Security:
- `profiles`: Athletes, coaches, and admin profiles linked to Supabase Auth.
- `membership_plans`: Starter, Performance, Elite configurations with JSONB amenities.
- `memberships`: Subscriptions linked to Stripe billing IDs and auto-renewal.
- `attendance`: Biometric turnstile logs with 2-hour anti-duplicate check-in protection.
- `workout_plans`: Periodized splits created by trainers.
- `workout_exercises`: Exercise movement taxonomy, targets, and rest timers.
- `workout_logs`: Real-time logged sets, actual reps, and weight lifted by athletes.
- `member_progress`: Historical body mass, body fat percentage, and 1RM benchmarks.
- `payments`: Stripe transaction IDs, amounts, and settlement statuses.
- `notifications`: Real-time in-app alerts and notifications dropdown.