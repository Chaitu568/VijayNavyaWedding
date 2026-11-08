-- ============================================================
-- Wedding invite backend schema (Supabase / Postgres)
-- Run this in the Supabase Dashboard > SQL Editor (New query).
-- Tables: rsvps (RSVP responses), wishes (guestbook, moderated)
-- ============================================================

-- ---------- RSVPs ----------
create table if not exists public.rsvps (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  phone text not null,
  attending_ceremony boolean not null default false,
  attending_reception boolean not null default false,
  headcount integer not null default 1 check (headcount >= 1 and headcount <= 20),
  meal_pref text not null default 'veg' check (meal_pref in ('veg', 'non-veg')),
  dietary_notes text,
  message text
);

-- ---------- Wishes (guestbook) ----------
create table if not exists public.wishes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  message text not null,
  approved boolean not null default false
);

-- Helpful indexes
create index if not exists idx_rsvps_created on public.rsvps (created_at desc);
create index if not exists idx_wishes_approved_created on public.wishes (approved, created_at desc);

-- ---------- Row Level Security ----------
alter table public.rsvps enable row level security;
alter table public.wishes enable row level security;

-- RSVPs: anyone (anon) can submit; only logged-in admin can read
drop policy if exists "public insert rsvp" on public.rsvps;
create policy "public insert rsvp"
  on public.rsvps for insert to anon
  with check (true);

drop policy if exists "admin read rsvps" on public.rsvps;
create policy "admin read rsvps"
  on public.rsvps for select to authenticated
  using (true);

-- Wishes: anyone can submit; anyone can read APPROVED ones;
-- logged-in admin can read/update/delete all (moderation)
drop policy if exists "public insert wish" on public.wishes;
create policy "public insert wish"
  on public.wishes for insert to anon
  with check (true);

drop policy if exists "public read approved wishes" on public.wishes;
create policy "public read approved wishes"
  on public.wishes for select to anon
  using (approved = true);

drop policy if exists "admin manage wishes" on public.wishes;
create policy "admin manage wishes"
  on public.wishes for all to authenticated
  using (true) with check (true);

-- ---------- Handy analytics views (optional) ----------
-- Headcount per event
create or replace view public.v_event_headcount as
select
  sum(case when attending_ceremony then headcount else 0 end) as ceremony_guests,
  sum(case when attending_reception then headcount else 0 end) as reception_guests,
  count(*) as total_rsvps
from public.rsvps;

-- Meal split (among guests attending at least one event)
create or replace view public.v_meal_split as
select
  meal_pref,
  sum(headcount) as guests
from public.rsvps
where attending_ceremony or attending_reception
group by meal_pref;
