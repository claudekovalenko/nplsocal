import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, ArrowUpRight, Plus, Minus } from 'lucide-react';
import { FOCUS, REGIONS, BIBLE, refLabel, type Lang } from '@/content/pray/plan';
import { T } from '@/content/pray/strings';
import {
  DAYS, LIT, SHAPES, SHAPE_DAY, SECTIONS, MAP_LAND, MAP_CONTEXT, FULL_VIEW,
  tr, todayN, dateOf, bounds, type PlanId, type Day,
} from '@/lib/pray';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const browserLang = (): Lang => (navigator.language?.toLowerCase().startsWith('es') ? 'es' : 'en');

/** Two-option switch, used for the plan and the language. */
function Seg<V extends string>({ label, value, options, onChange }: {
  label: string;
  value: V;
  options: readonly (readonly [V, string])[];
  onChange: (v: V) => void;
}) {
  return (
    <div role="group" aria-label={label} className="inline-flex gap-0.5 rounded-full border border-line-strong p-[3px]">
      {options.map(([v, text]) => (
        <button
          key={v}
          type="button"
          aria-pressed={value === v}
          onClick={() => onChange(v)}
          className={`h-8 rounded-full px-3.5 text-[13px] font-medium transition active:scale-[0.96] ${
            value === v ? 'bg-fg text-bg' : 'text-muted hover:text-fg'
          }`}
        >
          {text}
        </button>
      ))}
    </div>
  );
}

// ---------- map ----------
function useFlyTo(svg: React.RefObject<SVGSVGElement | null>) {
  const vb = useRef<number[]>([...FULL_VIEW]);
  const anim = useRef(0);
  return useCallback(
    (target: number[]) => {
      const set = (v: number[]) => {
        vb.current = v;
        svg.current?.setAttribute('viewBox', v.map((x) => x.toFixed(2)).join(' '));
      };
      cancelAnimationFrame(anim.current);
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return set(target);
      const from = vb.current.slice();
      const t0 = performance.now();
      const step = (now: number) => {
        const p = Math.min((now - t0) / 650, 1);
        const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        set(from.map((x, i) => x + (target[i] - x) * e));
        if (p < 1) anim.current = requestAnimationFrame(step);
      };
      anim.current = requestAnimationFrame(step);
    },
    [svg],
  );
}

