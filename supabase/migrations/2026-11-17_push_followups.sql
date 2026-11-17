-- Push follow-ups: run once in the Supabase SQL editor. Same SQL as in schema.sql.
-- ── Push follow-ups ────────────────────────────────────────────────
-- A team in the field logs where they were, how many red / yellow / green
-- lights they found (optional), and the people who want a follow-up — a
-- phone number first, and what they asked for (a Bible study, learning to
-- share the gospel, …). Every row carries the region it was found in, so the
-- follow-up team can hand each person to laborers who live nearby.
--
-- Same shape as the daily reports: anyone can send from the street with no
-- sign-in; leads and admins read the people back; the public push page only
-- ever sees per-region counts from npl_push_region_totals.

create table if not exists public.npl_push_field_logs (
  id         text primary key,
  event_id   text not null,
  day        date not null,
  region     text not null,
  area       text not null default '',
  found_by   text not null default '',
  red        integer not null default 0 check (red >= 0),
  yellow     integer not null default 0 check (yellow >= 0),
  green      integer not null default 0 check (green >= 0),
  created_at timestamptz not null default now()
);

create index if not exists npl_push_field_logs_event_idx on public.npl_push_field_logs (event_id, region);

create table if not exists public.npl_push_followups (
  id         text primary key,
  log_id     text not null references public.npl_push_field_logs (id) on delete cascade,
  event_id   text not null,
  day        date not null,
  region     text not null,
  area       text not null default '',
  found_by   text not null default '',
  name       text not null default '',
  phone      text not null default '',
  wants      text[] not null default '{}',
  notes      text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists npl_push_followups_event_idx on public.npl_push_followups (event_id, region, created_at desc);
create index if not exists npl_push_followups_log_idx on public.npl_push_followups (log_id);

alter table public.npl_push_field_logs enable row level security;
alter table public.npl_push_followups enable row level security;

drop policy if exists "npl_push_field_logs anyone can log" on public.npl_push_field_logs;
create policy "npl_push_field_logs anyone can log" on public.npl_push_field_logs
  for insert to anon, authenticated with check (true);

drop policy if exists "npl_push_field_logs leads read" on public.npl_push_field_logs;
create policy "npl_push_field_logs leads read" on public.npl_push_field_logs
  for select to authenticated using (public.npl_can_see_leads());

drop policy if exists "npl_push_field_logs admin manage" on public.npl_push_field_logs;
create policy "npl_push_field_logs admin manage" on public.npl_push_field_logs
  for all to authenticated using (public.npl_is_admin()) with check (public.npl_is_admin());

drop policy if exists "npl_push_followups anyone can log" on public.npl_push_followups;
create policy "npl_push_followups anyone can log" on public.npl_push_followups
  for insert to anon, authenticated with check (true);

drop policy if exists "npl_push_followups leads read" on public.npl_push_followups;
create policy "npl_push_followups leads read" on public.npl_push_followups
  for select to authenticated using (public.npl_can_see_leads());

drop policy if exists "npl_push_followups admin manage" on public.npl_push_followups;
create policy "npl_push_followups admin manage" on public.npl_push_followups
  for all to authenticated using (public.npl_is_admin()) with check (public.npl_is_admin());

-- Lights and follow-ups per region for the public push page. Counts only.
create or replace function public.npl_push_region_totals(p_event_id text)
returns table (
  region text,
  red bigint,
  yellow bigint,
  green bigint,
  follow_ups bigint,
  logs bigint
) language sql stable security definer set search_path = public as $$
  select l.region,
         sum(l.red)::bigint,
         sum(l.yellow)::bigint,
         sum(l.green)::bigint,
         coalesce(sum((select count(*) from public.npl_push_followups f where f.log_id = l.id)), 0)::bigint,
         count(*)::bigint
  from public.npl_push_field_logs l
  where l.event_id = p_event_id
  group by l.region
  order by sum(l.red + l.yellow + l.green) desc, l.region;
$$;

grant execute on function public.npl_push_region_totals(text) to anon, authenticated;

alter table public.npl_push_field_logs drop constraint if exists npl_push_field_logs_sane;
alter table public.npl_push_field_logs add constraint npl_push_field_logs_sane check (
  length(btrim(event_id)) > 0 and length(event_id) <= 100
  and length(btrim(region)) > 0 and length(region) <= 120
  and length(area) <= 200 and length(found_by) <= 200
  and red <= 100000 and yellow <= 100000 and green <= 100000
);

alter table public.npl_push_followups drop constraint if exists npl_push_followups_sane;
alter table public.npl_push_followups add constraint npl_push_followups_sane check (
  length(btrim(event_id)) > 0 and length(event_id) <= 100
  and length(btrim(region)) > 0 and length(region) <= 120
  and length(area) <= 200 and length(found_by) <= 200
  and length(name) <= 200 and length(phone) <= 50 and length(notes) <= 2000
  and coalesce(array_length(wants, 1), 0) <= 20
  and (length(btrim(phone)) > 0 or length(btrim(name)) > 0 or length(btrim(notes)) > 0
       or coalesce(array_length(wants, 1), 0) > 0)
);

