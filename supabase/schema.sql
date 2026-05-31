-- Run this in the Supabase SQL editor (Dashboard → SQL Editor → New query)

-- Applications table
create table if not exists applications (
  id               uuid primary key default gen_random_uuid(),
  application_id   text unique not null,
  admin_token      text unique not null,
  submitted_at     timestamptz not null default now(),
  data             jsonb not null,
  files            jsonb not null default '{}'
);

-- Index for fast token lookups (used by the admin page)
create index if not exists applications_admin_token_idx
  on applications (admin_token);

-- Inquiries table — questions/requests submitted from the "Keni pyetje?" chat widget
create table if not exists inquiries (
  id               uuid primary key default gen_random_uuid(),
  inquiry_id       text unique not null,
  created_at       timestamptz not null default now(),
  email            text not null,
  category         text not null,
  subject          text not null,
  message          text not null,
  application_id   text,            -- optional link to an in-progress application
  handled          boolean not null default false
);

create index if not exists inquiries_created_at_idx
  on inquiries (created_at desc);

-- Storage bucket for uploaded documents
-- Run this separately or create manually in Dashboard → Storage → New bucket
-- Name: documents
-- Public: NO (private bucket, access via signed URLs only)
-- file_size_limit: 20 MB per object (matches the form's stated limit)
-- allowed_mime_types: PDF / JPEG / PNG only — enforced by Storage regardless
--   of what the client sends (the form's `accept` attribute is only a hint).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documents',
  'documents',
  false,
  20971520,
  array['application/pdf', 'image/jpeg', 'image/png']
)
on conflict (id) do update
  set file_size_limit   = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- RLS: allow the service role (used by API routes) to do everything.
-- No anon or user access needed since all uploads use pre-signed URLs
-- generated server-side with the service role key.
alter table applications enable row level security;

create policy "service role full access"
  on applications
  for all
  using (true)
  with check (true);

alter table inquiries enable row level security;

create policy "service role full access inquiries"
  on inquiries
  for all
  using (true)
  with check (true);

-- ============================================================
-- Cleanup of orphaned upload files
-- Documents are uploaded to Storage *before* the application row is created
-- (the browser uploads directly via signed URLs). If a user abandons the form
-- after uploading, those files have no matching applications row and become
-- orphans. /api/submit already removes files when the DB insert fails, but it
-- cannot clean up uploads where the submit request never arrives (closed tab,
-- lost connection). This scheduled job sweeps those up.
--
-- Requires the pg_cron extension (Dashboard → Database → Extensions → pg_cron).
-- ============================================================
create extension if not exists pg_cron;

create or replace function delete_orphaned_documents()
returns void
language plpgsql
security definer
as $$
begin
  delete from storage.objects o
  where o.bucket_id = 'documents'
    and o.created_at < now() - interval '24 hours'
    and not exists (
      select 1 from applications a
      -- object name is "<application_id>/<key>.<ext>"
      where a.application_id = split_part(o.name, '/', 1)
    );
end;
$$;

-- Run daily at 03:00 UTC. Re-running this select is safe (it upserts the job).
select cron.schedule(
  'cleanup-orphaned-documents',
  '0 3 * * *',
  $$select delete_orphaned_documents()$$
);

-- ------------------------------------------------------------
-- Data retention for SUBMITTED applications
-- ------------------------------------------------------------
-- Deleting real applications (and their documents) is a legal/policy decision
-- — set the retention period according to AKKC's data-protection obligations,
-- then enable the job below. Left disabled on purpose so nothing is deleted
-- without an explicit decision on the retention window.
--
-- create or replace function delete_expired_applications()
-- returns void language plpgsql security definer as $$
-- declare r record;
-- begin
--   for r in
--     select application_id from applications
--     where submitted_at < now() - interval '<RETENTION PERIOD>'
--   loop
--     delete from storage.objects
--       where bucket_id = 'documents'
--         and split_part(name, '/', 1) = r.application_id;
--     delete from applications where application_id = r.application_id;
--   end loop;
-- end;
-- $$;
--
-- select cron.schedule('cleanup-expired-applications', '0 4 * * *',
--   $$select delete_expired_applications()$$);
