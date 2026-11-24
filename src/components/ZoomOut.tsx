import { useEffect, useRef } from 'react';
import { geoOrthographic, geoPath, geoGraticule10, geoInterpolate, type GeoPermissibleObjects } from 'd3-geo';
import DATA from './zoom-data.json';

/**
 * The home page's zoom-out: Los Angeles and Orange County, then the United
 * States, then the whole earth — "from here to the ends of the earth".
 *
 * Driven by scroll: the stage is taller than the screen and the globe stays
 * pinned while you scroll through it, so the zoom goes exactly as fast as the
 * reader does and runs backwards when they scroll back up. Drawn on a canvas
 * with an orthographic projection from scripts/build-zoom.mjs data (Natural
 * Earth and Census outlines), so it needs no map service and works offline.
 * With reduced motion it shows the finished globe and does not move.
 */

type LonLat = [number, number];
interface Place {
  id: string;
  label: string;
  lon: number;
  lat: number;
  hub: 'la' | 'oc';
  size: number;
}
const places = DATA.places as Place[];
const LA: LonLat = [-118.2437, 34.0522];
const OC: LonLat = [-117.8678, 33.7455];

// Where the light goes: first across the country, then to the nations.
const US_CITIES: LonLat[] = [
  [-122.42, 37.77], [-122.33, 47.61], [-104.99, 39.74], [-112.07, 33.45], [-96.8, 32.78], [-95.37, 29.76],
  [-87.63, 41.88], [-93.27, 44.98], [-83.05, 42.33], [-84.39, 33.75], [-80.19, 25.76], [-77.04, 38.91], [-74.01, 40.71],
];
const WORLD_CITIES: LonLat[] = [
  [-99.13, 19.43], [-46.63, -23.55], [-0.13, 51.51], [3.38, 6.52], [38.75, 9.03], [31.24, 30.04], [28.98, 41.01],
  [51.39, 35.69], [67.01, 24.86], [77.21, 28.61], [90.41, 23.81], [85.32, 27.72], [106.85, -6.21], [120.98, 14.6],
  [116.4, 39.9], [139.69, 35.69],
];

const C_LA: LonLat = [-118.05, 33.95];
const C_US: LonLat = [-98.5, 38.5];
const C_GLOBE: LonLat = [-60, 16];

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const smooth = (t: number) => t * t * (3 - 2 * t);
/** 0 before a, 1 after b, eased in between. */
const ramp = (p: number, a: number, b: number) => ease(clamp((p - a) / (b - a)));

/** Projection radius that fits each level on this canvas. */
function radiusFor(zoom: 'la' | 'us' | 'globe', w: number, h: number) {
  if (zoom === 'la') return Math.min((w * 0.74) / 0.0255, (h * 0.7) / 0.0235); // LA + OC, ~1.45° × 1.35°
  if (zoom === 'us') return Math.min((w * 0.92) / 1.02, (h * 0.8) / 0.46); // the lower 48
  return Math.min(w, h) * 0.4; // the whole earth
}

/**
 * The camera, as one continuous move. Zoom runs in log space (every doubling
 * takes the same scroll), slows as it passes the United States without ever
 * stopping, and the centre drifts with the zoom rather than on its own clock,
 * so LA never leaves the screen and nothing swings at the last moment.
 */
function frameAt(p: number, w: number, h: number) {
  const rLA = Math.log(radiusFor('la', w, h));
  const rUS = Math.log(radiusFor('us', w, h));
  const rGlobe = Math.log(radiusFor('globe', w, h));
  const zUS = (rLA - rUS) / (rLA - rGlobe); // how far along the zoom the US sits

  // Scroll → zoom: a short rest on LA, then a smooth curve (cubic Hermite,
  // monotone) through the US at about the middle of the scroll. Its speed is
  // continuous everywhere: it eases out of LA, slows as it passes the US
  // without stopping or lurching, and eases into the globe.
  const q = clamp((p - 0.06) / 0.86);
  const z = zoomCurve(q, zUS);
  const radius = Math.exp(rLA + (rGlobe - rLA) * z);

  // Centre follows the zoom: LA → middle of the country → the Atlantic side of
  // the globe, each move spread over the stretch where it reads naturally.
  const toUS = smooth(clamp((z - zUS * 0.3) / (zUS * 0.75)));
  const toGlobe = smooth(clamp((z - zUS) / (1 - zUS)));
  const mid = geoInterpolate(C_LA, C_US)(toUS) as LonLat;
  const center = geoInterpolate(mid, C_GLOBE)(toGlobe) as LonLat;
  return { radius, center };
}

