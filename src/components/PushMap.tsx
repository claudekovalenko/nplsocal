import { useMemo, useState } from 'react';
import { MapPin } from 'lucide-react';
import { outreach, followUp } from '@/content/push';
import { PROJ } from '@/content/pray/plan';
import { SHAPES, MAP_LAND, MAP_CONTEXT, FULL_VIEW, bounds, type Shape } from '@/lib/pray';
import { dayLabel } from '@/lib/format';

/**
 * Where the push goes: every outreach region coloured on the ZIP-code map of
 * LA and OC, the check-in base pinned, and any specific outreach spots from
 * push.ts as pins. Tap a region (on the map or in the list) to pick it out.
 */

// One colour per region, spread round the wheel so neighbours never match.
const HUES = ['#7aa7ff', '#4fd1c5', '#a78bfa', '#f28fb8', '#f6c453', '#5fd39a', '#f39a5b', '#8fb8ff', '#d98be6'];

const regions = followUp.regions.filter((r) => outreach.areas[r]);

export default function PushMap() {
  const [picked, setPicked] = useState<string | null>(null);

  // Which push region each ZIP shape belongs to, if any.
  const regionOf = useMemo(() => {
    const m = new Map<number, number>();
    SHAPES.forEach((s) => {
      const i = regions.findIndex((r) => outreach.areas[r].includes(s.r));
      if (i >= 0) m.set(s.i, i);
    });
    return m;
  }, []);

  // A label point per region: the middle of its ZIP shapes.
  const labels = useMemo(
    () =>
      regions.map((r, i) => {
        const list = SHAPES.filter((s) => regionOf.get(s.i) === i);
        // The middle of a region's outline box can be water (the Westside wraps
        // round Santa Monica Bay), so put the badge on the ZIP area nearest the
        // average of the region's ZIP areas: always on land, always inside.
        const mid = (sh: Shape) => [(sh.b[0] + sh.b[2]) / 2, (sh.b[1] + sh.b[3]) / 2];
        const avg = list.map(mid).reduce((a, m) => [a[0] + m[0] / list.length, a[1] + m[1] / list.length], [0, 0]);
        const best = list.reduce((a, sh) => {
          const [x, y] = mid(sh);
          const [ax, ay] = mid(a);
          return (x - avg[0]) ** 2 + (y - avg[1]) ** 2 < (ax - avg[0]) ** 2 + (ay - avg[1]) ** 2 ? sh : a;
        }, list[0]);
        const [x, y] = mid(best);
        return { r, i, x, y, n: list.length };
      }),
    [regionOf],
  );

  const [bx, by] = PROJ([outreach.base.lat, outreach.base.lon]);
  const spots = outreach.spots.map((s) => ({ ...s, xy: PROJ([s.lat, s.lon]) }));
  const viewBox = picked
    ? (() => {
        // Zoom to the picked region, with room around it.
        const list: Shape[] = SHAPES.filter((s) => regions[regionOf.get(s.i) ?? -1] === picked);
        const b = bounds(list);
        const pad = 30;
        const w = Math.max(b[2] - b[0], 160) + pad * 2;
        const h = Math.max(b[3] - b[1], 160) + pad * 2;
        return `${(b[0] + b[2]) / 2 - w / 2} ${(b[1] + b[3]) / 2 - h / 2} ${w} ${h}`;
      })()
    : FULL_VIEW.join(' ');
  // Pins and labels keep the same size on screen at any zoom.
  const unit = Number(viewBox.split(' ')[2]) / 880;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <div className="praymap relative overflow-hidden rounded-xl border border-line">
        <svg
          viewBox={viewBox}
          className="block h-[min(70vh,560px)] w-full transition-all duration-500"
          role="img"
          aria-label="Map of Los Angeles and Orange County showing the push outreach regions and the check-in at Neighbors and Nations"
        >
          {MAP_CONTEXT.map((d, i) => (
            <path key={`c${i}`} d={d} className="ctx" />
          ))}
          {MAP_LAND.map((d, i) => (
            <path key={`l${i}`} d={d} className="base" />
          ))}
          {SHAPES.map((s) => {
            const i = regionOf.get(s.i);
            const on = i !== undefined && (!picked || regions[i] === picked);
            return (
              <path
                key={s.i}
                d={s.d}
                onClick={() => i !== undefined && setPicked(regions[i] === picked ? null : regions[i])}
                style={{
                  // Places outside the push stay plain land.
                  fill: i === undefined ? 'var(--land)' : HUES[i % HUES.length],
                  fillOpacity: i === undefined ? 1 : on ? 0.38 : 0.1,
                  stroke: 'var(--land-line)',
                  strokeWidth: 0.4,
                  vectorEffect: 'non-scaling-stroke',
                  cursor: i === undefined ? 'default' : 'pointer',
                  transition: 'fill-opacity .3s',
                }}
              >
                <title>{i === undefined ? `${s.c || s.z}: not a push region` : `${regions[i]} · ${s.c || s.z}`}</title>
              </path>
            );
          })}
          {MAP_LAND.map((d, i) => (
            <path key={`o${i}`} d={d} className="cline" />
          ))}

          {/* Region names, when the whole map is showing */}
          {!picked &&
            labels.map((l) => (
              <g key={l.r} transform={`translate(${l.x} ${l.y})`} className="pointer-events-none select-none">
                <circle r={10 * unit} style={{ fill: HUES[l.i % HUES.length], stroke: 'var(--bg)', strokeWidth: 1.5 * unit }} />
                <text y={4 * unit} textAnchor="middle" style={{ fontSize: 11 * unit, fontWeight: 700, fill: 'var(--bg)' }}>
                  {l.i + 1}
                </text>
              </g>
            ))}

          {/* Outreach spots */}
          {spots
            .filter((s) => !picked || s.region === picked)
            .map((s) => (
              <g key={s.name} transform={`translate(${s.xy[0]} ${s.xy[1]})`}>
                <circle r={5 * unit} style={{ fill: 'var(--hit)', stroke: 'var(--hit-line)', strokeWidth: 1.5, vectorEffect: 'non-scaling-stroke' }} />
                <title>{s.name}</title>
              </g>
            ))}

          {/* Check-in base */}
          <g transform={`translate(${bx} ${by})`}>
            <circle r={13 * unit} style={{ fill: 'none', stroke: 'var(--hit-line)', strokeWidth: 1.5, vectorEffect: 'non-scaling-stroke' }} className="pulse" />
            <circle r={6.5 * unit} style={{ fill: 'var(--hit)', stroke: 'var(--hit-line)', strokeWidth: 2, vectorEffect: 'non-scaling-stroke' }} />
            <title>{`Check-in: ${outreach.base.name}`}</title>
          </g>
        </svg>
        <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 rounded-lg border border-line bg-elev px-3 py-2 text-xs">
          <span className="inline-block h-3 w-3 rounded-full border-2" style={{ background: 'var(--hit)', borderColor: 'var(--hit-line)' }} />
          Check-in: {outreach.base.name}
        </div>
        {picked && (
          <button
            type="button"
            onClick={() => setPicked(null)}
            className="absolute bottom-3 right-3 rounded-full border border-line bg-elev px-3 py-1.5 text-xs font-semibold transition hover:border-accent hover:text-accent"
          >
            Whole map
          </button>
        )}
      </div>

      <div>
        <ol className="divide-y divide-line overflow-hidden rounded-xl border border-line">
          {regions.map((r, i) => {
            const here = outreach.spots.filter((s) => s.region === r);
            return (
              <li key={r}>
                <button
                  type="button"
                  aria-pressed={picked === r}
                  onClick={() => setPicked(picked === r ? null : r)}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition hover:bg-surface ${picked === r ? 'bg-surface' : ''}`}
                >
                  <span
                    className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-semibold text-bg"
                    style={{ background: HUES[i % HUES.length] }}
                  >
                    {i + 1}
                  </span>
                  <span className="flex-1">{r}</span>
                  {here.length > 0 && <span className="text-xs text-muted">{here.length} spot{here.length === 1 ? '' : 's'}</span>}
                </button>
                {picked === r && here.length > 0 && (
                  <ul className="space-y-2 px-4 pb-3 pl-13 text-sm">
                    {here.map((s) => (
                      <li key={s.name} className="flex gap-2">
                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-faint" />
                        <span>
                          {s.name}
                          {s.days?.length ? <span className="text-muted"> · {s.days.map(dayLabel).join(', ')}</span> : null}
                          {s.note && <span className="block text-xs text-muted">{s.note}</span>}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ol>
        <p className="mt-3 text-xs text-faint">
          {outreach.spots.length
            ? 'Tap a region to see its outreach spots.'
            : 'Teams go out across these regions from the check-in each day. Exact spots are shared at check-in.'}
        </p>
      </div>
    </div>
  );
}
