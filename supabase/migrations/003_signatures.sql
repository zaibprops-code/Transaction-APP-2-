-- CloseTrack: Enhanced Signature Infrastructure
-- Run AFTER 001_initial.sql in Supabase SQL editor

-- ============================================================
-- UPGRADE signature_requests table
-- ============================================================
alter table signature_requests
  add column if not exists title text not null default '',
  add column if not exists completed_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

-- Drop old status constraint and add extended set
alter table signature_requests
  drop constraint if exists signature_requests_status_check;
alter table signature_requests
  add constraint signature_requests_status_check
  check (status in ('pending','sent','viewed','partially_signed','completed','declined','expired','cancelled'));

-- ============================================================
-- SIGNATURE PARTICIPANTS
-- ============================================================
create table if not exists signature_participants (
  id uuid primary key default uuid_generate_v4(),
  request_id uuid not null references signature_requests(id) on delete cascade,
  client_id uuid references profiles(id) on delete set null,
  name text not null,
  email text not null,
  role text not null default 'external'
    check (role in ('buyer','seller','agent','lender','title_officer','coordinator','external')),
  signing_order integer not null default 0,
  status text not null default 'pending'
    check (status in ('pending','sent','viewed','signed','declined','expired')),
  signing_token uuid unique not null default uuid_generate_v4(),
  signed_at timestamptz,
  viewed_at timestamptz,
  reminder_sent_at timestamptz,
  ip_address text,
  device_info text,
  signature_data text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists signature_participants_request_id_idx on signature_participants(request_id);
create index if not exists signature_participants_token_idx on signature_participants(signing_token);

-- ============================================================
-- SIGNATURE FIELDS
-- ============================================================
create table if not exists signature_fields (
  id uuid primary key default uuid_generate_v4(),
  request_id uuid not null references signature_requests(id) on delete cascade,
  participant_id uuid references signature_participants(id) on delete set null,
  page integer not null default 1,
  field_type text not null default 'signature'
    check (field_type in ('signature','initials','date','text','checkbox','full_name')),
  x_percent numeric(6,3) not null default 10,
  y_percent numeric(6,3) not null default 80,
  width_percent numeric(6,3) not null default 20,
  height_percent numeric(6,3) not null default 5,
  required boolean not null default true,
  value text,
  label text,
  created_at timestamptz not null default now()
);

create index if not exists signature_fields_request_id_idx on signature_fields(request_id);

-- ============================================================
-- SIGNATURE AUDIT LOGS
-- ============================================================
create table if not exists signature_audit_logs (
  id uuid primary key default uuid_generate_v4(),
  request_id uuid not null references signature_requests(id) on delete cascade,
  participant_id uuid references signature_participants(id) on delete set null,
  action text not null,
  ip_address text,
  device_info text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists signature_audit_logs_request_id_idx on signature_audit_logs(request_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table signature_participants enable row level security;
alter table signature_fields enable row level security;
alter table signature_audit_logs enable row level security;

-- Org members can manage participants/fields/logs for their org's requests
create policy "sig_participants_org_access" on signature_participants
  for all using (
    request_id in (
      select id from signature_requests
      where org_id = (select org_id from profiles where id = auth.uid())
    )
  );

create policy "sig_fields_org_access" on signature_fields
  for all using (
    request_id in (
      select id from signature_requests
      where org_id = (select org_id from profiles where id = auth.uid())
    )
  );

create policy "sig_audit_org_access" on signature_audit_logs
  for all using (
    request_id in (
      select id from signature_requests
      where org_id = (select org_id from profiles where id = auth.uid())
    )
  );

-- Public signer access: read participant by token (no auth required)
create policy "sig_participants_public_read" on signature_participants
  for select using (true);

create policy "sig_participants_public_update" on signature_participants
  for update using (true);

create policy "sig_fields_public_read" on signature_fields
  for select using (true);

create policy "sig_fields_public_update" on signature_fields
  for update using (true);

create policy "sig_audit_public_insert" on signature_audit_logs
  for insert with check (true);

-- Public read of signature requests for signing flow
create policy "sig_requests_public_read" on signature_requests
  for select using (true);

-- ============================================================
-- Auto-update triggers
-- ============================================================
create trigger update_signature_requests_updated_at
  before update on signature_requests
  for each row execute function update_updated_at();

create trigger update_sig_participants_updated_at
  before update on signature_participants
  for each row execute function update_updated_at();
