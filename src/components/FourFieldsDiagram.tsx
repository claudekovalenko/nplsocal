import { Link } from 'react-router-dom';
import { fields } from '@/content';

/**
 * The classic Four Fields drawing: a square split into four, with
 * leadership in the center circle. Each quadrant links to its field.
 */
export default function FourFieldsDiagram({ compact = false }: { compact?: boolean }) {
  const f = (id: string) => fields.find((x) => x.id === id)!;
  // Content sits in each quadrant's outer corner so the center circle never covers it.
  const cell = (id: string, extra: string, align: string) => {
    const field = f(id);
    return (
      <Link
        to={`/four-fields#${id}`}
        className={`group flex flex-col p-4 transition hover:bg-sun-50 dark:hover:bg-ink-800 ${extra} ${align}`}
      >
        <span className="text-[11px] font-semibold uppercase tracking-widest text-ink-400">Field {field.number}</span>
        <span className="block font-display text-lg font-bold">{field.name}</span>
        {!compact && <span className="block max-w-[11rem] text-xs text-ink-500 dark:text-ink-300">{field.question}</span>}
      </Link>
    );
  };
  return (
    <div className="relative mx-auto grid aspect-square w-full max-w-md grid-cols-2 overflow-hidden rounded-3xl border-2 border-ink-900 bg-white dark:border-white dark:bg-ink-900">
      {cell('entry', 'border-b-2 border-r-2 border-ink-900 dark:border-white', 'items-start justify-start text-left')}
      {cell('gospel', 'border-b-2 border-ink-900 dark:border-white', 'items-end justify-start text-right')}
      {cell('church', 'border-r-2 border-ink-900 dark:border-white', 'items-start justify-end text-left')}
      {cell('discipleship', '', 'items-end justify-end text-right')}
      <Link
        to="/four-fields#leadership"
        className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border-2 border-ink-900 bg-sun-500 text-center text-white shadow-lg transition hover:scale-105 dark:border-white"
      >
        <span className="text-[10px] font-semibold uppercase tracking-widest opacity-90">Center</span>
        <span className="font-display text-sm font-bold leading-tight">Leadership</span>
      </Link>
    </div>
  );
}
