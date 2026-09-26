-- No Place Left SoCal · database schema
-- Run in the Supabase SQL editor (or `supabase db push`). This file is the
-- source of truth: change it here and apply it, never the other way round.

-- ── Who can see what ───────────────────────────────────────────────
-- Two roles, by email:
--   admin  everything — rosters, the tracker, push reports
--   leads  the leads only — who registered, and who asked to hear more
-- An address that is not in this table can still register for an event and
-- submit a daily report, and can read nothing.
--
-- To add somebody: create their Supabase auth user, then insert a row here.
--   insert into public.npl_members (email, role, name)
--   values ('someone@example.com', 'leads', 'Their Name');

create table if not exists public.npl_members (
  email    text primary key,
  role     text not null check (role in ('admin', 'leads')),
  name     text not null default '',
  added_at timestamptz not null default now()
);

-- Security definer so the role lookup itself is not subject to the policies it
-- is used by, which would recurse. The role comes from the table rather than
-- the token, so removing somebody takes effect on their next page load instead
-- of whenever their session happens to expire.
create or replace function public.npl_role() returns text
  language sql stable security definer set search_path = public as $$
  select m.role
  from public.npl_members m
  where m.email = lower(coalesce(auth.jwt() ->> 'email', ''))
  limit 1;
$$;

create or replace function public.npl_is_admin() returns boolean
  language sql stable security definer set search_path = public as $$
  select coalesce(public.npl_role() = 'admin', false);
$$;

create or replace function public.npl_can_see_leads() returns boolean
  language sql stable security definer set search_path = public as $$
  select coalesce(public.npl_role() in ('admin', 'leads'), false);
$$;

alter table public.npl_members enable row level security;
drop policy if exists "npl_members read" on public.npl_members;
create policy "npl_members read" on public.npl_members
  for select to authenticated using (true);
drop policy if exists "npl_members admin writes" on public.npl_members;
create policy "npl_members admin writes" on public.npl_members
  for all to authenticated using (public.npl_is_admin()) with check (public.npl_is_admin());

-- ── Groups and churches (the tracker) ──────────────────────────────

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

-- Group names, leaders and meeting areas are the most sensitive thing here:
-- admin only, read and write.
alter table public.npl_groups enable row level security;
drop policy if exists "npl_groups signed in read" on public.npl_groups;
drop policy if exists "npl_groups signed in write" on public.npl_groups;
drop policy if exists "npl_groups admin read" on public.npl_groups;
create policy "npl_groups admin read" on public.npl_groups
  for select to authenticated using (public.npl_is_admin());
drop policy if exists "npl_groups admin write" on public.npl_groups;
create policy "npl_groups admin write" on public.npl_groups
  for all to authenticated using (public.npl_is_admin()) with check (public.npl_is_admin());

-- Live updates in the app. Adding a table twice is an error, so this file can
-- be re-run as the schema changes.
create or replace function public.npl_publish(tbl text) returns void
  language plpgsql as $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = tbl
  ) then
    execute format('alter publication supabase_realtime add table public.%I', tbl);
  end if;
end $$;

select public.npl_publish('npl_groups');

-- ── Event registrations ────────────────────────────────────────────
-- Contact details are private: anyone may sign up, admin and leads can read
-- the roster, only an admin can change or delete it.

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
drop policy if exists "npl_registrations anyone can sign up" on public.npl_registrations;
create policy "npl_registrations anyone can sign up" on public.npl_registrations
  for insert to anon, authenticated with check (true);

-- Leads and admins see the roster.
drop policy if exists "organizers read" on public.npl_registrations;
drop policy if exists "npl_registrations leads read" on public.npl_registrations;
create policy "npl_registrations leads read" on public.npl_registrations
  for select to authenticated using (public.npl_can_see_leads());

-- Only an admin changes it.
drop policy if exists "organizers write" on public.npl_registrations;
drop policy if exists "npl_registrations admin update" on public.npl_registrations;
create policy "npl_registrations admin update" on public.npl_registrations
  for update to authenticated using (public.npl_is_admin()) with check (public.npl_is_admin());

