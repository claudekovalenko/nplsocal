import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MAP_W, MAP_H, counties, context, places, type Place } from './map-data';

type Variant = 'hero' | 'full';

/**
 * LA County + Orange County drawn from real boundary data, with the network
 * shown as nodes. Pure SVG — no runtime map library, works offline.
 */
export default function NetworkMap({ variant = 'full', className = '' }: { variant?: Variant; className?: string }) {
  const [hover, setHover] = useState<'la' | 'oc' | null>(null);
  const dim = (hub: 'la' | 'oc') => (hover && hover !== hub ? 0.25 : 1);
  const hubs: ('la' | 'oc')[] = ['la', 'oc'];
  const byHub = (h: 'la' | 'oc') => places.filter((p) => p.hub === h);
  const center = (h: 'la' | 'oc') => byHub(h).find((p) => p.size === 3)!;

  // simple radial links: every node in a hub connects to that hub's center
  const links = hubs.flatMap((h) => {
    const c = center(h);
    return byHub(h)
      .filter((p) => p !== c)
      .map((p) => ({ id: `${h}-${p.id}`, hub: h, x1: c.x, y1: c.y, x2: p.x, y2: p.y }));
  });
  const la = center('la');
  const oc = center('oc');

  const labelFor = (p: Place) => (variant === 'full' ? p.label : p.size >= 2 ? p.label : '');

  // Hero: crop to the LA basin + OC and fade the cut edges so it reads as an object, not a cut-off map.
  const viewBox = variant === 'hero' ? '120 240 880 720' : `0 0 ${MAP_W} ${MAP_H}`;
  const style =
    variant === 'hero'
      ? {
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 18%, black 92%, transparent 100%)',
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 18%, black 92%, transparent 100%)',
        }
      : undefined;
  const laCaption = variant === 'hero' ? [560, 300] : [counties.la.centroid[0] - 40, counties.la.centroid[1] - 210];

  return (
    <svg
      viewBox={viewBox}
      style={style}
      className={className}
      role="img"
      aria-label="Map of Los Angeles County and Orange County showing the No Place Left SoCal network"
    >
      <defs>
        <radialGradient id="hub-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="land" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--fg)" stopOpacity="0.06" />
          <stop offset="100%" stopColor="var(--fg)" stopOpacity="0.015" />
        </linearGradient>
        <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" />
        </filter>
      </defs>

      {/* Neighboring counties, very faint, for geographic context */}
      <g fill="none" stroke="var(--fg)" strokeOpacity="0.10" strokeWidth="1">
        {context.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>

      {/* Hub glows */}
      <circle cx={la.x} cy={la.y} r="210" fill="url(#hub-glow)" opacity={0.7 * dim('la')} />
      <circle cx={oc.x} cy={oc.y} r="170" fill="url(#hub-glow)" opacity={0.7 * dim('oc')} />

      {/* Counties */}
      {hubs.map((h) => (
        <Link key={h} to={`/hubs/${h}`} aria-label={h === 'la' ? 'Los Angeles hub' : 'Orange County hub'}>
          <path
            d={counties[h].path}
            fill="url(#land)"
            stroke="var(--fg)"
            strokeOpacity={hover === h ? 0.9 : 0.45}
            strokeWidth={hover === h ? 2 : 1.4}
            strokeLinejoin="round"
            style={{ transition: 'stroke-opacity .3s, opacity .3s', cursor: 'pointer' }}
            opacity={dim(h)}
            onMouseEnter={() => setHover(h)}
            onMouseLeave={() => setHover(null)}
          />
        </Link>
      ))}

      {/* Inter-hub link */}
      <line
        x1={la.x}
        y1={la.y}
        x2={oc.x}
        y2={oc.y}
        stroke="var(--accent)"
        strokeOpacity="0.6"
        strokeWidth="1.5"
        strokeDasharray="4 8"
        strokeLinecap="round"
      />

      {/* Links */}
      <g stroke="var(--fg)" strokeWidth="0.8" strokeLinecap="round">
        {links.map((l) => (
          <line key={l.id} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} strokeOpacity={0.22 * dim(l.hub)} style={{ transition: 'stroke-opacity .3s' }} />
        ))}
      </g>

      {/* Nodes */}
      {places.map((p) => {
        const r = p.size === 3 ? 7 : p.size === 2 ? 4.5 : 3;
        const label = labelFor(p);
        return (
          <g key={p.id} opacity={dim(p.hub)} style={{ transition: 'opacity .3s' }} pointerEvents="none">
            {p.size === 3 && (
              <>
                <circle cx={p.x} cy={p.y} r="14" fill="none" stroke="var(--accent)" strokeWidth="1.5" className="pulse" />
                <circle cx={p.x} cy={p.y} r="14" fill="none" stroke="var(--accent)" strokeWidth="1.5" className="pulse pulse-2" />
                <circle cx={p.x} cy={p.y} r="12" fill="var(--accent)" opacity="0.35" filter="url(#soft)" />
              </>
            )}
            <circle cx={p.x} cy={p.y} r={r} fill={p.size === 3 ? 'var(--accent)' : 'var(--fg)'} />
            {label && (
              <text
                x={p.x + r + 6}
                y={p.y + 4}
                fill="var(--fg)"
                fillOpacity={p.size === 3 ? 1 : 0.6}
                fontSize={p.size === 3 ? 15 : 12}
                fontWeight={p.size === 3 ? 500 : 400}
                letterSpacing="0.02em"
              >
                {label}
              </text>
            )}
          </g>
        );
      })}

      {/* County captions */}
      <g fontSize="12" fill="var(--fg)" fillOpacity="0.45" letterSpacing="0.28em" fontWeight="500" pointerEvents="none">
        <text x={laCaption[0]} y={laCaption[1]}>LOS ANGELES COUNTY</text>
        <text x={counties.oc.centroid[0] + 40} y={counties.oc.centroid[1] + 110}>ORANGE COUNTY</text>
      </g>
    </svg>
  );
}
