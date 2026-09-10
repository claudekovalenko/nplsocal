import { Link } from 'react-router-dom';
import { fields } from '@/content';

/** The Four Fields drawing: a square split in four, leadership at the center. */
export default function FourFieldsDiagram({ compact = false }: { compact?: boolean }) {
  const f = (id: string) => fields.find((x) => x.id === id)!;
  const cell = (id: string, extra: string, align: string) => {
    const field = f(id);
    return (
      <Link
        to={`/four-fields#${id}`}
        className={`group flex flex-col p-5 transition hover:bg-fg/5 ${extra} ${align}`}
      >
        <span className="eyebrow">0{field.number}</span>
        <span className="mt-1 block text-lg">{field.name}</span>
        {!compact && <span className="mt-0.5 block max-w-[10rem] text-xs leading-snug text-muted">{field.question}</span>}
      </Link>
    );
  };
  return (
    <div className="relative mx-auto grid aspect-square w-full max-w-md grid-cols-2 overflow-hidden rounded-xl border border-line-strong bg-elev">
      {cell('entry', 'border-b border-r border-line-strong', 'items-start justify-start text-left')}
      {cell('gospel', 'border-b border-line-strong', 'items-end justify-start text-right')}
      {cell('church', 'border-r border-line-strong', 'items-start justify-end text-left')}
      {cell('discipleship', '', 'items-end justify-end text-right')}
      <Link
        to="/four-fields#leadership"
        className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-line-strong bg-bg text-center transition hover:border-fg"
      >
        <span className="eyebrow !text-[9px]">05</span>
        <span className="text-sm">Leadership</span>
      </Link>
    </div>
  );
}
