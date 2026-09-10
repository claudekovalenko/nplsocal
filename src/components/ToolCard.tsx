import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import type { Tool } from '@/content';
import FieldBadge from './FieldBadge';

export default function ToolCard({ tool }: { tool: Tool }) {
  return (
    <Link
      to={`/tools/${tool.slug}`}
      className="card group flex flex-col p-6 transition hover:border-line-strong hover:bg-surface"
    >
      <div className="flex items-center justify-between">
        <FieldBadge field={tool.field} />
        <ArrowUpRight className="h-4 w-4 text-faint transition group-hover:text-fg" />
      </div>
      <h3 className="mt-5 text-xl">{tool.name}</h3>
      <p className="mt-1 text-sm text-muted">{tool.tagline}</p>
      <p className="mt-4 flex-1 text-sm leading-relaxed text-muted/80">{tool.summary}</p>
    </Link>
  );
}