function PrayMap({ plan, day, done, lang, onPick }: {
  plan: PlanId;
  day: Day;
  done: Set<number>;
  lang: Lang;
  onPick: (n: number) => void;
}) {
  const t = T[lang];
  const box = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const flyTo = useFlyTo(svg);
  const [whole, setWhole] = useState(false);
  useEffect(() => setWhole(false), [day.n, plan]);

  const list = DAYS[plan];
  const lit = useMemo(() => new Set(LIT[plan][day.n - 1]), [plan, day.n]);
  const doneShapes = useMemo(() => {
    const s = new Set<number>();
    done.forEach((n) => {
      const d = list[n - 1];
      if (d && (d.t === 'p' || d.t === 'q')) LIT[plan][n - 1].forEach((x) => s.add(x.i));
    });
    return s;
  }, [done, list, plan]);
  const tint = (i: number) => {
    if (whole) return false;
    const s = SHAPES[i];
    if (day.t === 'p') return s.r === day.r;
    if (day.t === 'q') return s.day === day.group?.n;
    return false;
  };

  const target = useCallback(() => {
    let b: number[];
    let span = 160;
    if (!whole && lit.size) {
      b = bounds([...lit]);
      span = day.t === 'p' ? 190 : day.t === 'q' ? 150 : 160;
    } else {
      b = [FULL_VIEW[0], FULL_VIEW[1], FULL_VIEW[0] + FULL_VIEW[2], FULL_VIEW[1] + FULL_VIEW[3]];
      span = 0;
    }
    let w = Math.max((b[2] - b[0]) * 1.5, span);
    let h = Math.max((b[3] - b[1]) * 1.5, span);
    if (!span) [w, h] = [b[2] - b[0], b[3] - b[1]];
    const r = box.current?.getBoundingClientRect();
    const ar = r && r.height ? r.width / r.height : 1;
    if (w / h < ar) w = h * ar;
    else h = w / ar;
    const cx = (b[0] + b[2]) / 2;
    const cy = (b[1] + b[3]) / 2;
    return [cx - w / 2, cy - h / 2, w, h];
  }, [whole, lit, day.t]);

  useEffect(() => flyTo(target()), [flyTo, target]);
  useEffect(() => {
    const onResize = () => flyTo(target());
    addEventListener('resize', onResize);
    return () => removeEventListener('resize', onResize);
  }, [flyTo, target]);

  const pin = (day.t === 'p' || day.t === 'q') && lit.size ? bounds([...lit]) : null;
  const county = (r?: keyof typeof REGIONS) => (r ? t.county[REGIONS[r].hub] : '');
  const sub =
    day.t === 'p' ? `${tr(REGIONS[day.r!].name, lang)} · ${county(day.r)}`
    : day.t === 'q' ? `${tr(day.group!.title, lang)} · ${tr(REGIONS[day.r!].name, lang)}`
    : day.t === 'r' ? `${t.region} · ${county(day.r)}`
    : day.t === 'f' ? t.focusDay : t.both;
  // highlighted shapes are drawn last, so their outlines sit on top
  const order = useMemo(() => [...SHAPES.filter((s) => !lit.has(s)), ...SHAPES.filter((s) => lit.has(s))], [lit]);

  return (
    <div ref={box} className="praymap relative h-[min(56vh,520px)] min-h-80 overflow-hidden rounded-xl border border-line md:h-[560px]">
      <svg
        ref={svg}
        role="img"
        aria-label={t.mapLabel}
        viewBox={FULL_VIEW.join(' ')}
        preserveAspectRatio="xMidYMid meet"
        className="block h-full w-full touch-manipulation"
        onClick={(e) => {
          const i = (e.target as Element).getAttribute('data-i');
          if (i !== null) onPick(SHAPE_DAY[plan][+i]);
        }}
      >
        <g>
          {MAP_CONTEXT.map((d, i) => <path key={i} d={d} className="ctx" />)}
          {MAP_LAND.map((d, i) => <path key={i} d={d} className="base" />)}
        </g>
        <g>
          {order.map((s) => {
            const cls = lit.has(s) ? 'z on' : doneShapes.has(s.i) ? 'z done' : tint(s.i) ? 'z reg' : 'z';
            const dn = SHAPE_DAY[plan][s.i];
            return (
              <path key={s.i} d={s.d} data-i={s.i} className={cls}>
                <title>{`${s.c ? s.c + ' · ' : ''}${s.z} · ${t.tipDay} ${dn}: ${tr(list[dn - 1].title, lang)}`}</title>
              </path>
            );
          })}
        </g>
        {MAP_LAND.map((d, i) => <path key={i} d={d} className="cline" />)}
        {pin && (
          <circle
            className="pin"
            cx={(pin[0] + pin[2]) / 2}
            cy={(pin[1] + pin[3]) / 2}
            r={Math.max(pin[2] - pin[0], pin[3] - pin[1]) * 0.75 + 4}
          />
        )}
      </svg>
      <div className="pointer-events-none absolute inset-x-3 bottom-3 flex items-end justify-between gap-2.5">
        <div className="pointer-events-auto max-w-[72%] rounded-lg border border-line bg-elev px-3 py-2 text-[12.5px] text-muted">
          <b className="block text-[14.5px] font-semibold leading-tight text-fg">{tr(day.title, lang)}</b>
          {sub}
          {done.size > 0 && (
            <span className="mt-1 flex items-center gap-1.5 text-[11.5px]">
              <i className="praymap-swatch inline-block h-2.5 w-2.5 rounded-sm border border-line" />
              {t.legend}
            </span>
          )}
        </div>
        {lit.size > 0 && (
          <button
            type="button"
            onClick={() => setWhole((w) => !w)}
            className="pointer-events-auto whitespace-nowrap rounded-full border border-line bg-elev px-3 py-1.5 text-[12.5px] font-semibold transition hover:border-accent hover:text-accent"
          >
            {whole ? t.back : t.whole}
          </button>
        )}
      </div>
    </div>
  );
}

