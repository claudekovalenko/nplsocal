import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { Tool } from '@/content';
import FieldBadge from './FieldBadge';

export default function ToolCard({ tool }: { tool: Tool }) {
  return (
    <Link
      to={`/tools/${tool.slug}`}
      className="card group flex flex-col p-5 transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <FieldBadge field={tool.field} />
      <h3 className="mt-3 text-lg font-bold">{tool.name}</h3>
      <p className="mt-1 text-sm font-medium text-sun-600 dark:text-sun-400">{tool.tagline}</p>
      <p className="mt-2 flex-1 text-sm text-ink-500 dark:text-ink-300">{tool.summary}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-ink-800 group-hover:gap-2 dark:text-ink-100">
        Open <ArrowRight className="h-4 w-4 transition" />
      </span>
    </Link>
  );
}
