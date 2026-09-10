import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Pause, RotateCcw, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

/**
 * A live guide for running a 3/3rds group. Three thirds, each with its prompts,
 * a timer, and a place to capture goals. Works offline; nothing leaves the device.
 */
const thirds = [
  {
    key: 'back',
    title: 'Look back',
    parts: [
      ['Care', 'How is everyone? Any needs?'],
      ['Worship', 'A song, a psalm, thanks.'],
      ['Accountability', 'How did you obey last week? Who did you share with?'],
      ['Vision', 'Why we do this — a verse, a story, no place left.'],
    ],
  },
  {
    key: 'up',
    title: 'Look up',
    parts: [
      ['Read', 'Read the passage twice.'],
      ['Retell', 'Someone retells it in their own words.'],
      ['Discuss', 'What does it say about God? About people?'],
      ['Obey', 'What is there to obey? Turn it into "I will…".'],
    ],
  },
  {
    key: 'forward',
    title: 'Look forward',
    parts: [
      ['Practice', 'Practice the passage or a gospel tool in pairs.'],
      ['Goals', 'Who will you share with? What will you obey?'],
      ['Pray', 'Pray for each other and for the names on your lists.'],
    ],
  },
] as const;

const pad = (n: number) => String(n).padStart(2, '0');

export default function ThreeThirds() {
  const [minutesPerThird, setMinutes] = useLocalStorage('npl:3thirds:minutes', 30);
  const [passage, setPassage] = useLocalStorage('npl:3thirds:passage', '');
  const [goals, setGoals] = useLocalStorage<{ share: string; obey: string; date: string }[]>('npl:3thirds:goals', []);
  const [step, setStep] = useState(0);
  const [done, setDone] = useState<Set<string>>(new Set());
  const [remaining, setRemaining] = useState(minutesPerThird * 60);
  const [running, setRunning] = useState(false);
  const [share, setShare] = useState('');
  const [obey, setObey] = useState('');
  const tick = useRef<number | null>(null);

  useEffect(() => {
    setRemaining(minutesPerThird * 60);
    setRunning(false);
  }, [step, minutesPerThird]);

  useEffect(() => {
    if (!running) return;
    tick.current = window.setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => {
      if (tick.current) window.clearInterval(tick.current);
    };
  }, [running]);

  useEffect(() => {
    if (remaining === 0) setRunning(false);
  }, [remaining]);

  const third = thirds[step];
  const pct = useMemo(() => 1 - remaining / (minutesPerThird * 60), [remaining, minutesPerThird]);
  const toggle = (k: string) =>
    setDone((d) => {
      const n = new Set(d);
      n.has(k) ? n.delete(k) : n.add(k);
      return n;
    });

  const saveGoal = () => {
    if (!share.trim() && !obey.trim()) return;
    setGoals((g) => [{ share: share.trim(), obey: obey.trim(), date: new Date().toISOString() }, ...g].slice(0, 20));
    setShare('');
    setObey('');
  };

  return (
    <>
      <section className="border-b border-line">
        <div className="container-x py-12 md:py-16">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="eyebrow">The format</div>
              <h1 className="mt-3 text-4xl md:text-6xl">3/3rds.</h1>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted">
              <label className="flex items-center gap-2">
                <span>Minutes per third</span>
                <input
                  type="number"
                  min={5}
                  max={60}
                  value={minutesPerThird}
                  onChange={(e) => setMinutes(Math.max(5, Math.min(60, Number(e.target.value) || 30)))}
                  className="field !w-16 !py-1.5 text-center"
                />
              </label>
              <Link to="/tools/3-thirds" className="underline-offset-4 hover:underline">
                Why this format
              </Link>
            </div>
          </div>

          {/* Stepper */}
          <ol className="mt-10 grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-line bg-line">
            {thirds.map((t, i) => (
              <li key={t.key}>
                <button
                  onClick={() => setStep(i)}
                  className={`flex w-full flex-col items-start gap-1 p-4 text-left transition md:p-5 ${
                    i === step ? 'bg-fg text-bg' : i < step ? 'bg-surface text-muted' : 'bg-bg text-muted hover:bg-surface'
                  }`}
                >
                  <span className="text-[10px] font-medium uppercase tracking-[0.2em] opacity-70">0{i + 1}</span>
                  <span className="text-base md:text-lg">{t.title}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container-x grid gap-12 py-12 md:grid-cols-[1.4fr_1fr] md:py-16">
        {/* Current third */}
        <div>
          {/* Timer */}
          <div className="card flex items-center justify-between gap-6 p-5">
            <div>
              <div className="eyebrow">{third.title}</div>
              <div className="mt-1 text-5xl font-light tabular-nums tracking-tight">
                {pad(Math.floor(remaining / 60))}:{pad(remaining % 60)}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setRunning((r) => !r)} className="btn-primary !px-4" aria-label={running ? 'Pause' : 'Start'}>
                {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </button>
              <button
                onClick={() => {
                  setRunning(false);
                  setRemaining(minutesPerThird * 60);
                }}
                className="btn-secondary !px-4"
                aria-label="Reset"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="mt-2 h-px w-full bg-line">
            <div className="h-px bg-fg transition-[width] duration-1000" style={{ width: `${pct * 100}%` }} />
          </div>

          {step === 1 && (
            <label className="mt-8 block">
              <span className="eyebrow">Passage</span>
              <input value={passage} onChange={(e) => setPassage(e.target.value)} placeholder="e.g. Luke 10:1–11" className="field mt-2" />
            </label>
          )}

          <ul className="mt-8 divide-y divide-line border-y border-line">
            {third.parts.map(([name, prompt]) => {
              const k = `${third.key}:${name}`;
              const isDone = done.has(k);
              return (
                <li key={k}>
                  <button onClick={() => toggle(k)} className="flex w-full items-start gap-4 py-4 text-left transition hover:bg-fg/5 md:px-2">
                    <span
                      className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition ${
                        isDone ? 'border-fg bg-fg text-bg' : 'border-line-strong'
                      }`}
                    >
                      {isDone && <Check className="h-3 w-3" />}
                    </span>
                    <span>
                      <span className={`block text-lg ${isDone ? 'text-muted line-through' : ''}`}>{name}</span>
                      <span className="block text-sm text-muted">{prompt}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-8 flex justify-between">
            <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="btn-ghost">
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
            {step < 2 ? (
              <button onClick={() => setStep((s) => s + 1)} className="btn-primary">
                Next <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={() => {
                  setStep(0);
                  setDone(new Set());
                }}
                className="btn-secondary"
              >
                Finish
              </button>
            )}
          </div>
        </div>

        {/* Goals */}
        <aside>
          <div className="eyebrow">This week</div>
          <div className="mt-3 space-y-3">
            <input value={share} onChange={(e) => setShare(e.target.value)} placeholder="Who will I share with?" className="field" />
            <input value={obey} onChange={(e) => setObey(e.target.value)} placeholder="What will I obey?" className="field" />
            <button onClick={saveGoal} className="btn-secondary w-full" disabled={!share.trim() && !obey.trim()}>
              Save goal
            </button>
          </div>
          {goals.length > 0 && (
            <ul className="mt-8 divide-y divide-line border-y border-line text-sm">
              {goals.slice(0, 6).map((g, i) => (
                <li key={i} className="py-3">
                  {g.share && <div>Share with {g.share}</div>}
                  {g.obey && <div className="text-muted">{g.obey}</div>}
                  <div className="mt-0.5 text-xs text-faint">{new Date(g.date).toLocaleDateString()}</div>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-6 text-xs text-faint">Saved on this device only.</p>
        </aside>
      </section>
    </>
  );
}
