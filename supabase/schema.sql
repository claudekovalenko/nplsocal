-- No Place Left SoCal · tracker schema
-- Run in the Supabase SQL editor (or `supabase db push`) on a new project.

create table if not exists public.npl_groups (
  id          text primary key,
  name        text not null,
  hub         text not null check (hub in ('la', 'oc')),
  area        text not null default '',
  leader      text not null default '',
  parent_id   text references public.npl_groups (id) on delete set null,
  status      text not null default 'group' check (status in ('group', 'church')),
  started     date not null default current_date,
  attending   integer not null default 0,
  believers   integer not null default 0,
  baptized    integer not null default 0,
  elements    jsonb not null default '{}'::jsonb,
  notes       text not null default '',
  updated_at  timestamptz not null default now(),
  updated_by  uuid default auth.uid()
);

create index if not exists npl_groups_hub_idx on public.npl_groups (hub);
create index if not exists npl_groups_parent_idx on public.npl_groups (parent_id);

-- keep updated_at fresh
create or replace function public.npl_touch_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  new.updated_by = auth.uid();
  return new;
end $$;
drop trigger if exists npl_groups_touch on public.npl_groups;
create trigger npl_groups_touch before insert or update on public.npl_groups
  for each row execute function public.npl_touch_updated_at();

-- Leader names and meeting areas are sensitive: signed-in practitioners only.
alter table public.npl_groups enable row level security;
drop policy if exists "npl_groups signed in read" on public.npl_groups;
create policy "npl_groups signed in read" on public.npl_groups
  for select to authenticated using (true);
drop policy if exists "npl_groups signed in write" on public.npl_groups;
create policy "npl_groups signed in write" on public.npl_groups
  for all to authenticated using (true) with check (true);

-- Live updates in the app
alter publication supabase_realtime add table public.npl_groups;

-- ── Event registrations ────────────────────────────────────────────
-- Contact details are private: anyone may sign up, only signed-in
-- organizers can read, change or delete the roster.

create table if not exists public.npl_registrations (
  id         text primary key,
  event_id   text not null,
  name       text not null,
  email      text not null default '',
  phone      text not null default '',
  party      integer not null default 1 check (party between 1 and 500),
  city       text not null default '',
  church     text not null default '',
  days       text[] not null default '{}',
  notes      text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists npl_registrations_event_idx on public.npl_registrations (event_id, created_at desc);

alter table public.npl_registrations enable row level security;

-- Public sign-up: insert only, no reading back.
drop policy if exists "anyone can register" on public.npl_registrations;
create policy "anyone can register" on public.npl_registrations
  for insert to anon, authenticated with check (true);

-- Organizers see and manage the roster.
drop policy if exists "organizers read" on public.npl_registrations;
create policy "organizers read" on public.npl_registrations
  for select to authenticated using (true);

drop policy if exists "organizers write" on public.npl_registrations;
create policy "organizers write" on public.npl_registrations
  for update to authenticated using (true) with check (true);

drop policy if exists "organizers delete" on public.npl_registrations;
create policy "organizers delete" on public.npl_registrations
  for delete to authenticated using (true);

alter publication supabase_realtime add table public.npl_registrations;

-- ── Heartbeat ──────────────────────────────────────────────────────
-- Supabase pauses a free project after ~7 days of low database activity,
-- which would take the registration form down mid-event. The scheduled
-- job in .github/workflows/keepalive.yml reads and touches this row twice
-- a day. One row, no private data.

create table if not exists public.npl_heartbeat (
  id         smallint primary key default 1 check (id = 1),
  last_ping  timestamptz not null default now(),
  note       text not null default 'keeps the free-tier project from pausing'
);

insert into public.npl_heartbeat (id) values (1) on conflict (id) do nothing;

alter table public.npl_heartbeat enable row level security;

drop policy if exists "npl_heartbeat public read" on public.npl_heartbeat;
create policy "npl_heartbeat public read" on public.npl_heartbeat
  for select to anon, authenticated using (true);

drop policy if exists "npl_heartbeat public touch" on public.npl_heartbeat;
create policy "npl_heartbeat public touch" on public.npl_heartbeat
  for update to anon, authenticated using (id = 1) with check (id = 1);

-- ── Hardening for the public insert endpoints ─────────────────────
-- npl_registrations, npl_push_reports and npl_interest accept inserts from
-- anyone on the internet, so the database enforces its own limits rather than
-- trusting the form. src/lib/limits.ts mirrors these numbers and caps each
-- input at the same value, so nobody fills in a form and is refused afterwards.
-- Change a limit in both places or the two drift apart.

-- Every day must look like a date AND be a date that exists: a plain regex
-- passes 2027-02-30, which Postgres and JavaScript both quietly roll into March.
create or replace function public.npl_days_are_valid(days text[])
returns boolean language plpgsql immutable as $$
declare d text;
begin
  if days is null then return true; end if;
  foreach d in array days loop
    if d !~ '^\d{4}-\d{2}-\d{2}$' then return false; end if;
    begin
      perform d::date;
    exception when others then
      return false;
    end;
  end loop;
  return true;
end $$;

alter table public.npl_registrations drop constraint if exists npl_registrations_sane;
alter table public.npl_registrations add constraint npl_registrations_sane check (
  length(btrim(name)) > 0 and length(name) <= 200
  and length(btrim(event_id)) > 0 and length(event_id) <= 100
  and length(email) <= 320 and length(phone) <= 50
  and length(city) <= 120 and length(church) <= 200 and length(notes) <= 4000
  and coalesce(array_length(days, 1), 0) <= 60
  and public.npl_days_are_valid(days)
);

alter table public.npl_push_reports drop constraint if exists npl_push_reports_sane;
alter table public.npl_push_reports add constraint npl_push_reports_sane check (
  length(btrim(reporter)) > 0 and length(reporter) <= 200
  and length(btrim(event_id)) > 0 and length(event_id) <= 100
  and length(team) <= 200 and length(area) <= 200
  and length(story) <= 8000 and length(prayer) <= 4000
  and conversations <= 100000 and gospel_shared <= 100000
  and responded <= 100000 and baptized <= 100000 and groups_started <= 100000
);

alter table public.npl_interest drop constraint if exists npl_interest_sane;
alter table public.npl_interest add constraint npl_interest_sane check (
  length(btrim(name)) > 0 and length(name) <= 200
  and length(email) <= 320 and length(phone) <= 50
  and length(city) <= 120 and length(church) <= 200
  and length(notes) <= 4000 and length(source) <= 100
  and coalesce(array_length(wants, 1), 0) <= 20
);
