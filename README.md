# Strata — The AI Operating System for Real Estate Transactions

> Close more deals. Coordinate everything. AI does the rest.

Strata is a world-class, AI-native SaaS platform for real estate transaction coordinators, agents, and brokerages. Built with Next.js 15, TypeScript, Tailwind CSS, Framer Motion, and Supabase.

---

## Features

- **AI Transaction Intelligence** — Deal health scoring, contract analysis, risk detection
- **Deal Pipeline** — Kanban board with drag-and-drop, deal workspace with full history
- **Task Management** — Priority-based task queues with AI-generated checklists
- **Document Hub** — AI extraction, categorization, version control
- **E-Signatures** — Multi-party signing with audit trail
- **Client Portal** — Branded, passwordless portal for buyers/sellers
- **Analytics** — Deep performance analytics with Recharts
- **AI Assistant** — GPT-4o powered chat with full deal context
- **Team Management** — Role-based permissions, team analytics
- **Demo Mode** — Works fully without Supabase (uses mock data)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v3 |
| Animations | Framer Motion |
| UI Primitives | Radix UI |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Charts | Recharts |
| State | Zustand |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |
| Toasts | Sonner |

---

## Getting Started

### 1. Clone and install

```bash
git clone <repo-url>
cd strata
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_api_key
```

> **Note:** Without Supabase env vars, the app runs in **demo mode** with realistic mock data — perfect for development and demos.

### 3. Set up the database (optional)

Run the migration in your Supabase SQL editor:

```bash
# Copy contents of supabase/migrations/001_initial.sql
# Paste and run in Supabase Dashboard > SQL Editor
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
app/
├── (marketing)/     # Landing page, pricing
├── (auth)/          # Login, signup, onboarding
└── (dashboard)/     # Main application

components/
├── ui/              # Design system primitives
├── landing/         # Marketing components
├── dashboard/       # Dashboard shell
├── deals/           # Deal management
├── tasks/           # Task system
├── documents/       # Document management
├── ai/              # AI assistant
└── charts/          # Analytics charts

lib/
├── mock-data.ts     # Demo data
├── utils.ts         # Utility functions
└── constants.ts     # App constants

supabase/
└── migrations/      # SQL schema
```

---

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/login` | Sign in |
| `/signup` | Create account |
| `/onboarding` | Multi-step setup |
| `/dashboard` | Main dashboard |
| `/deals` | Pipeline board |
| `/deals/[id]` | Deal workspace |
| `/tasks` | Task management |
| `/documents` | Document hub |
| `/signatures` | E-signatures |
| `/communications` | Messaging |
| `/clients` | Client directory |
| `/ai` | AI assistant |
| `/analytics` | Analytics |
| `/settings` | Settings |

---

## Demo Mode

When `NEXT_PUBLIC_SUPABASE_URL` is not set, the app automatically uses mock data with:

- 8 realistic real estate deals at various stages
- 10 tasks with priorities and due dates
- 8 documents across multiple categories
- 2 signature requests in progress
- Activity feed and notifications
- Analytics data for all charts

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | No* | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No* | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | No* | Service role key (server-side) |
| `OPENAI_API_KEY` | No* | For real AI responses |
| `NEXT_PUBLIC_APP_URL` | No | App URL for OG tags |
| `RESEND_API_KEY` | No | Email delivery |
| `STRIPE_SECRET_KEY` | No | Billing |

*App runs in demo mode without these

---

## License

MIT © Strata Inc.
