import { Link, useParams, Navigate } from 'react-router-dom';
import { ArrowLeft, Share2 } from 'lucide-react';
import { toolBySlug, fieldById, toolsByField } from '@/content';
import FieldBadge from '@/components/FieldBadge';

export default function ToolDetail() {
  const { slug = '' } = useParams();
  const tool = toolBySlug(slug);
  if (!tool) return <Navigate to="/tools" replace />;
  const field = fieldById(tool.field)!;
  const siblings = toolsByField(tool.field).filter((t) => t.slug !== tool.slug);

  const share = async () => {
    const data = { title: tool.name, text: tool.summary, url: window.location.href };
    try {
      if (navigator.share) await navigator.share(data);
      else await navigator.clipboard.writeText(data.url);
    } catch {}
  };

  return (
    <>
      <section className="border-b border-line">
        <div className="container-x py-14 md:py-20">
          <Link to="/tools" className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-fg">
            <ArrowLeft className="h-4 w-4" /> Toolbox
          </Link>
          <div className="mt-8">
            <FieldBadge field={tool.field} />
          </div>
          <h1 className="mt-4 text-4xl md:text-6xl">{tool.name}</h1>
          <div className="mt-8 flex flex-wrap gap-2">
            <button type="button" onClick={share} className="btn-secondary">
              <Share2 className="h-4 w-4" /> Share
            </button>
            <Link to={`/four-fields#${field.id}`} className="btn-ghost">
              Field 0{field.number} · {field.name}
            </Link>
          </div>
        </div>
      </section>

      <section className="container-x grid gap-14 py-14 md:grid-cols-[1.5fr_1fr] md:py-20">
        <div>
          <p className="text-lg text-muted">{tool.description}</p>

          {tool.steps && (
            <>
              <div className="eyebrow mt-12">Steps</div>
              <ol className="mt-4 divide-y divide-line border-y border-line">
                {tool.steps.map((s, i) => (
                  <li key={s.title} className="flex gap-6 py-5">
                    <span className="w-6 shrink-0 text-xs text-faint">0{i + 1}</span>
                    <div>
                      <div className="text-base">{s.title}</div>
                      <div className="mt-1 text-sm leading-relaxed text-muted">{s.detail}</div>
                    </div>
                  </li>
                ))}
              </ol>
            </>
          )}

          {tool.links?.length ? (
            <>
              <div className="eyebrow mt-14">Resources</div>
              <ul className="mt-3 space-y-2 text-sm">
                {tool.links.map((l) => (
                  <li key={l.url}>
                    <a href={l.url} target="_blank" rel="noreferrer" className="underline-offset-4 hover:underline">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>

        <aside className="space-y-10 text-sm">
          {tool.scripture?.length ? (
            <div>
              <div className="eyebrow">Scripture</div>
              <ul className="mt-3 space-y-1.5 text-muted">
                {tool.scripture.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {tool.slug === '100-list' && (
            <div className="card p-6">
              <div className="eyebrow">Try it now</div>
              <Link to="/my-100" className="btn-primary mt-5 w-full">
                Open My 100 List
              </Link>
            </div>
          )}

          {siblings.length > 0 && (
            <div>
              <div className="eyebrow">More in Field 0{field.number}</div>
              <ul className="mt-3 divide-y divide-line border-y border-line">
                {siblings.map((t) => (
                  <li key={t.slug}>
                    <Link to={`/tools/${t.slug}`} className="block py-3 transition hover:text-fg">
                      <span className="block">{t.name}</span>
                      <span className="block text-xs text-muted">{t.tagline}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-muted">Now teach it.</p>
        </aside>
      </section>
    </>
  );
}
