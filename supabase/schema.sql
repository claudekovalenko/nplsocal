-- No Place Left SoCal · tracker schema
-- Run in the Supabase SQL editor (or `supabase db push`) on a new project.

create table if not exists public.groups (
  id          text primary key,
  name        text not null,
  hub         text not null check (hub in ('la', 'oc')),
  area        text not null default '',
  leader      text not null default '',
  parent_id   text references public.groups (id) on delete set null,
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

create index if not exists groups_hub_idx on public.groups (hub);
create index if not exists groups_parent_idx on public.groups (parent_id);

-- keep updated_at fresh
create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  new.updated_by = auth.uid();
  return new;
end $$;
drop trigger if exists groups_touch on public.groups;
create trigger groups_touch before insert or update on public.groups
  for each row execute function public.touch_updated_at();

-- Anyone with the link can read; only signed-in practitioners can write.
alter table public.groups enable row level security;
drop policy if exists "read all" on public.groups;
create policy "read all" on public.groups for select using (true);
drop policy if exists "write signed in" on public.groups;
create policy "write signed in" on public.groups for all
  to authenticated using (true) with check (true);

-- Live updates in the app
alter publication supabase_realtime add table public.groups;

-- ── Event registrations ────────────────────────────────────────────
-- Contact details are private: anyone may sign up, only signed-in
-- organizers can read, change or delete the roster.

create table if not exists public.registrations (
  id         text primary key,
  event_id   text not null,
  name       text not null,
  email      text not null default '',
  phone      text not null default '',
  party      integer not null default 1 check (party between 1 and 500),
  city       text not null default '',
  church     text not null default '',
  network    text not null default '',
  notes      text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists registrations_event_idx on public.registrations (event_id, created_at desc);

alter table public.registrations enable row level security;

-- Public sign-up: insert only, no reading back.
drop policy if exists "anyone can register" on public.registrations;
create policy "anyone can register" on public.registrations
  for insert to anon, authenticated with check (true);

-- Organizers see and manage the roster.
drop policy if exists "organizers read" on public.registrations;
create policy "organizers read" on public.registrations
  for select to authenticated using (true);

drop policy if exists "organizers write" on public.registrations;
create policy "organizers write" on public.registrations
  for update to authenticated using (true) with check (true);

drop policy if exists "organizers delete" on public.registrations;
create policy "organizers delete" on public.registrations
  for delete to authenticated using (true);

alter publication supabase_realtime add table public.registrations;