/** Monotone cubic Hermite through (0,0), (Q_US, zUS), (1,1). */
const Q_US = 0.48;
function zoomCurve(q: number, zUS: number) {
  const d1 = zUS / Q_US; // average speed of each leg
  const d2 = (1 - zUS) / (1 - Q_US);
  const m0 = 0.35 * d1; // gentle start out of LA
  const m1 = 0.6 * Math.min(d1, d2); // shared speed at the US: slower, never zero
  const m2 = 0.45 * d2; // gentle arrival at the globe
  const seg = (t: number, y0: number, y1: number, ma: number, mb: number, span: number) => {
    const t2 = t * t;
    const t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * y0 + (t3 - 2 * t2 + t) * span * ma + (-2 * t3 + 3 * t2) * y1 + (t3 - t2) * span * mb;
  };
  return q < Q_US ? seg(q / Q_US, 0, zUS, m0, m1, Q_US) : seg((q - Q_US) / (1 - Q_US), zUS, 1, m1, m2, 1 - Q_US);
}

const GRATICULE = geoGraticule10();

const css = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

/**
 * A theme colour with an alpha. The canvas normalises any CSS colour to
 * #rrggbb; that is done once per colour, since this runs dozens of times a frame.
 */
const rgbCache = new Map<string, string>();
let probe: CanvasRenderingContext2D | null = null;
function rgba(color: string, alpha: number) {
  let rgb = rgbCache.get(color);
  if (!rgb) {
    probe ??= document.createElement('canvas').getContext('2d')!;
    probe.fillStyle = color;
    const n = parseInt((probe.fillStyle as string).slice(1), 16);
    rgb = `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
    rgbCache.set(color, rgb);
  }
  return `rgba(${rgb}, ${alpha})`;
}

interface Theme {
  fg: string;
  accent: string;
}
const readTheme = (): Theme => ({ fg: css('--fg') || '#eef3fb', accent: css('--accent') || '#6ea8ff' });

/**
 * A ring of coordinates cut to the first fraction of its length, so the county
 * borders can trace themselves in when the page opens.
 */
function partial(geom: { coordinates: number[][][] }, k: number): GeoPermissibleObjects {
  const ring = geom.coordinates[0] as LonLat[];
  const n = Math.max(2, Math.ceil(ring.length * k));
  return { type: 'LineString', coordinates: ring.slice(0, n) };
}

function draw(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: number,
  time: number,
  { fg, accent }: Theme,
  /** 0 → 1 over the first moments on the page: borders trace, then everything fills in. */
  intro = 1,
) {
  const { radius, center } = frameAt(p, w, h);
  // The globe rises a little as it forms, to leave room for the caption under it.
  const lift = ramp(p, 0.6, 0.9) * h * 0.08;
  const projection = geoOrthographic()
    .scale(radius)
    .translate([w / 2, h / 2 - lift])
    .rotate([-center[0], -center[1]])
    .clipAngle(90)
    .precision(1);
  const path = geoPath(projection, ctx);
  const shape = (g: GeoPermissibleObjects) => {
    ctx.beginPath();
    path(g);
  };

  ctx.clearRect(0, 0, w, h);
  const out = ramp(p, 0.1, 0.4); // how far we have left LA
  const far = ramp(p, 0.55, 0.85); // how far toward the whole earth

  // The earth: a faint disc and grid, visible once it fits the screen.
  shape({ type: 'Sphere' });
  ctx.fillStyle = rgba(fg, 0.025 * out);
  ctx.fill();
  ctx.strokeStyle = rgba(fg, 0.18 * far);
  ctx.lineWidth = 1;
  ctx.stroke();
  shape(GRATICULE);
  ctx.strokeStyle = rgba(fg, 0.05 * far);
  ctx.stroke();

  // Land: coarse coastline, so it fades in only as we pull away from LA.
  shape(DATA.land as GeoPermissibleObjects);
  ctx.fillStyle = rgba(fg, 0.07 * out);
  ctx.fill();

  // The United States, picked out while it is the view.
  const usOn = ramp(p, 0.18, 0.4) * (1 - 0.6 * far);
  shape(DATA.nation as GeoPermissibleObjects);
  ctx.fillStyle = rgba(accent, 0.07 * usOn);
  ctx.fill();
  ctx.strokeStyle = rgba(fg, 0.35 * usOn);
  ctx.lineWidth = 1;
  ctx.stroke();
  shape(DATA.states as GeoPermissibleObjects);
  ctx.strokeStyle = rgba(fg, 0.12 * usOn * (1 - far));
  ctx.stroke();

  // Los Angeles and Orange County: always there, smaller and smaller. On first
  // load the borders trace themselves in (OC just behind LA), then fill.
  const trace = [ease(clamp(intro / 0.75)), ease(clamp((intro - 0.15) / 0.75))];
  const filled = ease(clamp((intro - 0.55) / 0.45));
  [DATA.la, DATA.oc].forEach((c, i) => {
    if (filled > 0) {
      shape(c as GeoPermissibleObjects);
      ctx.fillStyle = rgba(accent, (0.1 + 0.15 * out) * filled);
      ctx.fill();
    }
    if (trace[i] <= 0) return;
    shape(trace[i] >= 1 ? (c as GeoPermissibleObjects) : partial(c as { coordinates: number[][][] }, trace[i]));
    ctx.strokeStyle = rgba(fg, 0.5 * (1 - out) + 0.15);
    ctx.lineWidth = 1.2;
    ctx.lineJoin = 'round';
    ctx.stroke();
  });

  // The network, while LA fills the screen; it appears once the borders are in.
  const near = (1 - ramp(p, 0.06, 0.22)) * filled;
  if (near > 0.01) {
    const hubs = { la: LA, oc: OC };
    ctx.lineWidth = 0.8;
    for (const pl of places) {
      if (pl.size === 3) continue;
      const a = projection(hubs[pl.hub]);
      const b = projection([pl.lon, pl.lat]);
      if (!a || !b) continue;
      ctx.strokeStyle = rgba(fg, 0.22 * near);
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]);
      ctx.stroke();
    }
    ctx.font = '500 12px ui-sans-serif, system-ui, sans-serif';
    for (const pl of places) {
      const xy = projection([pl.lon, pl.lat]);
      if (!xy) continue;
      const r = pl.size === 3 ? 6 : pl.size === 2 ? 3.5 : 2.5;
      ctx.fillStyle = pl.size === 3 ? rgba(accent, near) : rgba(fg, 0.9 * near);
      ctx.beginPath();
      ctx.arc(xy[0], xy[1], r, 0, Math.PI * 2);
      ctx.fill();
      if (pl.size >= 2) {
        ctx.fillStyle = rgba(fg, (pl.size === 3 ? 1 : 0.7) * near);
        ctx.font = pl.size === 3 ? '600 14px ui-sans-serif, system-ui, sans-serif' : '500 12px ui-sans-serif, system-ui, sans-serif';
        ctx.fillText(pl.label, xy[0] + r + 6, xy[1] + 4);
      }
    }
  }

  // Light going out: across the country, then to the nations.
  const arcs = (targets: LonLat[], from: number, to: number, alpha: number) => {
    const grow = ramp(p, from, to);
    if (grow <= 0) return;
    targets.forEach((t, i) => {
      // Stagger: each line starts a little after the one before.
      const k = clamp(grow * 1.6 - (i / targets.length) * 0.6);
      if (k <= 0) return;
      const line = geoInterpolate(LA, t);
      const coords: LonLat[] = Array.from({ length: 33 }, (_, j) => line((j / 32) * k) as LonLat);
      shape({ type: 'LineString', coordinates: coords });
      ctx.strokeStyle = rgba(accent, 0.55 * alpha);
      ctx.lineWidth = 1.4;
      ctx.stroke();
      if (k >= 1) {
        const xy = projection(t);
        if (xy) {
          ctx.fillStyle = rgba(accent, 0.9 * alpha);
          ctx.beginPath();
          ctx.arc(xy[0], xy[1], 2.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    });
  };
  arcs(US_CITIES, 0.3, 0.55, 1 - 0.5 * far);
  arcs(WORLD_CITIES, 0.62, 0.92, 1);

  // Los Angeles itself: a beacon that pulses at every scale.
  const home = projection(LA);
  if (home) {
    const glow = ctx.createRadialGradient(home[0], home[1], 0, home[0], home[1], 70);
    glow.addColorStop(0, rgba(accent, 0.45));
    glow.addColorStop(1, rgba(accent, 0));
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(home[0], home[1], 70, 0, Math.PI * 2);
    ctx.fill();
    for (const offset of [0, 0.5]) {
      const ph = ((time / 2800 + offset) % 1 + 1) % 1;
      ctx.strokeStyle = rgba(accent, 0.6 * (1 - ph));
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(home[0], home[1], 6 + ph * 26, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = rgba(accent, 1);
    ctx.beginPath();
    ctx.arc(home[0], home[1], 4.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

const CAPTIONS = [
  { from: -1, to: 0.24, title: 'Los Angeles & Orange County', sub: 'Every neighborhood. Every people.' },
  { from: 0.36, to: 0.64, title: 'Across the United States', sub: 'Disciples who make disciples, sent from here.' },
  {
    from: 0.76,
    to: 2,
    title: 'To the ends of the earth',
    sub: '“You will be my witnesses in Jerusalem, and in all Judea and Samaria, and to the end of the earth.” — Acts 1:8',
  },
];

export default function ZoomOut() {
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const captions = useRef<(HTMLDivElement | null)[]>([]);
  const hint = useRef<HTMLDivElement>(null);
  const still = typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    const el = canvas.current;
    const box = stage.current;
    if (!el || !box) return;
    const ctx = el.getContext('2d');
    if (!ctx) return;
    let raf = 0;
    let visible = true;
    let size = { w: 0, h: 0 };
    let theme = readTheme();
    // `shown` glides toward the scroll position instead of jumping to it, so a
    // mouse wheel's steps and a phone's flicks become one smooth move.
    let shown = still ? 1 : read();
    let last = performance.now();
    const born = performance.now();

    function read() {
      if (still) return 1;
      const r = box!.getBoundingClientRect();
      const run = r.height - el!.getBoundingClientRect().height;
      return run > 0 ? clamp(-r.top / run) : 0;
    }
    const resize = () => {
      const r = el.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      el.width = Math.round(r.width * dpr);
      el.height = Math.round(r.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      size = { w: r.width, h: r.height };
    };
    // Captions cross-fade with the scroll itself, written straight to the DOM:
    // no React render in the animation loop.
    const paintCaptions = (p: number) => {
      CAPTIONS.forEach((c, i) => {
        const node = captions.current[i];
        if (!node) return;
        const fadeIn = c.from < 0 ? 1 : clamp((p - c.from) / 0.07);
        const fadeOut = c.to > 1 ? 1 : clamp((c.to - p) / 0.07);
        const o = Math.min(fadeIn, fadeOut);
        node.style.opacity = String(o);
        node.style.transform = `translateY(${(1 - o) * 10}px)`;
        node.setAttribute('aria-hidden', o < 0.5 ? 'true' : 'false');
      });
      if (hint.current) hint.current.style.opacity = String(clamp(1 - p / 0.04));
    };
    const render = (time: number) => {
      const intro = still ? 1 : clamp((time - born) / 1800);
      draw(ctx, size.w, size.h, shown, still ? 0 : time, theme, intro);
      paintCaptions(shown);
    };
    const frame = (time: number) => {
      const dt = Math.min(64, time - last);
      last = time;
      const target = read();
      // Critically damped follow: covers ~63% of the gap every 110ms.
      shown += (target - shown) * (1 - Math.exp(-dt / 110));
      if (Math.abs(target - shown) < 0.0004) shown = target;
      render(time);
      if (visible && !still) raf = requestAnimationFrame(frame);
    };

    resize();
    if (still) render(0);
    else raf = requestAnimationFrame(frame);
    const ro = new ResizeObserver(() => {
      resize();
      render(performance.now());
    });
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => {
      const was = visible;
      visible = e.isIntersecting;
      if (visible && !was && !still) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    });
    io.observe(box);
    // Light/dark switches change the colours.
    const mo = new MutationObserver(() => {
      theme = readTheme();
      render(performance.now());
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
    };
  }, [still]);

  return (
    <div ref={stage} className={still ? 'relative' : 'relative h-[260vh]'}>
      <div className="sticky top-[var(--header-h)] h-[calc(100svh_-_var(--header-h)_-_4.5rem)] md:h-[calc(100svh_-_var(--header-h))]">
        <canvas
          ref={canvas}
          className="h-full w-full"
          role="img"
          aria-label="Map zooming out from Los Angeles and Orange County, to the United States, to the whole earth"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center px-6 md:bottom-10">
          <div className="relative h-28 w-full max-w-xl text-center">
            {CAPTIONS.map((c, i) => (
              <div
                key={c.title}
                ref={(n) => {
                  captions.current[i] = n;
                }}
                className="absolute inset-x-0 bottom-0 will-change-transform"
                style={{ opacity: still ? (c.to > 1 ? 1 : 0) : i === 0 ? 1 : 0 }}
              >
                <div className="text-2xl font-medium tracking-tight md:text-3xl">{c.title}</div>
                <p className="mx-auto mt-1.5 max-w-md text-sm text-muted">{c.sub}</p>
              </div>
            ))}
          </div>
        </div>
        {!still && (
          <div
            ref={hint}
            className="pointer-events-none absolute inset-x-0 top-3 text-center text-[11px] uppercase tracking-[0.22em] text-faint"
          >
            Scroll
          </div>
        )}
      </div>
    </div>
  );
}
