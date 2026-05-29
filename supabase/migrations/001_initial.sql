-- Strata: Initial Schema
-- Run this in your Supabase SQL editor to set up the database

-- Enable extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- ============================================================
-- ORGANIZATIONS (multi-tenant)
-- ============================================================
create table organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  plan text not null default 'starter' check (plan in ('starter', 'growth', 'enterprise')),
  settings jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  org_id uuid references organizations(id) on delete set null,
  role text not null default 'team_coordinator'
    check (role in ('solo_coordinator', 'agent', 'team_coordinator', 'brokerage_admin', 'enterprise_admin', 'client', 'platform_admin')),
  full_name text not null default '',
  email text not null default '',
  avatar_url text,
  title text,
  phone text,
  preferences jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- DEALS
-- ============================================================
create table deals (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  address text not null,
  city text not null default '',
  state text not null default '',
  zip text not null default '',
  property_type text not null default 'single_family'
    check (property_type in ('single_family','condo','townhouse','multi_family','commercial','land','other')),
  status text not null default 'active'
    check (status in ('active','closed','cancelled','on_hold')),
  stage text not null default 'new_lead'
    check (stage in ('new_lead','under_contract','due_diligence','pending_docs','clear_to_close','closed','cancelled')),
  buyer_name text not null default '',
  buyer_email text,
  buyer_phone text,
  seller_name text not null default '',
  seller_email text,
  seller_phone text,
  listing_agent text,
  buyers_agent text,
  purchase_price numeric(15,2) not null default 0,
  closing_date date,
  contract_date date,
  earnest_money numeric(15,2),
  down_payment numeric(15,2),
  loan_amount numeric(15,2),
  health_score integer not null default 80 check (health_score between 0 and 100),
  health_factors jsonb not null default '[]',
  assigned_to uuid references profiles(id) on delete set null,
  created_by uuid not null references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index deals_org_id_idx on deals(org_id);
create index deals_stage_idx on deals(stage);
create index deals_status_idx on deals(status);
create index deals_closing_date_idx on deals(closing_date);

-- ============================================================
-- TASKS
-- ============================================================
create table tasks (
  id uuid primary key default uuid_generate_v4(),
  deal_id uuid references deals(id) on delete cascade,
  org_id uuid not null references organizations(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'pending'
    check (status in ('pending','in_progress','completed','cancelled','blocked')),
  priority text not null default 'medium'
    check (priority in ('critical','high','medium','low')),
  assigned_to uuid references profiles(id) on delete set null,
  due_date date,
  completed_at timestamptz,
  dependencies jsonb not null default '[]',
  tags jsonb not null default '[]',
  created_by uuid not null references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index tasks_deal_id_idx on tasks(deal_id);
create index tasks_org_id_idx on tasks(org_id);
create index tasks_due_date_idx on tasks(due_date);
create index tasks_status_idx on tasks(status);

-- ============================================================
-- DOCUMENTS
-- ============================================================
create table documents (
  id uuid primary key default uuid_generate_v4(),
  deal_id uuid references deals(id) on delete cascade,
  org_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  file_path text not null,
  file_size bigint not null default 0,
  mime_type text not null default 'application/pdf',
  category text not null default 'other'
    check (category in ('purchase_agreement','disclosure','inspection','title','financing','closing','addendum','other')),
  ai_extracted jsonb,
  uploaded_by uuid not null references profiles(id),
  version integer not null default 1,
  is_signed boolean not null default false,
  created_at timestamptz not null default now()
);

create index documents_deal_id_idx on documents(deal_id);
create index documents_org_id_idx on documents(org_id);

-- ============================================================
-- SIGNATURE REQUESTS
-- ============================================================
create table signature_requests (
  id uuid primary key default uuid_generate_v4(),
  deal_id uuid references deals(id) on delete cascade,
  org_id uuid not null references organizations(id) on delete cascade,
  document_id uuid references documents(id) on delete set null,
  signers jsonb not null default '[]',
  status text not null default 'pending'
    check (status in ('pending','sent','viewed','signed','declined','expired')),
  expires_at timestamptz,
  audit_trail jsonb not null default '[]',
  created_by uuid not null references profiles(id),
  created_at timestamptz not null default now()
);

-- ============================================================
-- COMMUNICATIONS
-- ============================================================
create table communications (
  id uuid primary key default uuid_generate_v4(),
  deal_id uuid references deals(id) on delete cascade,
  org_id uuid not null references organizations(id) on delete cascade,
  type text not null default 'email'
    check (type in ('email','sms','note','call_log')),
  subject text not null default '',
  body text not null default '',
  from_email text not null,
  from_name text,
  to_emails jsonb not null default '[]',
  status text not null default 'draft'
    check (status in ('draft','sent','delivered','failed')),
  sent_at timestamptz,
  thread_id uuid,
  created_at timestamptz not null default now()
);

-- ============================================================
-- AI CONVERSATIONS
-- ============================================================
create table ai_conversations (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  deal_id uuid references deals(id) on delete set null,
  messages jsonb not null default '[]',
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- ACTIVITIES
-- ============================================================
create table activities (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  deal_id uuid references deals(id) on delete cascade,
  user_id uuid references profiles(id) on delete set null,
  type text not null,
  description text not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index activities_org_id_idx on activities(org_id);
create index activities_deal_id_idx on activities(deal_id);
create index activities_created_at_idx on activities(created_at desc);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
create table notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  org_id uuid not null references organizations(id) on delete cascade,
  type text not null,
  title text not null,
  message text not null,
  read boolean not null default false,
  action_url text,
  created_at timestamptz not null default now()
);

create index notifications_user_id_idx on notifications(user_id);
create index notifications_read_idx on notifications(read) where read = false;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table organizations enable row level security;
alter table profiles enable row level security;
alter table deals enable row level security;
alter table tasks enable row level security;
alter table documents enable row level security;
alter table signature_requests enable row level security;
alter table communications enable row level security;
alter table activities enable row level security;
alter table notifications enable row level security;

-- Profiles: users can see profiles in their org
create policy "profiles_org_access" on profiles
  for all using (
    org_id = (select org_id from profiles where id = auth.uid())
  );

-- Deals: org-scoped access
create policy "deals_org_access" on deals
  for all using (
    org_id = (select org_id from profiles where id = auth.uid())
  );

-- Tasks: org-scoped access
create policy "tasks_org_access" on tasks
  for all using (
    org_id = (select org_id from profiles where id = auth.uid())
  );

-- Documents: org-scoped access
create policy "documents_org_access" on documents
  for all using (
    org_id = (select org_id from profiles where id = auth.uid())
  );

-- Notifications: user-scoped
create policy "notifications_user_access" on notifications
  for all using (user_id = auth.uid());

-- ============================================================
-- AUTO-UPDATE updated_at
-- ============================================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_organizations_updated_at before update on organizations
  for each row execute function update_updated_at();

create trigger update_profiles_updated_at before update on profiles
  for each row execute function update_updated_at();

create trigger update_deals_updated_at before update on deals
  for each row execute function update_updated_at();

create trigger update_tasks_updated_at before update on tasks
  for each row execute function update_updated_at();