// ---------- page ----------
export default function Pray() {
  const [lang, setLang] = useLocalStorage<Lang>('pray.lang', browserLang());
  const [plan, setPlan] = useLocalStorage<PlanId>('pray.plan', '100');
  const [done100, setDone100] = useLocalStorage<number[]>('pray.done.100', []);
  const [done365, setDone365] = useLocalStorage<number[]>('pray.done.365', []);
  const [cur100, setCur100] = useLocalStorage<number>('pray.cur.100', 1);
  // The year plan opens on today's date until someone moves off it.
  const [cur365, setCur365] = useLocalStorage<number | null>('pray.cur.365', null);
  const [openSecs, setOpenSecs] = useState<Set<string>>(new Set());
  const cardRef = useRef<HTMLElement>(null);

  const t = T[lang];
  const list = DAYS[plan];
  const done = useMemo(() => new Set(plan === '365' ? done365 : done100), [plan, done100, done365]);
  const cur = Math.min(Math.max((plan === '365' ? cur365 ?? todayN : cur100) || 1, 1), list.length);
  const day = list[cur - 1];
  const src = day.src;
  const isPlace = day.t === 'p' || day.t === 'q';

  useEffect(() => {
    document.documentElement.lang = lang;
    return () => {
      document.documentElement.lang = 'en';
    };
  }, [lang]);

  const go = (n: number) => {
    const v = Math.min(Math.max(n, 1), list.length);
    if (plan === '365') setCur365(v);
    else setCur100(v);
  };
  const togglePrayed = () => {
    const set = plan === '365' ? setDone365 : setDone100;
    set((arr) => (arr.includes(day.n) ? arr.filter((x) => x !== day.n) : [...arr, day.n]));
  };
  const switchPlan = (p: PlanId) => {
    setOpenSecs(new Set());
    setPlan(p);
  };

  const prayLine = isPlace
    ? t.pDay(tr(day.title, lang))
    : src.who
      ? src.pp ? t.pWho(tr(src.pp, lang)) : t.pChurch
      : '';
  const where = isPlace ? tr(day.title, lang) : day.t === 'r' ? tr(REGIONS[day.r!].name, lang) : t.everywhere;
  const regionLabel = isPlace ? tr(REGIONS[day.r!].name, lang) : day.t === 'r' ? t.county[REGIONS[day.r!].hub] : '';
  const desc = day.t === 'q' ? `${t.partOf}: ${tr(day.group!.title, lang)}` : src.desc ? tr(src.desc, lang) : '';
  const [progressA, progressB] = t.progress(list.length);
  const pct = (done.size / list.length) * 100;
  const kindTone =
    day.t === 'r' ? 'border-accent/45 text-accent' : day.t === 'f' ? 'border-accent-2/45 text-accent-2' : 'border-line-strong text-muted';

  return (
    <section className="container-x max-w-2xl py-10 md:py-14">
      <div className="flex flex-wrap gap-2">
        <Seg label="Plan" value={plan} onChange={switchPlan} options={[['100', t.plans['100']], ['365', t.plans['365']]] as const} />
        <Seg label="Language / Idioma" value={lang} onChange={setLang} options={[['en', 'EN'], ['es', 'ES']] as const} />
      </div>

      <div className="eyebrow mt-6">{t.eyebrow}</div>
      <h1 className="mt-3 text-4xl leading-[1.05] md:text-5xl">{t.h1[plan]}</h1>
      <p className="mt-4 text-muted">{`${t.intro[plan]} ${t.saved}`}</p>

      <div className="mt-6">
        <div className="flex justify-between text-[13px] tabular-nums text-muted">
          <span>
            {progressA}
            <b className="font-semibold text-fg">{done.size}</b>
            {progressB}
          </span>
          <span>{Math.round(pct)}%</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface">
          <i className="block h-full rounded-full bg-gradient-to-r from-accent to-accent-2 transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="mt-6">
        <PrayMap plan={plan} day={day} done={done} lang={lang} onPick={go} />
      </div>

      <article ref={cardRef} aria-live="polite" className="card mt-4 grid scroll-mt-[var(--header-h)] gap-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[13px] tabular-nums text-muted">
            {t.dayOf(day.n, list.length)}
            {plan === '365' && ` · ${dateOf(day.n, t.locale)}`}
          </span>
          <span className="flex items-center gap-2">
            {plan === '365' && cur !== todayN && (
              <button
                type="button"
                onClick={() => go(todayN)}
                className="h-6 rounded-full border border-accent/45 px-2.5 text-[11px] font-semibold text-accent"
              >
                {t.today}
              </button>
            )}
            <span className={`inline-flex h-6 items-center whitespace-nowrap rounded-full border px-2.5 text-[11px] font-medium ${kindTone}`}>
              {t.kinds[day.t]}
            </span>
          </span>
        </div>

        <div>
          {regionLabel && <div className="eyebrow">{regionLabel}</div>}
          <h2 className="mt-2 text-2xl leading-tight md:text-3xl">{tr(day.title, lang)}</h2>
        </div>
        {desc && <p className="text-muted">{desc}</p>}

        {src.who && !isPlace && (
          <div>
            <div className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-faint">{t.who}</div>
            <ul className="grid gap-2 text-muted">
              {src.who.map((w) => (
                <li key={w} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full border border-faint" />
                  {tr(w, lang)}
                </li>
              ))}
            </ul>
          </div>
        )}

        {day.t === 'p' && (
          <div>
            <div className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-faint">{t.through}</div>
            <div className="flex flex-wrap gap-1.5">
              {src.places!.map((p) => (
                <span key={p} className="rounded-full bg-surface px-2.5 py-0.5 text-[12.5px]">
                  {p}
                </span>
              ))}
            </div>
          </div>
        )}

        {prayLine && (
          <div>
            <div className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-faint">{t.pray}</div>
            <p className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent shadow-[0_0_10px_var(--glow)]" />
              {prayLine}
            </p>
          </div>
        )}

        {src.ref && (
          <a
            href={BIBLE(src.ref[1], lang)}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between gap-3 rounded-lg border border-line px-3.5 py-3 transition hover:border-line-strong"
          >
            <span>
              <span className="block font-medium">{refLabel(src.ref, lang)}</span>
              <span className="text-xs text-faint">{t.verseNote}</span>
            </span>
            <ArrowUpRight className="h-4 w-4 text-muted" />
          </a>
        )}

        <details className="group rounded-lg border border-line">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3.5 py-3 font-medium">
            <span>
              {t.more} <span className="ml-1 text-[12.5px] font-normal text-faint">{t.moreSub}</span>
            </span>
            <Plus className="h-4 w-4 text-faint group-open:hidden" />
            <Minus className="hidden h-4 w-4 text-faint group-open:block" />
          </summary>
          <ol className="grid gap-3.5 px-3.5 pb-3.5">
            {FOCUS.map((f) => (
              <li key={f.ref[1]} className="grid gap-0.5 text-sm">
                <b className="text-[13px] font-semibold">{f[lang][0]}</b>
                <span className="text-muted">{f[lang][1].replace('{m}', where)}</span>
                <a href={BIBLE(f.ref[1], lang)} target="_blank" rel="noreferrer" className="w-fit text-[12.5px] text-accent hover:underline">
                  {refLabel(f.ref, lang)} ↗
                </a>
              </li>
            ))}
          </ol>
        </details>

        <div className="grid grid-cols-[auto_1fr_auto] gap-2">
          <button type="button" className="btn-secondary h-11 px-4" aria-label={t.prev} disabled={cur === 1} onClick={() => go(cur - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={togglePrayed}
            className={done.has(day.n) ? 'btn-secondary h-11 border-accent-2/55 text-accent-2' : 'btn-primary h-11'}
          >
            {done.has(day.n) ? (
              <>
                <Check className="h-4 w-4" /> {t.prayedDone}
              </>
            ) : (
              t.prayed
            )}
          </button>
          <button type="button" className="btn-secondary h-11 px-4" aria-label={t.next} disabled={cur === list.length} onClick={() => go(cur + 1)}>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </article>

      <div className="mt-12">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-xl">{t.allDays(list.length)}</h3>
          <span className="text-[13px] text-muted">{t.sections(SECTIONS[plan].length)}</span>
        </div>
        <div className="mt-3">
          {SECTIONS[plan].map((s) => {
            const first = s.days[0].n;
            const last = s.days[s.days.length - 1].n;
            const open = openSecs.has(s.key) || s.days.some((d) => d.n === cur);
            const title =
              s.key === 'start' ? t.secStart : s.key === 'end' ? t.secEnd(last) : s.key === 'both' ? t.secBoth
              : `${tr(REGIONS[s.r!].name, lang)} · ${t.countyShort[REGIONS[s.r!].hub]}`;
            const nDone = s.days.filter((d) => done.has(d.n)).length;
            return (
              <details
                key={plan + s.key}
                open={open}
                onToggle={(e) => {
                  const isOpen = (e.currentTarget as HTMLDetailsElement).open;
                  setOpenSecs((o) => {
                    const n = new Set(o);
                    if (isOpen) n.add(s.key);
                    else n.delete(s.key);
                    return n;
                  });
                }}
                className="group border-t border-line"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-3.5">
                  <span className="font-medium">{title}</span>
                  <span className="flex items-center gap-2.5 whitespace-nowrap text-[12.5px] tabular-nums text-muted">
                    {first === last ? `${t.tipDay} ${first}` : `${t.days} ${first}–${last}`} · {nDone}/{s.days.length}
                    <ChevronRight className="h-3.5 w-3.5 text-faint transition group-open:rotate-90" />
                  </span>
                </summary>
                <ul className="mb-3 grid gap-0.5">
                  {s.days.map((d) => (
                    <li key={d.n}>
                      <button
                        type="button"
                        aria-current={d.n === cur}
                        onClick={() => {
                          go(d.n);
                          cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }}
                        className={`grid w-full grid-cols-[34px_1fr_20px] items-center gap-2 rounded-lg px-2.5 py-2 text-left transition hover:bg-surface ${
                          d.n === cur ? 'bg-accent/12' : ''
                        }`}
                      >
                        <span className="text-[12.5px] tabular-nums text-faint">{d.n}</span>
                        <span className="truncate text-sm">
                          {d.t === 'f' && t.focusPrefix}
                          {tr(d.title, lang)}
                          {plan === '365' && ` · ${dateOf(d.n, t.locale)}`}
                        </span>
                        <span
                          className={`grid h-[18px] w-[18px] place-items-center rounded-full border-[1.5px] ${
                            done.has(d.n) ? 'border-accent-2 bg-accent-2 text-bg' : 'border-line-strong'
                          }`}
                        >
                          {done.has(d.n) && <Check className="h-3 w-3" strokeWidth={3} />}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </details>
            );
          })}
        </div>
      </div>
    </section>
  );
}
