import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Event } from '@/content';
import { eventDays, isoDay } from '@/lib/format';
import { EventRow, toneStyle, typeTone, typeLabel } from '@/components/EventCard';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const pad = (n: number) => String(n).padStart(2, '0');
const ym = (day: string) => day.slice(0, 7);

/**
 * A month grid. Every day an event covers gets its colour, so a four-day push
 * reads as four days, not one. Tap a day to see just that day underneath;
 * otherwise the whole month is listed.
 */
export default function MonthCalendar({ events, showHub }: { events: Event[]; showHub: boolean }) {
  const today = isoDay(new Date().toISOString());

  const byDay = useMemo(() => {
    const map: Record<string, Event[]> = {};
    for (const e of events) {
      if (e.dateLabel) continue;
      for (const d of eventDays(e.start, e.end)) (map[d] ??= []).push(e);
    }
    return map;
  }, [events]);

  // Open on this month, or on the first month that has something in it, so the
  // first thing people see is never an empty grid.
  const firstMonth = useMemo(() => {
    const months = Object.keys(byDay).filter((d) => d >= today).sort().map(ym);
    return months.includes(ym(today)) || !months.length ? ym(today) : months[0];
  }, [byDay, today]);

  const [month, setMonth] = useState(firstMonth);
  const [selected, setSelected] = useState<string | null>(null);

  const [y, m] = month.split('-').map(Number);
  const lead = new Date(Date.UTC(y, m - 1, 1)).getUTCDay();
  const count = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const cells: (string | null)[] = [
    ...Array(lead).fill(null),
    ...Array.from({ length: count }, (_, i) => `${month}-${pad(i + 1)}`),
  ];
  while (cells.length % 7) cells.push(null);

  const shift = (n: number) => {
    const d = new Date(Date.UTC(y, m - 1 + n, 1));
    setMonth(`${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}`);
    setSelected(null);
  };

  const title = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(Date.UTC(y, m - 1, 15)),
  );

  // Events touching this month, once each, in date order.
  const monthEvents = [
    ...new Set(
      cells
        .filter((d): d is string => !!d)
        .flatMap((d) => byDay[d] ?? []),
    ),
  ].sort((a, b) => +new Date(a.start) - +new Date(b.start));
  const listed = selected ? (byDay[selected] ?? []) : monthEvents;
  const types = [...new Set(monthEvents.map((e) => e.type))];

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-2xl md:text-3xl">{title}</h3>
        <div className="flex items-center gap-1">
          <button type="button" className="btn-ghost !h-9 !px-2.5" onClick={() => shift(-1)} aria-label="Previous month">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="btn-ghost !h-9 !px-3 !text-xs"
            onClick={() => {
              setMonth(ym(today));
              setSelected(null);
            }}
          >
            Today
          </button>
          <button type="button" className="btn-ghost !h-9 !px-2.5" onClick={() => shift(1)} aria-label="Next month">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-line bg-line">
        <div className="grid grid-cols-7 gap-px">
          {WEEKDAYS.map((w) => (
            <div key={w} className="bg-elev py-2 text-center text-[10px] font-medium uppercase tracking-[0.18em] text-faint">
              <span className="sm:hidden">{w[0]}</span>
              <span className="hidden sm:inline">{w}</span>
            </div>
          ))}
          {cells.map((d, i) => {
            if (!d) return <div key={`x${i}`} className="min-h-14 bg-bg/60 sm:min-h-24" />;
            const list = byDay[d] ?? [];
            const isToday = d === today;
            const isSel = d === selected;
            const past = d < today;
            return (
              <button
                key={d}
                type="button"
                disabled={!list.length}
                onClick={() => setSelected(isSel ? null : d)}
                aria-label={`${d}: ${list.length ? list.map((e) => e.title).join(', ') : 'nothing scheduled'}`}
                aria-pressed={isSel}
                className={`relative flex min-h-14 flex-col items-stretch gap-1 bg-bg p-1.5 text-left transition sm:min-h-24 sm:p-2 ${
                  list.length ? 'cursor-pointer hover:bg-elev' : 'cursor-default'
                } ${isSel ? '!bg-surface' : ''} ${past ? 'opacity-50' : ''}`}
              >
                <span
                  className={`inline-flex h-6 w-6 items-center justify-center self-start rounded-full text-xs tabular-nums ${
                    isToday ? 'bg-accent font-semibold text-bg' : 'text-muted'
                  }`}
                >
                  {Number(d.slice(8))}
                </span>
                {/* Phones: a dot per event. Wider: the title, in its colour. */}
                <span className="flex flex-wrap gap-1 sm:hidden">
                  {list.slice(0, 3).map((e) => (
                    <span key={e.id} className="h-1.5 w-1.5 rounded-full" style={{ background: typeTone[e.type] }} />
                  ))}
                </span>
                <span className="hidden flex-col gap-1 sm:flex">
                  {list.slice(0, 2).map((e) => (
                    <span
                      key={e.id}
                      style={{
                        ...toneStyle(e),
                        color: 'color-mix(in oklab, var(--tone) 75%, var(--fg))',
                        background: 'color-mix(in oklab, var(--tone) 16%, transparent)',
                      }}
                      className="block truncate rounded px-1.5 py-0.5 text-[11px] leading-tight"
                      title={e.title}
                    >
                      {e.title}
                    </span>
                  ))}
                  {list.length > 2 && <span className="px-1.5 text-[11px] text-faint">+{list.length - 2} more</span>}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {types.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
          {types.map((t) => (
            <span key={t} className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: typeTone[t] }} /> {typeLabel[t]}
            </span>
          ))}
        </div>
      )}

      <div className="mt-10">
        <div className="flex items-center justify-between gap-4">
          <div className="eyebrow">
            {selected
              ? new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(
                  new Date(`${selected}T12:00:00Z`),
                )
              : `All of ${title}`}
          </div>
          {selected && (
            <button type="button" className="text-xs text-muted underline-offset-4 hover:underline" onClick={() => setSelected(null)}>
              Show the whole month
            </button>
          )}
        </div>
        {listed.length ? (
          <ul className="mt-2 divide-y divide-line border-y border-line">
            {listed.map((e) => (
              <EventRow key={e.id} event={e} showHub={showHub} />
            ))}
          </ul>
        ) : (
          <p className="mt-4 rounded-xl border border-dashed border-line px-6 py-10 text-center text-sm text-muted">
            Nothing on the calendar this month yet.
          </p>
        )}
      </div>
    </div>
  );
}
