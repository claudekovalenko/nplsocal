import { fieldById } from '@/content';

export default function FieldBadge({ field }: { field: string }) {
  const f = fieldById(field);
  if (!f) return null;
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-muted">
      <span className="flex h-4 w-4 items-center justify-center rounded-sm border border-line-strong text-[10px] text-fg">
        {f.number}
      </span>
      {f.name}
    </span>
  );
}
