import { useEffect, useMemo, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import { outreach, followUp } from '@/content/push';
import { PROJ, UNPROJ } from '@/content/pray/plan';
import { SHAPES, MAP_LAND, MAP_CONTEXT, FULL_VIEW, bounds, type Shape } from '@/lib/pray';
import { dayLabel } from '@/lib/format';
import type { Spot } from '@/lib/spotsStore';

/**
 * Where the push goes: every outreach region coloured on the ZIP-code map of
 * LA and OC, the check-in base pinned, and the outreach spots as pins — the
 * fixed ones from push.ts and the ones teams add from the field, live.
 *
 * In "pick" mode it is a place to drop a pin: tap the map and the spot form
 * gets the coordinates and the region under them.
 */

// One colour per region, spread round the wheel so neighbours never match.
const HUES = ['#7aa7ff', '#4fd1c5', '#a78bfa', '#f28fb8', '#f6c453', '#5fd39a', '#f39a5b', '#8fb8ff', '#d98be6'];

export const pushRegions = followUp.regions.filter((r) => outreach.areas[r]);

/** Which push region each ZIP shape belongs to, if any (index into pushRegions). */
const REGION_OF = new Map<number, number>();
SHAPES.forEach((s) => {
  const i = pushRegions.findIndex((r) => outreach.areas[r].includes(s.r));
  if (i >= 0) REGION_OF.set(s.i, i);
});

const mid = (sh: Shape) => [(sh.b[0] + sh.b[2]) / 2, (sh.b[1] + sh.b[3]) / 2];

/** The push region under a point (nearest ZIP area), or "Other" outside them. */
export function regionAt(lat: number, lon: number): string {
  const [x, y] = PROJ([lat, lon]);
  let best: Shape | null = null;
  let bd = Infinity;
  for (const s of SHAPES) {
    const [mx, my] = mid(s);
    const d = (mx - x) ** 2 + (my - y) ** 2;
    if (d < bd) [bd, best] = [d, s];
  }
  const i = best ? REGION_OF.get(best.i) : undefined;
  // More than ~25 map units from any ZIP centre is the ocean or another county.
  return i === undefined || bd > 25 ** 2 ? 'Other' : pushRegions[i];
}

interface Pin {
  key: string;
  name: string;
  region: string;
  lat: number;
  lon: number;
  days: string[];
  note?: string;
  fresh: boolean;
}

export default function PushMap({
  live = [],
  pick,
}: {
  /** Spots teams have added, from the database. */
  live?: Spot[];
  /** Pick mode: tapping the map reports a point instead of zooming to a region. */
  pick?: { point: [number, number] | null; onPick: (lat: number, lon: number) => void };
}) {
  const [picked, setPicked] = useState<string | null>(null);
  // How wide the map really is on screen, so pins can be sized in pixels.
  const svgRef = useRef<SVGSVGElement>(null);
  const [px, setPx] = useState(640);
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setPx(e.contentRect.width || 640));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // A badge per region, on the ZIP area nearest the middle of the region (the
  // middle of the outline box can be water: the Westside wraps a bay).
  const labels = useMemo(
    () =>
      pushRegions.map((r, i) => {
        const list = SHAPES.filter((s) => REGION_OF.get(s.i) === i);
        const avg = list.map(mid).reduce((a, m) => [a[0] + m[0] / list.length, a[1] + m[1] / list.length], [0, 0]);
        const best = list.reduce((a, sh) => {
          const [x, y] = mid(sh);
          const [ax, ay] = mid(a);
          return (x - avg[0]) ** 2 + (y - avg[1]) ** 2 < (ax - avg[0]) ** 2 + (ay - avg[1]) ** 2 ? sh : a;
        }, list[0]);
        const [x, y] = mid(best);
        return { r, i, x, y };
      }),
    [],
  );

  // Fixed spots from push.ts and live ones from the field, as one list.
  const pins: Pin[] = useMemo(() => {
    const now = Date.now();
    return [
      ...outreach.spots.map((s) => ({
        key: `fixed-${s.name}`,
        name: s.name,
        region: s.region,
        lat: s.lat,
        lon: s.lon,
        days: s.days ?? [],
        note: s.note,
        fresh: false,
      })),
      ...live.map((s) => ({
        key: s.id,
        name: s.place || 'Outreach spot',
        region: s.region,
        lat: s.lat,
        lon: s.lon,
        days: [s.day],
        // Added in the last two hours: it pulses, so new places catch the eye.
        fresh: !!s.createdAt && now - Date.parse(s.createdAt) < 2 * 3600_000,
      })),
    ];
  }, [live]);

  const [bx, by] = PROJ([outreach.base.lat, outreach.base.lon]);
  const zoomTo = pick ? null : picked;
  const viewBox = zoomTo
    ? (() => {
        const list: Shape[] = SHAPES.filter((s) => pushRegions[REGION_OF.get(s.i) ?? -1] === zoomTo);
        const b = bounds(list);
        const pad = 30;
        const w = Math.max(b[2] - b[0], 160) + pad * 2;
        const h = Math.max(b[3] - b[1], 160) + pad * 2;
        return `${(b[0] + b[2]) / 2 - w / 2} ${(b[1] + b[3]) / 2 - h / 2} ${w} ${h}`;
      })()
    : FULL_VIEW.join(' ');
  // One "unit" is one screen pixel, at any zoom and on any screen: a pin is the
  // same size on a phone as on a desktop. (The map fits its box by width or
  // height, whichever is tighter; width is close enough for sizing pins.)
  const unit = Number(viewBox.split(' ')[2]) / px;

  const onMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!pick) return;
    const svg = e.currentTarget;
    const m = svg.getScreenCTM();
    if (!m) return;
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    const [lat, lon] = UNPROJ([pt.x, pt.y]);
    pick.onPick(lat, lon);
  };
  const pickXY = pick?.point ? PROJ(pick.point) : null;

  const map = (
    <div className={`praymap relative overflow-hidden rounded-xl border border-line ${pick ? 'cursor-crosshair' : ''}`}>
      <svg
        ref={svgRef}
        viewBox={viewBox}
        onClick={onMapClick}
        className={`block w-full transition-all duration-500 ${pick ? 'h-[min(52vh,420px)]' : 'h-[min(70vh,560px)]'}`}
        role="img"
        aria-label={
          pick
            ? 'Map of Los Angeles and Orange County: tap where your team went'
            : 'Map of Los Angeles and Orange County showing the push outreach regions, the check-in, and the places teams have been'
        }
      >
        {MAP_CONTEXT.map((d, i) => (
          <path key={`c${i}`} d={d} className="ctx" />
        ))}
        {MAP_LAND.map((d, i) => (
          <path key={`l${i}`} d={d} className="base" />
        ))}
        {SHAPES.map((s) => {
          const i = REGION_OF.get(s.i);
          const on = i !== undefined && (!zoomTo || pushRegions[i] === zoomTo);
          return (
            <path
              key={s.i}
              d={s.d}
              onClick={() => !pick && i !== undefined && setPicked(pushRegions[i] === picked ? null : pushRegions[i])}
              style={{
                // Places outside the push stay plain land.
                fill: i === undefined ? 'var(--land)' : HUES[i % HUES.length],
                fillOpacity: i === undefined ? 1 : on ? (pick ? 0.22 : 0.38) : 0.1,
                stroke: 'var(--land-line)',
                strokeWidth: 0.4,
                vectorEffect: 'non-scaling-stroke',
                cursor: pick ? 'crosshair' : i === undefined ? 'default' : 'pointer',
                transition: 'fill-opacity .3s',
              }}
            >
              {!pick && <title>{i === undefined ? `${s.c || s.z}: not a push region` : `${pushRegions[i]} · ${s.c || s.z}`}</title>}
            </path>
          );
        })}
        {MAP_LAND.map((d, i) => (
          <path key={`o${i}`} d={d} className="cline" />
        ))}

        {!zoomTo &&
          !pick &&
          labels.map((l) => (
            <g key={l.r} transform={`translate(${l.x} ${l.y})`} className="pointer-events-none select-none">
              <circle r={9 * unit} style={{ fill: HUES[l.i % HUES.length], stroke: 'var(--bg)', strokeWidth: 1.5 * unit }} />
              <text y={3.6 * unit} textAnchor="middle" style={{ fontSize: 10 * unit, fontWeight: 700, fill: 'var(--bg)' }}>
                {l.i + 1}
              </text>
            </g>
          ))}

        {/* Where teams have been */}
        {pins
          .filter((p) => !zoomTo || p.region === zoomTo)
          .map((p) => {
            const [x, y] = PROJ([p.lat, p.lon]);
            return (
              <g key={p.key} transform={`translate(${x} ${y})`} className="pointer-events-none">
                {p.fresh && (
                  <circle r={9 * unit} className="pulse" style={{ fill: 'none', stroke: 'var(--hit)', strokeWidth: 1.5, vectorEffect: 'non-scaling-stroke' }} />
                )}
                <circle r={4 * unit} style={{ fill: 'var(--hit)', stroke: 'var(--hit-line)', strokeWidth: 1.2, vectorEffect: 'non-scaling-stroke' }} />
                <title>{p.name}</title>
              </g>
            );
          })}

        {/* Check-in base */}
        <g transform={`translate(${bx} ${by})`} className="pointer-events-none">
          <circle r={12 * unit} style={{ fill: 'none', stroke: 'var(--hit-line)', strokeWidth: 1.5, vectorEffect: 'non-scaling-stroke' }} className="pulse" />
          <rect
            x={-5.5 * unit}
            y={-5.5 * unit}
            width={11 * unit}
            height={11 * unit}
            rx={2 * unit}
            style={{ fill: 'var(--hit-line)', stroke: 'var(--hit)', strokeWidth: 2, vectorEffect: 'non-scaling-stroke' }}
          />
          <title>{`Check-in: ${outreach.base.name}`}</title>
        </g>

        {/* The pin being placed */}
        {pickXY && (
          <g transform={`translate(${pickXY[0]} ${pickXY[1]})`} className="pointer-events-none">
            <circle r={18 * unit} style={{ fill: 'var(--hit)', fillOpacity: 0.22 }} />
            <circle r={7 * unit} style={{ fill: 'var(--hit)', stroke: 'var(--hit-line)', strokeWidth: 2, vectorEffect: 'non-scaling-stroke' }} />
          </g>
        )}
      </svg>
      <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-1 rounded-lg border border-line bg-elev px-3 py-2 text-xs">
        <span className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-[3px] border-2" style={{ background: 'var(--hit-line)', borderColor: 'var(--hit)' }} />
          Check-in: {outreach.base.name}
        </span>
        {!pick && (
          <span className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-full border" style={{ background: 'var(--hit)', borderColor: 'var(--hit-line)' }} />
            {pins.length ? `${pins.length} place${pins.length === 1 ? '' : 's'} teams have been` : 'Places teams have been'}
          </span>
        )}
      </div>
      {zoomTo && (
        <button
          type="button"
          onClick={() => setPicked(null)}
          className="absolute bottom-3 right-3 rounded-full border border-line bg-elev px-3 py-1.5 text-xs font-semibold transition hover:border-accent hover:text-accent"
        >
          Whole map
        </button>
      )}
    </div>
  );

  if (pick) return map;

  const here = picked ? pins.filter((p) => p.region === picked) : [];

  return (
    <div>
      {map}
      {/* Regions as a row of chips under the map: tap one to zoom to it. */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {pushRegions.map((r, i) => {
          const n = pins.filter((p) => p.region === r).length;
          return (
            <button
              key={r}
              type="button"
              aria-pressed={picked === r}
              onClick={() => setPicked(picked === r ? null : r)}
              className={`inline-flex h-8 items-center gap-1.5 rounded-full border pl-1 pr-3 text-xs transition ${
                picked === r ? 'border-fg bg-fg text-bg' : 'border-line text-muted hover:border-line-strong hover:text-fg'
              }`}
            >
              <span
                className="grid h-6 w-6 place-items-center rounded-full text-[10px] font-semibold text-bg"
                style={{ background: HUES[i % HUES.length] }}
              >
                {i + 1}
              </span>
              {r.replace(/ \(.*\)$/, '')}
              {n > 0 && <span className="tabular-nums opacity-70">· {n}</span>}
            </button>
          );
        })}
      </div>
      {picked && (
        <div className="mt-3 rounded-xl border border-line p-4 text-sm">
          {here.length ? (
            <ul className="grid gap-2 sm:grid-cols-2">
              {here.slice(0, 12).map((p) => (
                <li key={p.key} className="flex gap-2">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-faint" />
                  <span>
                    {p.name}
                    {p.days.length ? <span className="text-muted"> · {p.days.map(dayLabel).join(', ')}</span> : null}
                    {p.note && <span className="block text-xs text-muted">{p.note}</span>}
                  </span>
                </li>
              ))}
              {here.length > 12 && <li className="text-xs text-muted">and {here.length - 12} more</li>}
            </ul>
          ) : (
            <p className="text-muted">No places pinned in {picked} yet.</p>
          )}
        </div>
      )}
      <p className="mt-3 text-xs text-faint">
        {pins.length ? 'Teams add the places they go from the tracker. Tap a region to see them.' : 'As teams add the places they go, they appear here for everyone.'}
      </p>
    </div>
  );
}
