-- Outreach spots: where teams went, pinned from the field. Paste into the
-- Supabase SQL editor and run once (safe to run again). Also in schema.sql.
--
-- Anyone may add a spot (teams do it from the street with no sign-in) and
-- anyone may read them back: a spot is a public place and a day, never a name,
-- a phone number or who was there. The database checks every row itself.

create table if not exists public.npl_push_spots (
  id         text primary key,
  event_id   text not null,
  day        date not null,
  region     text not null default '',
  place      text not null default '',
  lat        double precision not null,
  lon        double precision not null,
  created_at timestamptz not null default now()
);

create index if not exists npl_push_spots_event_idx on public.npl_push_spots (event_id, created_at);

alter table public.npl_push_spots drop constraint if exists npl_push_spots_sane;
alter table public.npl_push_spots add constraint npl_push_spots_sane check (
  length(btrim(event_id)) > 0 and length(event_id) <= 100
  and length(region) <= 120 and length(place) <= 120
  -- Southern California only: Ventura to San Diego, the coast to the desert.
  and lat between 32.5 and 35.2 and lon between -119.6 and -116.0
);

alter table public.npl_push_spots enable row level security;

drop policy if exists "npl_push_spots anyone can add" on public.npl_push_spots;
create policy "npl_push_spots anyone can add" on public.npl_push_spots
  for insert to anon, authenticated with check (true);

drop policy if exists "npl_push_spots anyone can read" on public.npl_push_spots;
create policy "npl_push_spots anyone can read" on public.npl_push_spots
  for select to anon, authenticated using (true);

drop policy if exists "npl_push_spots admin manage" on public.npl_push_spots;
create policy "npl_push_spots admin manage" on public.npl_push_spots
  for all to authenticated using (public.npl_is_admin()) with check (public.npl_is_admin());
