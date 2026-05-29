-- ============================================================
-- CloseTrack — Initial Schema Migration
-- Production-grade multi-tenant real estate transaction SaaS
-- ============================================================

-- ─── Extensions ─────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pg_cron";

-- ─── Organizations ──────────────────────────────────────────
create table public.organizations (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  slug          text not null unique,
  logo_url      text,
  brand_color   text default '#6366f1',
  plan          text not null default 'starter' check (plan in ('starter','growth','enterprise')),
  settings      jsonb not null default '{}',
  created_at    timestamptz not null default now()
);

-- ─── Profiles (extends auth.users) ──────────────────────────
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  org_id        uuid not null references public.organizations(id) on delete cascade,
  full_name     text not null,
  email         text not null,
  avatar_url    text,
  role          text not null default 'agent'
                  check (role in ('brokerage_owner','admin','team_coordinator','agent','assistant','client')),
  title         text,
  phone         text,
  preferences   jsonb not null default '{}',
  created_at    timestamptz not null default now()
);
create index idx_profiles_org on public.profiles(org_id);

-- ─── Clients ────────────────────────────────────────────────
create table public.clients (
  id                uuid primary key default uuid_generate_v4(),
  org_id            uuid not null references public.organizations(id) on delete cascade,
  full_name         text not null,
  email             text,
  phone             text,
  avatar_url        text,
  portal_token      uuid not null unique default uuid_generate_v4(),
  portal_enabled    boolean not null default false,
  portal_status     text not null default 'invite_pending'
                      check (portal_status in ('invite_pending','invite_sent','waiting_for_client','client_active','disabled')),
  last_portal_visit timestamptz,
  notes             text,
  created_at        timestamptz not null default now()
);
create index idx_clients_org on public.clients(org_id);
create unique index idx_clients_portal_token on public.clients(portal_token);

