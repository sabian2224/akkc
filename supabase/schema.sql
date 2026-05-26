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

-- Storage bucket for uploaded documents
-- Run this separately or create manually in Dashboard → Storage → New bucket
-- Name: documents
-- Public: NO (private bucket, access via signed URLs only)
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

-- RLS: allow the service role (used by API routes) to do everything.
-- No anon or user access needed since all uploads use pre-signed URLs
-- generated server-side with the service role key.
alter table applications enable row level security;

create policy "service role full access"
  on applications
  for all
  using (true)
  with check (true);
