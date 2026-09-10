import { Link, useParams, Navigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, Share2 } from 'lucide-react';
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
      <section className="border-b border-ink-100 bg-white dark:border-ink-800 dark:bg-ink-900">
        <div className="container-x py-10 md:py-14">
          <Link to="/tools" className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-900 dark:hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Toolbox
          </Link>
          <div className="mt-4">
            <FieldBadge field={tool.field} />
          </div>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-5xl">{tool.name}</h1>
          <p className="mt-2 text-lg font-medium text-sun-600 dark:text-sun-400">{tool.tagline}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <button type="button" onClick={share} className="btn-ghost">
              <Share2 className="h-4 w-4" /> Share
            </button>
            <Link to={`/four-fields#${field.id}`} className="btn-ghost">
              <BookOpen className="h-4 w-4" /> Field {field.number}: {field.name}
            </Link>
          </div>
        </div>
      </section>

      <section className="container-x grid gap-10 py-12 md:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="text-lg text-ink-700 dark:text-ink-200">{tool.description}</p>

          {tool.steps && (
            <>
              <h2 className="mt-10 font-display text-2xl font-bold">How it works</h2>
              <ol className="mt-4 space-y-3">
                {tool.steps.map((s, i) => (
                  <li key={s.title} className="card flex gap-4 p-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sun-500 text-sm font-bold text-white">
                      {i + 1}
                    </span>
                    <div>
                      <div className="font-semibold">{s.title}</div>
                      <div className="mt-0.5 text-sm text-ink-600 dark:text-ink-200">{s.detail}</div>
                    </div>
                  </li>
                ))}
              </ol>
            </>
          )}

          {tool.links?.length ? (
            <>
              <h2 className="mt-10 font-display text-xl font-bold">Resources</h2>
              <ul className="mt-3 space-y-2">
                {tool.links.map((l) => (
                  <li key={l.url}>
                    <a href={l.url} target="_blank" rel="noreferrer" className="text-sun-600 underline-offset-2 hover:underline dark:text-sun-400">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>

        <aside className="space-y-6">
          {tool.scripture?.length ? (
            <div className="card p-5">
              <div className="eyebrow">Scripture</div>
              <ul className="mt-3 space-y-1 text-sm font-medium">
                {tool.scripture.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {tool.slug === '100-list' && (
            <div className="card border-sun-200 bg-sun-50 p-5 dark:border-sun-900 dark:bg-sun-900/20">
              <div className="eyebrow">Try it now</div>
              <p className="mt-2 text-sm text-ink-700 dark:text-ink-200">
                Keep your own list right here in the app. It's private to your device and works offline.
              </p>
              <Link to="/my-100" className="btn-primary mt-4 w-full">
                Open My 100 List <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}

          {siblings.length > 0 && (
            <div className="card p-5">
              <div className="eyebrow">More in Field {field.number}</div>
              <ul className="mt-3 space-y-2">
                {siblings.map((t) => (
                  <li key={t.slug}>
                    <Link to={`/tools/${t.slug}`} className="text-sm font-semibold hover:text-sun-600 dark:hover:text-sun-400">
                      {t.name}
                    </Link>
                    <p className="text-xs text-ink-500 dark:text-ink-300">{t.tagline}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="rounded-2xl border border-dashed border-ink-200 p-5 text-sm text-ink-500 dark:border-ink-700 dark:text-ink-300">
            Learned it? The next step is to teach it. Who will you train this week?
          </div>
        </aside>
      </section>
    </>
  );
}
