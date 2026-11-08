-- ============================================================
-- Wedding invite backend schema (Supabase / Postgres)
-- Run this in the Supabase Dashboard > SQL Editor (New query).
-- Table: rsvps (one row per RSVP response, per-event attendance)
-- Events: pelli, mehendi, haldi, wedding (= attending_ceremony)
-- ============================================================

-- ---------- RSVPs ----------
create table if not exists public.rsvps (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  phone text not null,
  attending_pelli boolean not null default false,
  attending_mehendi boolean not null default false,
  attending_haldi boolean not null default false,
  attending_ceremony boolean not null default false,
  headcount integer not null default 1 check (headcount >= 1 and headcount <= 20),
  message text
);

-- Helpful index
create index if not exists idx_rsvps_created on public.rsvps (created_at desc);

-- ---------- Row Level Security ----------
alter table public.rsvps enable row level security;

-- RSVPs: anyone (anon) can submit; only logged-in admin can read
drop policy if exists "public insert rsvp" on public.rsvps;
create policy "public insert rsvp"
  on public.rsvps for insert to anon
  with check (true);

drop policy if exists "admin read rsvps" on public.rsvps;
create policy "admin read rsvps"
  on public.rsvps for select to authenticated
  using (true);

-- ---------- Handy analytics view (optional) ----------
-- Guest headcount per event
create or replace view public.v_event_headcount as
select
  sum(case when attending_pelli then headcount else 0 end) as pelli_guests,
  sum(case when attending_mehendi then headcount else 0 end) as mehendi_guests,
  sum(case when attending_haldi then headcount else 0 end) as haldi_guests,
  sum(case when attending_ceremony then headcount else 0 end) as wedding_guests,
  count(*) as total_rsvps
from public.rsvps;
