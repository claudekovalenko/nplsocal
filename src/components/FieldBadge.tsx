import { fieldById } from '@/content';

const colors: Record<string, string> = {
  entry: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
  gospel: 'bg-sun-100 text-sun-800 dark:bg-sun-900/40 dark:text-sun-200',
  discipleship: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200',
  church: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200',
  leadership: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200',
};

export default function FieldBadge({ field }: { field: string }) {
  const f = fieldById(field);
  if (!f) return null;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${colors[field]}`}>
      Field {f.number} · {f.name}
    </span>
  );
}