drop policy if exists "organizers delete" on public.npl_registrations;
drop policy if exists "npl_registrations admin delete" on public.npl_registrations;
create policy "npl_registrations admin delete" on public.npl_registrations
  for delete to authenticated using (public.npl_is_admin());

select public.npl_publish('npl_registrations');

-- ── Daily push reports ─────────────────────────────────────────────
-- Any team can turn in a report from the street with no sign-in, because that
-- is the only way it actually happens. Nobody but an admin reads them back.
-- The public numbers on the push page come from npl_push_totals below, which
-- returns sums and never a story, a name or an area.

create table if not exists public.npl_push_reports (
  id             text primary key,
  event_id       text not null,
  day            date not null,
  reporter       text not null default '',
  team           text not null default '',
  area           text not null default '',
  conversations  integer not null default 0 check (conversations >= 0),
  gospel_shared  integer not null default 0 check (gospel_shared >= 0),
  responded      integer not null default 0 check (responded >= 0),
  baptized       integer not null default 0 check (baptized >= 0),
  groups_started integer not null default 0 check (groups_started >= 0),
  story          text not null default '',
  prayer         text not null default '',
  created_at     timestamptz not null default now()
);

create index if not exists npl_push_reports_event_idx on public.npl_push_reports (event_id, day);

alter table public.npl_push_reports enable row level security;

drop policy if exists "npl_push_reports anyone can report" on public.npl_push_reports;
create policy "npl_push_reports anyone can report" on public.npl_push_reports
  for insert to anon, authenticated with check (true);

drop policy if exists "npl_push_reports admin read" on public.npl_push_reports;
create policy "npl_push_reports admin read" on public.npl_push_reports
  for select to authenticated using (public.npl_is_admin());

drop policy if exists "npl_push_reports admin manage" on public.npl_push_reports;
create policy "npl_push_reports admin manage" on public.npl_push_reports
  for all to authenticated using (public.npl_is_admin()) with check (public.npl_is_admin());

-- Totals for the push page. Security definer on purpose: everyone gets to see
-- what the network did, and nobody gets the rows behind it.
create or replace function public.npl_push_totals(p_event_id text)
returns table (
  day date,
  conversations bigint,
  gospel_shared bigint,
  responded bigint,
  baptized bigint,
  groups_started bigint,
  reports bigint
) language sql stable security definer set search_path = public as $$
  select day,
         sum(conversations)::bigint,
         sum(gospel_shared)::bigint,
         sum(responded)::bigint,
         sum(baptized)::bigint,
         sum(groups_started)::bigint,
         count(*)::bigint
  from public.npl_push_reports
  where event_id = p_event_id
  group by day
  order by day;
$$;

-- ── "Keep me posted" ───────────────────────────────────────────────
-- Somebody met a team on the street and wants to hear more. Same shape as
-- registrations: anyone can leave their details, leads and admins can read
-- them, only an admin can change them.

create table if not exists public.npl_interest (
  id         text primary key,
  source     text not null default '',
  name       text not null,
  email      text not null default '',
  phone      text not null default '',
  city       text not null default '',
  church     text not null default '',
  wants      text[] not null default '{}',
  notes      text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists npl_interest_created_idx on public.npl_interest (created_at desc);

alter table public.npl_interest enable row level security;

drop policy if exists "npl_interest anyone can ask" on public.npl_interest;
create policy "npl_interest anyone can ask" on public.npl_interest
  for insert to anon, authenticated with check (true);

drop policy if exists "npl_interest leads read" on public.npl_interest;
create policy "npl_interest leads read" on public.npl_interest
  for select to authenticated using (public.npl_can_see_leads());

drop policy if exists "npl_interest admin manage" on public.npl_interest;
create policy "npl_interest admin manage" on public.npl_interest
  for all to authenticated using (public.npl_is_admin()) with check (public.npl_is_admin());

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
