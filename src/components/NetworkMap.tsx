import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MAP_W,
  MAP_H,
  counties,
  context,
  islands,
  graticule,
  meridians,
  parallels,
  scaleBar,
  landmarks,
  places,
  type Place,
  type Landmark,
} from './map-data';

type Variant = 'hero' | 'full';
type HubKey = 'la' | 'oc';

const SERIF = "'Iowan Old Style', 'Palatino Linotype', Palatino, 'Book Antiqua', Georgia, serif";

/** Labels that sit to the left of their dot, where the right side is crowded. */
const LABEL_LEFT = new Set(['long-beach', 'glendale', 'buena-park', 'garden-grove', 'westminster', 'huntington', 'malibu']);

/**
 * Los Angeles and Orange County drawn as a printed map: coastline with water
 * lines, the Channel Islands, neighbouring counties, a lat/long graticule,
 * lettered seas and mountains, a north arrow and a scale bar — and the network
 * on top. Pure SVG from scripts/build-map.mjs, so it works offline.
 */
export default function NetworkMap({ variant = 'full', className = '' }: { variant?: Variant; className?: string }) {
  const [hover, setHover] = useState<HubKey | null>(null);
  const dim = (hub: HubKey) => (hover && hover !== hub ? 0.3 : 1);
  const hubs: HubKey[] = ['la', 'oc'];
  const byHub = (h: HubKey) => places.filter((p) => p.hub === h);
  const center = (h: HubKey) => byHub(h).find((p) => p.size === 3)!;
  const la = center('la');
  const oc = center('oc');
  const hero = variant === 'hero';

  // Hero: the basin, the coast and Catalina. Full: the whole of both counties.
  const [vx, vy, vw, vh] = hero ? [205, 345, 820, 700] : [0, 0, MAP_W, MAP_H];

  // A gentle bow in every link, so the network reads as drawn, not plotted.
  const arc = (x1: number, y1: number, x2: number, y2: number, bend = 0.12) => {
    const mx = (x1 + x2) / 2 - (y2 - y1) * bend;
    const my = (y1 + y2) / 2 + (x2 - x1) * bend;
    return `M${x1},${y1} Q${mx},${my} ${x2},${y2}`;
  };
  const links = hubs.flatMap((h) => {
    const c = center(h);
    return byHub(h)
      .filter((p) => p !== c && (!hero || p.size >= 2))
      .map((p) => ({ id: `${h}-${p.id}`, hub: h, d: arc(c.x, c.y, p.x, p.y, 0.08) }));
  });

  const showLabel = (p: Place) => !hero || p.size >= 2;

  // Two linear fades intersected so the hero crop melts into the page on all
  // four sides (a radial fade left the land showing as straight edges).
  const style = hero
    ? ({
        WebkitMaskImage:
          'linear-gradient(to bottom, transparent 0%, #000 12%, #000 88%, transparent 100%), linear-gradient(to right, transparent 0%, #000 9%, #000 91%, transparent 100%)',
        maskImage:
          'linear-gradient(to bottom, transparent 0%, #000 12%, #000 88%, transparent 100%), linear-gradient(to right, transparent 0%, #000 9%, #000 91%, transparent 100%)',
        WebkitMaskComposite: 'source-in',
        maskComposite: 'intersect',
      } as const)
    : undefined;

  // Map furniture sits in open water at the bottom-left of whichever frame.
  const fx = hero ? vx + 95 : 90;
  const fy = hero ? vy + vh - 95 : MAP_H - 90;

  const allLand = [...context, ...islands, counties.la.path, counties.oc.path];

  return (
    <svg
      viewBox={`${vx} ${vy} ${vw} ${vh}`}
      style={
        {
          ...style,
          '--land': 'color-mix(in oklab, var(--fg) 7%, var(--bg))',
          '--land-hub': 'color-mix(in oklab, var(--accent) 11%, var(--land))',
          '--ink': 'color-mix(in oklab, var(--fg) 55%, var(--bg))',
          '--water': 'color-mix(in oklab, var(--accent) 70%, var(--bg))',
        } as React.CSSProperties
      }
      className={className}
      role="img"
      aria-label="Map of Los Angeles County and Orange County showing the No Place Left SoCal network"
    >
      <defs>
        <radialGradient id="hub-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </radialGradient>
        <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" />
        </filter>
        <g id="land-shapes">
          {allLand.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
        {/* Water lines: each ring is a wide stroke of the coast with a slightly
            narrower one cut out of it. The land, drawn solid on top, hides the
            inland half, so only the offshore ripples remain. */}
        {[10, 22, 38, 58, 82].map((w, i) => (
          <mask key={w} id={`ripple-${i}`} maskUnits="userSpaceOnUse" x={vx} y={vy} width={vw} height={vh}>
            <use href="#land-shapes" fill="none" stroke="#fff" strokeWidth={w} strokeLinejoin="round" />
            <use href="#land-shapes" fill="none" stroke="#000" strokeWidth={w - 2.2} strokeLinejoin="round" />
          </mask>
        ))}
      </defs>

      {/* Water lines, fading out to sea */}
      {[0.5, 0.36, 0.26, 0.18, 0.11].map((o, i) => (
        <rect key={i} x={vx} y={vy} width={vw} height={vh} fill="var(--water)" opacity={o} mask={`url(#ripple-${i})`} />
      ))}

      {/* Graticule, under the land so it reads as the sea's grid */}
      <path d={graticule} fill="none" stroke="var(--fg)" strokeOpacity="0.09" strokeWidth="0.8" strokeDasharray="2 5" />

      {/* Neighbouring counties and the islands */}
      <g fill="var(--land)" stroke="var(--ink)" strokeOpacity="0.45" strokeWidth="0.9" strokeDasharray="7 3 1.5 3" strokeLinejoin="round">
        {context.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
      <g fill="var(--land)" stroke="var(--ink)" strokeWidth="1" strokeLinejoin="round">
        {islands.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>

      {/* The two hubs */}
      {hubs.map((h) => (
        <Link key={h} to={`/regions/${h}`} aria-label={h === 'la' ? 'Los Angeles hub' : 'Orange County hub'}>
          <path
            d={counties[h].path}
            fill="var(--land-hub)"
            stroke="var(--fg)"
            strokeOpacity={hover === h ? 0.95 : 0.6}
            strokeWidth={hover === h ? 2 : 1.3}
            strokeLinejoin="round"
            style={{ transition: 'stroke-opacity .3s, opacity .3s', cursor: 'pointer' }}
            opacity={dim(h)}
            onMouseEnter={() => setHover(h)}
            onMouseLeave={() => setHover(null)}
          />
        </Link>
      ))}

      {/* Hub glows */}
      <circle cx={la.x} cy={la.y} r="190" fill="url(#hub-glow)" opacity={dim('la')} pointerEvents="none" />
      <circle cx={oc.x} cy={oc.y} r="150" fill="url(#hub-glow)" opacity={dim('oc')} pointerEvents="none" />

      {/* Landmarks: seas in italic serif, ranges in spaced capitals */}
      <g pointerEvents="none">
        {landmarks.map((l) => (
          <LandmarkLabel key={l.label} l={l} hero={hero} />
        ))}
      </g>

      {/* Links */}
      <g fill="none" stroke="var(--accent)" strokeWidth="0.9" strokeLinecap="round" pointerEvents="none">
        {links.map((l) => (
          <path key={l.id} d={l.d} strokeOpacity={0.35 * dim(l.hub)} style={{ transition: 'stroke-opacity .3s' }} />
        ))}
        <path
          d={arc(la.x, la.y, oc.x, oc.y, -0.18)}
          strokeOpacity="0.75"
          strokeWidth="1.6"
          strokeDasharray="5 7"
        />
      </g>

      {/* Places */}
      {places.map((p) => {
        const hub = p.size === 3;
        const r = hub ? 6.5 : p.size === 2 ? 3.6 : 2.6;
        const left = LABEL_LEFT.has(p.id);
        return (
          <g key={p.id} opacity={dim(p.hub)} style={{ transition: 'opacity .3s' }} pointerEvents="none">
            {hub && (
              <>
                <circle cx={p.x} cy={p.y} r="14" fill="none" stroke="var(--accent)" strokeWidth="1.5" className="pulse" />
                <circle cx={p.x} cy={p.y} r="14" fill="none" stroke="var(--accent)" strokeWidth="1.5" className="pulse pulse-2" />
                <circle cx={p.x} cy={p.y} r="12" fill="var(--accent)" opacity="0.35" filter="url(#soft)" />
              </>
            )}
            {/* Town symbol: a ringed dot, as on a road atlas. */}
            <circle
              cx={p.x}
              cy={p.y}
              r={r}
              fill={hub ? 'var(--accent)' : 'var(--bg)'}
              stroke={hub ? 'var(--bg)' : 'var(--fg)'}
              strokeWidth={hub ? 2 : 1.2}
            />
            {showLabel(p) && (
              <text
                x={left ? p.x - r - 5 : p.x + r + 5}
                y={p.y + 4}
                textAnchor={left ? 'end' : 'start'}
                fill="var(--fg)"
                fillOpacity={hub ? 1 : p.size === 2 ? 0.85 : 0.7}
                fontSize={hub ? 16 : p.size === 2 ? 12.5 : 11}
                fontWeight={hub ? 600 : 500}
                letterSpacing="0.01em"
                stroke="var(--land-hub)"
                strokeWidth="3.5"
                strokeLinejoin="round"
                paintOrder="stroke"
              >
                {p.label}
              </text>
            )}
          </g>
        );
      })}

      {/* County names */}
      <g
        fontSize={hero ? 13 : 15}
        fill="var(--fg)"
        fillOpacity="0.55"
        letterSpacing="0.34em"
        fontWeight="600"
        pointerEvents="none"
        fontFamily={SERIF}
      >
        <text x={hero ? 330 : counties.la.centroid[0] - 120} y={hero ? 405 : counties.la.centroid[1] - 40}>
          LOS ANGELES COUNTY
        </text>
        <text x={counties.oc.centroid[0] + 55} y={counties.oc.centroid[1] + 120}>
          ORANGE COUNTY
        </text>
      </g>

      {/* Degree labels round the edge (full map only) */}
      {!hero && (
        <g fontSize="10" fill="var(--fg)" fillOpacity="0.4" fontFamily={SERIF} fontStyle="italic" pointerEvents="none">
          {meridians.map((m) => (
            <text key={m.label} x={m.x} y={22} textAnchor="middle">
              {m.label}
            </text>
          ))}
          {parallels.map((p) => (
            <text key={p.label} x={12} y={p.y - 4}>
              {p.label}
            </text>
          ))}
        </g>
      )}

      {/* North arrow and scale bar */}
      <g transform={`translate(${fx} ${fy})`} pointerEvents="none" fill="var(--fg)" fontFamily={SERIF}>
        <g transform="translate(0 -46)">
          <circle r="17" fill="none" stroke="var(--fg)" strokeOpacity="0.35" />
          <path d="M0,-14 L5,4 L0,0 L-5,4 Z" fillOpacity="0.85" />
          <path d="M0,14 L5,4 L0,0 L-5,4 Z" fillOpacity="0.25" />
          <text y="-21" fontSize="11" textAnchor="middle" fillOpacity="0.7" fontWeight="600">
            N
          </text>
        </g>
        <g transform="translate(-20 0)">
          {[0, 1, 2, 3].map((i) => (
            <rect
              key={i}
              x={(i * scaleBar.px) / 4}
              y={0}
              width={scaleBar.px / 4}
              height={4}
              fill="var(--fg)"
              fillOpacity={i % 2 ? 0.15 : 0.7}
              stroke="var(--fg)"
              strokeOpacity="0.6"
              strokeWidth="0.6"
            />
          ))}
          <text x={0} y={18} fontSize="10" fillOpacity="0.6">
            0
          </text>
          <text x={scaleBar.px} y={18} fontSize="10" fillOpacity="0.6" textAnchor="middle">
            {scaleBar.miles} mi
          </text>
        </g>
      </g>

      {/* Neatline: the double rule round a printed map (full map only) */}
      {!hero && (
        <g fill="none" stroke="var(--fg)" pointerEvents="none">
          <rect x="4" y="4" width={MAP_W - 8} height={MAP_H - 8} strokeOpacity="0.35" strokeWidth="1.2" />
          <rect x="34" y="34" width={MAP_W - 68} height={MAP_H - 68} strokeOpacity="0.18" strokeWidth="0.6" />
        </g>
      )}
    </svg>
  );
}

function LandmarkLabel({ l, hero }: { l: Landmark; hero: boolean }) {
  if (hero && l.label === 'Mojave Desert') return null;
  const water = l.kind === 'water' || l.kind === 'river';
  const big = l.label === 'Pacific Ocean';
  return (
    <text
      x={l.x}
      y={l.y}
      transform={l.rotate ? `rotate(${l.rotate} ${l.x} ${l.y})` : undefined}
      textAnchor="middle"
      fontFamily={SERIF}
      fontStyle={water || l.kind === 'island' ? 'italic' : 'normal'}
      fontSize={big ? 22 : l.kind === 'river' ? 10 : 12}
      letterSpacing={water ? (big ? '0.28em' : '0.12em') : '0.3em'}
      fill={water ? 'var(--water)' : 'var(--fg)'}
      fillOpacity={water ? 0.95 : 0.4}
    >
      {l.kind === 'range' ? l.label.toUpperCase() : l.label}
    </text>
  );
}
