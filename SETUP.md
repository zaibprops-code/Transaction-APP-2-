# CloseTrack — Backend Setup Guide

## Prerequisites
- Supabase account (supabase.com)
- Node.js 18+
- Vercel account (for deployment)

---

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) → New Project
2. Choose a region close to your users
3. Set a strong database password and save it

---

## 2. Run Database Migrations

In the Supabase Dashboard → SQL Editor, run the migration file:

```bash
# Via Supabase CLI (recommended)
npx supabase db push

# Or paste the contents of:
supabase/migrations/001_initial_schema.sql
```

---

## 3. Create Storage Buckets

In Supabase Dashboard → Storage → New bucket:

| Bucket name     | Public | Purpose                          |
|-----------------|--------|----------------------------------|
| `documents`     | No     | Deal contracts & agreements      |
| `property-media`| No     | Property photos & videos         |
| `avatars`       | Yes    | User & client profile photos     |
| `portal-assets` | Yes    | Portal branding & logos          |

### Storage RLS Policies (run in SQL Editor)

```sql
-- Allow org members to upload to documents bucket
create policy "org_members_upload_documents"
on storage.objects for insert
with check (
  bucket_id = 'documents' and
  (storage.foldername(name))[1] = (select org_id::text from public.profiles where id = auth.uid())
);

create policy "org_members_read_documents"
on storage.objects for select
using (
  bucket_id = 'documents' and
  (storage.foldername(name))[1] = (select org_id::text from public.profiles where id = auth.uid())
);

-- Allow public access to avatars
create policy "public_read_avatars"
on storage.objects for select
using (bucket_id = 'avatars');

create policy "authenticated_upload_avatars"
on storage.objects for insert
with check (bucket_id = 'avatars' and auth.uid() is not null);
```

---

## 4. Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key       # Project Settings > API
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key   # Project Settings > API (never expose client-side)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
RESEND_API_KEY=re_xxxx                             # resend.com for email
EMAIL_FROM=CloseTrack <hello@yourdomain.com>
```

Optional:
```
OPENAI_API_KEY=sk-...   # For AI features
ANTHROPIC_API_KEY=sk-ant-...  # For Claude AI
```

---

## 5. Load Seed Data (Optional)

To load demo data into your database:

```sql
-- Run in Supabase SQL Editor:
-- Contents of supabase/seed.sql

-- NOTE: Create auth users first via Dashboard (Authentication > Users)
-- or via CLI: supabase auth create-user --email admin@demo.closetrack.co --password Demo123!
-- Then update the profile UUIDs in seed.sql to match the created users
```

---

## 6. Email Setup (Resend)

1. Sign up at [resend.com](https://resend.com)
2. Add and verify your sending domain
3. Create an API key → paste into `RESEND_API_KEY`
4. Update `EMAIL_FROM` to use your verified domain

---

## 7. Run Locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`

- **Demo mode**: Leave `NEXT_PUBLIC_SUPABASE_URL` as the placeholder — app runs with mock data
- **Live mode**: Set real Supabase credentials — full backend enabled

---

## 8. Deploy to Vercel

```bash
vercel deploy
```

Add all environment variables in Vercel Dashboard → Project → Settings → Environment Variables.

Enable Supabase Realtime for your tables:
- Supabase Dashboard → Database → Replication → Enable for: `deals`, `tasks`, `notifications`, `messages`

---

## Database Schema Overview

| Table            | Purpose                                    |
|------------------|--------------------------------------------|
| `organizations`  | Multi-tenant brokerage accounts            |
| `profiles`       | Users (extends Supabase auth.users)        |
| `clients`        | Buyer/seller clients with portal access    |
| `deals`          | Transaction records                        |
| `tasks`          | Per-deal and global task management        |
| `documents`      | Document metadata (files in Storage)       |
| `messages`       | Internal deal thread messages              |
| `portal_messages`| Client-facing portal messages              |
| `activity_log`   | Full audit trail for all actions           |
| `notifications`  | In-app notification system                 |
| `signatures`     | E-signature tracking                       |
| `deal_timeline`  | Visual timeline of deal progress           |

---

## Architecture Notes

- **Demo mode**: When `NEXT_PUBLIC_SUPABASE_URL` is unset or placeholder, `isDemo()` returns `true` — all pages and API routes fall back to `lib/mock-data.ts`
- **Auth**: Supabase Auth handles session management. Middleware at `middleware.ts` protects all `/(dashboard)` routes
- **Multi-tenancy**: All tables have `org_id` FK. RLS ensures cross-tenant data isolation automatically
- **Realtime**: `lib/hooks/useRealtime*.ts` hooks subscribe to Postgres changes for live updates
- **Email**: `lib/email.ts` wraps Resend API. Falls back to console.log when `RESEND_API_KEY` is unset