-- ─── Deals ──────────────────────────────────────────────────
create table public.deals (
  id              uuid primary key default uuid_generate_v4(),
  org_id          uuid not null references public.organizations(id) on delete cascade,
  client_id       uuid references public.clients(id) on delete set null,
  assigned_to     uuid references public.profiles(id) on delete set null,
  created_by      uuid references public.profiles(id) on delete set null,

  -- Property
  address         text not null,
  city            text not null,
  state           text not null,
  zip             text,
  property_type   text not null default 'single_family'
                    check (property_type in ('single_family','condo','townhouse','multi_family','commercial','land','other')),

  -- Parties
  buyer_name      text not null,
  buyer_email     text,
  buyer_phone     text,
  seller_name     text not null default '',
  seller_email    text,
  seller_phone    text,
  listing_agent   text,
  buyers_agent    text,

  -- Financials
  purchase_price  numeric(12,2) not null default 0,
  earnest_money   numeric(12,2),
  down_payment    numeric(12,2),
  loan_amount     numeric(12,2),

  -- Dates
  closing_date    date not null,
  contract_date   date,

  -- Status
  stage           text not null default 'new_lead'
                    check (stage in ('new_lead','under_contract','due_diligence','pending_docs','clear_to_close','closed','cancelled')),
  status          text not null default 'active'
                    check (status in ('active','closed','cancelled','on_hold','archived')),
  health_score    integer not null default 80 check (health_score between 0 and 100),

  -- Counts (denormalized for perf)
  task_count      integer not null default 0,
  doc_count       integer not null default 0,
  pending_sigs    integer not null default 0,

  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index idx_deals_org_status on public.deals(org_id, status, stage);
create index idx_deals_client on public.deals(client_id);
create index idx_deals_assigned on public.deals(assigned_to);
create index idx_deals_closing on public.deals(closing_date);

-- ─── Tasks ──────────────────────────────────────────────────
create table public.tasks (
  id            uuid primary key default uuid_generate_v4(),
  org_id        uuid not null references public.organizations(id) on delete cascade,
  deal_id       uuid references public.deals(id) on delete cascade,
  assigned_to   uuid references public.profiles(id) on delete set null,
  created_by    uuid references public.profiles(id) on delete set null,

  title         text not null,
  description   text,
  status        text not null default 'pending'
                  check (status in ('pending','in_progress','completed','cancelled','blocked')),
  priority      text not null default 'medium'
                  check (priority in ('critical','high','medium','low')),
  due_date      timestamptz not null,
  completed_at  timestamptz,
  tags          text[] not null default '{}',
  dependencies  uuid[] not null default '{}',

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index idx_tasks_org_status on public.tasks(org_id, status, due_date);
create index idx_tasks_deal on public.tasks(deal_id);
create index idx_tasks_assigned on public.tasks(assigned_to);

-- ─── Documents ──────────────────────────────────────────────
create table public.documents (
  id            uuid primary key default uuid_generate_v4(),
  org_id        uuid not null references public.organizations(id) on delete cascade,
  deal_id       uuid references public.deals(id) on delete cascade,
  client_id     uuid references public.clients(id) on delete set null,
  uploaded_by   uuid references public.profiles(id) on delete set null,

  name          text not null,
  category      text not null default 'other'
                  check (category in ('purchase_agreement','disclosure','inspection','title','financing','closing','addendum','other')),
  file_path     text not null,
  file_size     bigint not null default 0,
  mime_type     text not null default 'application/octet-stream',
  is_signed     boolean not null default false,
  ai_extracted  jsonb,
  version       integer not null default 1,

  created_at    timestamptz not null default now()
);
create index idx_documents_org on public.documents(org_id, deal_id);
create index idx_documents_deal on public.documents(deal_id);

-- ─── Messages (internal / deal thread) ──────────────────────
create table public.messages (
  id          uuid primary key default uuid_generate_v4(),
  org_id      uuid not null references public.organizations(id) on delete cascade,
  deal_id     uuid references public.deals(id) on delete cascade,
  sender_id   uuid references public.profiles(id) on delete set null,

  content     text not null,
  is_read     boolean not null default false,

  created_at  timestamptz not null default now()
);
create index idx_messages_deal on public.messages(deal_id, created_at desc);

-- ─── Portal Messages (client-facing) ────────────────────────
create table public.portal_messages (
  id           uuid primary key default uuid_generate_v4(),
  org_id       uuid not null references public.organizations(id) on delete cascade,
  client_id    uuid not null references public.clients(id) on delete cascade,
  deal_id      uuid references public.deals(id) on delete cascade,
  sender_id    uuid references public.profiles(id) on delete set null,

  sender_type  text not null check (sender_type in ('agent','client')),
  content      text not null,
  is_read      boolean not null default false,

  created_at   timestamptz not null default now()
);
create index idx_portal_messages_client on public.portal_messages(client_id, created_at desc);

-- ─── Activity Log ───────────────────────────────────────────
create table public.activity_log (
  id           uuid primary key default uuid_generate_v4(),
  org_id       uuid not null references public.organizations(id) on delete cascade,
  user_id      uuid references public.profiles(id) on delete set null,
  deal_id      uuid references public.deals(id) on delete cascade,
  task_id      uuid references public.tasks(id) on delete cascade,
  document_id  uuid references public.documents(id) on delete cascade,
  client_id    uuid references public.clients(id) on delete cascade,

  action       text not null,      -- 'created','updated','stage_changed','completed', etc.
  entity_type  text not null,      -- 'deal','task','document','message', etc.
  entity_id    uuid,
  description  text not null default '',
  metadata     jsonb not null default '{}',

  created_at   timestamptz not null default now()
);
create index idx_activity_org on public.activity_log(org_id, created_at desc);
create index idx_activity_deal on public.activity_log(deal_id, created_at desc);

-- ─── Notifications ───────────────────────────────────────────
create table public.notifications (
  id         uuid primary key default uuid_generate_v4(),
  org_id     uuid not null references public.organizations(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,

  type       text not null
               check (type in ('task_due','signature_needed','document_uploaded','deal_stage_changed','ai_insight','message_received','closing_reminder','portal_activity')),
  title      text not null,
  message    text not null,
  read       boolean not null default false,
  action_url text,

  created_at timestamptz not null default now()
);
create index idx_notifications_user on public.notifications(user_id, read, created_at desc);

-- ─── Signatures ──────────────────────────────────────────────
create table public.signatures (
  id            uuid primary key default uuid_generate_v4(),
  org_id        uuid not null references public.organizations(id) on delete cascade,
  deal_id       uuid not null references public.deals(id) on delete cascade,
  document_id   uuid references public.documents(id) on delete set null,
  created_by    uuid references public.profiles(id) on delete set null,

  title         text not null,
  status        text not null default 'pending'
                  check (status in ('pending','sent','viewed','signed','declined','expired')),
  signer_name   text not null,
  signer_email  text not null,
  signing_url   text,
  sent_at       timestamptz,
  signed_at     timestamptz,
  expires_at    timestamptz,

  signers       jsonb not null default '[]',
  audit_trail   jsonb not null default '[]',

  created_at    timestamptz not null default now()
);
create index idx_signatures_deal on public.signatures(deal_id);
create index idx_signatures_org on public.signatures(org_id, status);

-- ─── Deal Timeline ───────────────────────────────────────────
create table public.deal_timeline (
  id          uuid primary key default uuid_generate_v4(),
  deal_id     uuid not null references public.deals(id) on delete cascade,
  user_id     uuid references public.profiles(id) on delete set null,

  type        text not null,    -- 'stage_change','note','document','task','message', etc.
  title       text not null,
  description text,
  metadata    jsonb not null default '{}',

  created_at  timestamptz not null default now()
);
create index idx_timeline_deal on public.deal_timeline(deal_id, created_at desc);

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Get organization ID for the current auth user
create or replace function public.get_my_org_id()
returns uuid
language sql stable security definer
as $$
  select org_id from public.profiles where id = auth.uid()
$$;

-- Validate a portal token and return the client id
create or replace function public.get_portal_client_id(token uuid)
returns uuid
language sql stable security definer
as $$
  select id from public.clients
  where portal_token = token and portal_enabled = true
  limit 1
$$;

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger deals_updated_at
  before update on public.deals
  for each row execute function public.set_updated_at();

create trigger tasks_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

-- Log deal stage changes automatically
create or replace function public.log_deal_stage_change()
returns trigger language plpgsql security definer as $$
begin
  if old.stage <> new.stage then
    insert into public.activity_log(org_id, deal_id, action, entity_type, entity_id, description, metadata)
    values (
      new.org_id,
      new.id,
      'stage_changed',
      'deal',
      new.id,
      'Deal moved from ' || old.stage || ' to ' || new.stage,
      jsonb_build_object('from_stage', old.stage, 'to_stage', new.stage)
    );

    insert into public.deal_timeline(deal_id, type, title, description, metadata)
    values (
      new.id,
      'stage_change',
      'Stage updated',
      'Moved from ' || old.stage || ' to ' || new.stage,
      jsonb_build_object('from_stage', old.stage, 'to_stage', new.stage)
    );
  end if;
  return new;
end;
$$;

create trigger deal_stage_change_log
  after update on public.deals
  for each row execute function public.log_deal_stage_change();

-- Maintain deal task_count / doc_count denormalized columns
create or replace function public.sync_deal_task_count()
returns trigger language plpgsql security definer as $$
declare v_deal_id uuid;
begin
  v_deal_id := coalesce(new.deal_id, old.deal_id);
  if v_deal_id is not null then
    update public.deals
    set task_count = (select count(*) from public.tasks where deal_id = v_deal_id and status <> 'cancelled')
    where id = v_deal_id;
  end if;
  return null;
end;
$$;

create trigger sync_task_count_insert
  after insert on public.tasks for each row execute function public.sync_deal_task_count();
create trigger sync_task_count_delete
  after delete on public.tasks for each row execute function public.sync_deal_task_count();
create trigger sync_task_count_update
  after update of deal_id, status on public.tasks for each row execute function public.sync_deal_task_count();

create or replace function public.sync_deal_doc_count()
returns trigger language plpgsql security definer as $$
declare v_deal_id uuid;
begin
  v_deal_id := coalesce(new.deal_id, old.deal_id);
  if v_deal_id is not null then
    update public.deals
    set doc_count = (select count(*) from public.documents where deal_id = v_deal_id)
    where id = v_deal_id;
  end if;
  return null;
end;
$$;

create trigger sync_doc_count_insert
  after insert on public.documents for each row execute function public.sync_deal_doc_count();
create trigger sync_doc_count_delete
  after delete on public.documents for each row execute function public.sync_deal_doc_count();

-- Auto-create profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
declare
  v_org_id uuid;
  v_org_name text;
begin
  -- Use org_id from metadata if provided (invite flow), else create new org
  if new.raw_user_meta_data->>'org_id' is not null then
    v_org_id := (new.raw_user_meta_data->>'org_id')::uuid;
  else
    v_org_name := coalesce(new.raw_user_meta_data->>'org_name', split_part(new.email, '@', 2));
    insert into public.organizations(name, slug)
    values (v_org_name, lower(regexp_replace(v_org_name, '[^a-z0-9]', '-', 'g')) || '-' || substring(new.id::text, 1, 8))
    returning id into v_org_id;
  end if;

  insert into public.profiles(id, org_id, full_name, email, role)
  values (
    new.id,
    v_org_id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'team_coordinator')
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.organizations    enable row level security;
alter table public.profiles         enable row level security;
alter table public.clients          enable row level security;
alter table public.deals            enable row level security;
alter table public.tasks            enable row level security;
alter table public.documents        enable row level security;
alter table public.messages         enable row level security;
alter table public.portal_messages  enable row level security;
alter table public.activity_log     enable row level security;
alter table public.notifications    enable row level security;
alter table public.signatures       enable row level security;
alter table public.deal_timeline    enable row level security;

-- Organizations: members see their own org
create policy "org_members_select" on public.organizations
  for select using (id = public.get_my_org_id());

-- Profiles: org members see each other
create policy "profiles_select" on public.profiles
  for select using (org_id = public.get_my_org_id());

create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid());

-- Clients
create policy "clients_select" on public.clients
  for select using (org_id = public.get_my_org_id());

create policy "clients_insert" on public.clients
  for insert with check (org_id = public.get_my_org_id());

create policy "clients_update" on public.clients
  for update using (org_id = public.get_my_org_id());

-- Deals
create policy "deals_select" on public.deals
  for select using (org_id = public.get_my_org_id());

create policy "deals_insert" on public.deals
  for insert with check (org_id = public.get_my_org_id());

create policy "deals_update" on public.deals
  for update using (org_id = public.get_my_org_id());

create policy "deals_delete" on public.deals
  for delete using (org_id = public.get_my_org_id());

-- Tasks
create policy "tasks_select" on public.tasks
  for select using (org_id = public.get_my_org_id());

create policy "tasks_insert" on public.tasks
  for insert with check (org_id = public.get_my_org_id());

create policy "tasks_update" on public.tasks
  for update using (org_id = public.get_my_org_id());

create policy "tasks_delete" on public.tasks
  for delete using (org_id = public.get_my_org_id());

-- Documents
create policy "documents_select" on public.documents
  for select using (org_id = public.get_my_org_id());

create policy "documents_insert" on public.documents
  for insert with check (org_id = public.get_my_org_id());

create policy "documents_delete" on public.documents
  for delete using (org_id = public.get_my_org_id());

-- Messages
create policy "messages_select" on public.messages
  for select using (org_id = public.get_my_org_id());

create policy "messages_insert" on public.messages
  for insert with check (org_id = public.get_my_org_id());

-- Portal messages: agents can see/send, client view via portal token (service role for portal API)
create policy "portal_messages_select" on public.portal_messages
  for select using (org_id = public.get_my_org_id());

create policy "portal_messages_insert" on public.portal_messages
  for insert with check (org_id = public.get_my_org_id());

-- Activity log
create policy "activity_select" on public.activity_log
  for select using (org_id = public.get_my_org_id());

-- Notifications: users see their own
create policy "notifications_select" on public.notifications
  for select using (user_id = auth.uid());

create policy "notifications_update" on public.notifications
  for update using (user_id = auth.uid());

-- Signatures
create policy "signatures_select" on public.signatures
  for select using (org_id = public.get_my_org_id());

create policy "signatures_insert" on public.signatures
  for insert with check (org_id = public.get_my_org_id());

create policy "signatures_update" on public.signatures
  for update using (org_id = public.get_my_org_id());

-- Deal timeline
create policy "timeline_select" on public.deal_timeline
  for select using (
    deal_id in (select id from public.deals where org_id = public.get_my_org_id())
  );

-- ============================================================
-- STORAGE BUCKETS
-- Note: Create these manually in Supabase Dashboard > Storage
-- or via the CLI: supabase storage create <bucket-name>
-- ============================================================
-- documents       → private  (deal contracts, agreements)
-- property-media  → private  (photos, videos)
-- avatars         → public   (user and client profile photos)
-- portal-assets   → public   (portal branding, logos)

-- Storage RLS (run after creating buckets):
-- insert into storage.buckets (id, name, public) values ('documents', 'documents', false);
-- insert into storage.buckets (id, name, public) values ('property-media', 'property-media', false);
-- insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);
-- insert into storage.buckets (id, name, public) values ('portal-assets', 'portal-assets', true);
