-- ============================================================
-- CloseTrack — Seed Data
-- Run AFTER migrations. Replace UUIDs with real ones from your project.
-- NOTE: auth.users rows must be created via Supabase Dashboard or CLI:
--   supabase auth create-user --email admin@demo.closetrack.co --password Demo123!
-- ============================================================

-- Demo organization
insert into public.organizations (id, name, slug, brand_color, plan)
values ('00000000-0000-0000-0000-000000000001', 'CloseTrack Demo Brokerage', 'closetrack-demo', '#6366f1', 'growth')
on conflict (id) do nothing;

-- Demo profiles (create auth users first, then these rows auto-create via trigger,
-- OR insert manually with matching UUIDs from auth.users)

-- Demo clients
insert into public.clients (id, org_id, full_name, email, phone, portal_token, portal_enabled, portal_status, last_portal_visit)
values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'David & Emily Park', 'david.park@email.com', '(555) 123-4567', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', true, 'client_active', now() - interval '2 hours'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Michael Torres', 'm.torres@email.com', '(555) 234-5678', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', true, 'invite_sent', null),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Jennifer Walsh', 'j.walsh@email.com', '(555) 345-6789', 'c3d4e5f6-a7b8-9012-cdef-123456789012', false, 'invite_pending', null),
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Robert & Linda Kim', 'r.kim@email.com', '(555) 456-7890', 'd4e5f6a7-b8c9-0123-defa-234567890123', true, 'waiting_for_client', null),
  ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'Marcus & Sofia Chen', 'm.chen@email.com', '(555) 567-8901', 'e5f6a7b8-c9d0-1234-efab-345678901234', false, 'invite_pending', null)
on conflict (id) do nothing;

-- Demo deals
insert into public.deals (id, org_id, client_id, address, city, state, zip, property_type, buyer_name, buyer_email, seller_name, purchase_price, closing_date, contract_date, stage, status, health_score)
values
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '1847 Oakwood Drive', 'Austin', 'TX', '78701', 'single_family', 'David & Emily Park', 'david.park@email.com', 'John Smith', 875000, now() + interval '4 days', now() - interval '30 days', 'clear_to_close', 'active', 88),
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', '4520 Riverside Blvd', 'Austin', 'TX', '78702', 'condo', 'Michael Torres', 'm.torres@email.com', 'Sarah Lee', 485000, now() + interval '17 days', now() - interval '14 days', 'pending_docs', 'active', 62),
  ('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', '923 Maple Court', 'Round Rock', 'TX', '78664', 'single_family', 'Jennifer Walsh', 'j.walsh@email.com', 'Mike Davis', 392000, now() + interval '10 days', now() - interval '21 days', 'due_diligence', 'active', 45),
  ('20000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', '2291 Sunset Hills', 'Cedar Park', 'TX', '78613', 'townhouse', 'Robert & Linda Kim', 'r.kim@email.com', 'Alice Brown', 625000, now() + interval '22 days', now() - interval '5 days', 'under_contract', 'active', 78),
  ('20000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000005', '7834 Crystal Lake Dr', 'Pflugerville', 'TX', '78660', 'single_family', 'Marcus & Sofia Chen', 'm.chen@email.com', 'Tom Wilson', 540000, now() + interval '35 days', now() - interval '2 days', 'new_lead', 'active', 91),
  ('20000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', null, '156 Commerce St #4B', 'Austin', 'TX', '78701', 'commercial', 'Westlake Investments LLC', 'invest@westlake.com', 'Downtown Holdings', 1200000, now() + interval '45 days', now() - interval '1 day', 'under_contract', 'active', 74)
on conflict (id) do nothing;

-- Demo tasks
insert into public.tasks (id, org_id, deal_id, title, description, status, priority, due_date)
values
  ('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Final walk-through scheduled', 'Confirm with buyer and listing agent', 'pending', 'high', now() + interval '2 days'),
  ('30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Wire transfer instructions sent', 'Send wiring instructions to title company', 'completed', 'critical', now() - interval '1 day'),
  ('30000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'Collect seller disclosure forms', 'Request all required disclosure documents', 'blocked', 'high', now() - interval '2 days'),
  ('30000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'Follow up on HOA documents', 'Contact HOA for current meeting minutes and financial statements', 'pending', 'medium', now() + interval '1 day'),
  ('30000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', 'Schedule home inspection', 'Book inspection with preferred inspector', 'pending', 'critical', now() - interval '3 days'),
  ('30000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', 'Review purchase agreement amendments', 'Check all addendums are signed', 'pending', 'high', now() + interval '3 days'),
  ('30000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000004', 'Obtain homeowners insurance quote', 'Buyer needs 3 quotes for lender approval', 'in_progress', 'medium', now() + interval '5 days'),
  ('30000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000005', 'Upload earnest money receipt', 'Scan and upload to deal documents', 'pending', 'low', now() + interval '7 days')
on conflict (id) do nothing;

-- Demo documents (metadata only — no actual files)
insert into public.documents (id, org_id, deal_id, name, category, file_path, file_size, mime_type, is_signed)
values
  ('40000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Purchase Agreement - 1847 Oakwood.pdf', 'purchase_agreement', 'org-1/deal-1/purchase-agreement.pdf', 2457600, 'application/pdf', true),
  ('40000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Seller Disclosure - 1847 Oakwood.pdf', 'disclosure', 'org-1/deal-1/seller-disclosure.pdf', 1024000, 'application/pdf', true),
  ('40000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Inspection Report - 1847 Oakwood.pdf', 'inspection', 'org-1/deal-1/inspection-report.pdf', 4915200, 'application/pdf', false),
  ('40000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'Purchase Agreement - 4520 Riverside.pdf', 'purchase_agreement', 'org-1/deal-2/purchase-agreement.pdf', 2097152, 'application/pdf', true),
  ('40000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'HOA Documents - Riverside.pdf', 'other', 'org-1/deal-2/hoa-docs.pdf', 819200, 'application/pdf', false),
  ('40000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', 'Loan Pre-Approval Letter.pdf', 'financing', 'org-1/deal-3/loan-preapproval.pdf', 512000, 'application/pdf', false),
  ('40000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000004', 'Title Commitment - Sunset Hills.pdf', 'title', 'org-1/deal-4/title-commitment.pdf', 1638400, 'application/pdf', false)
on conflict (id) do nothing;

-- Demo deal timeline events
insert into public.deal_timeline (deal_id, type, title, description)
values
  ('20000000-0000-0000-0000-000000000001', 'stage_change', 'Stage: Clear to Close', 'Deal reached Clear to Close — all contingencies satisfied'),
  ('20000000-0000-0000-0000-000000000001', 'document', 'Inspection Report Uploaded', 'Home inspection completed, report uploaded'),
  ('20000000-0000-0000-0000-000000000001', 'stage_change', 'Stage: Pending Docs', 'Moved to Pending Docs stage'),
  ('20000000-0000-0000-0000-000000000001', 'stage_change', 'Stage: Due Diligence', 'Entered due diligence period'),
  ('20000000-0000-0000-0000-000000000001', 'stage_change', 'Stage: Under Contract', 'Purchase agreement fully executed'),
  ('20000000-0000-0000-0000-000000000001', 'stage_change', 'Stage: New Lead', 'Deal created'),
  ('20000000-0000-0000-0000-000000000002', 'stage_change', 'Stage: Pending Docs', 'Awaiting seller disclosure package'),
  ('20000000-0000-0000-0000-000000000002', 'stage_change', 'Stage: Under Contract', 'Contract signed by all parties')
on conflict do nothing;
