import type { ReactNode } from 'react';

export default function PageHeader({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  children?: ReactNode;
}) {
  return (
    <section className="border-b border-ink-100 bg-white dark:border-ink-800 dark:bg-ink-900">
      <div className="container-x py-12 md:py-16">
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-5xl">{title}</h1>
        {lead && <p className="mt-4 max-w-2xl text-base text-ink-500 md:text-lg dark:text-ink-300">{lead}</p>}
        {children}
      </div>
    </section>
  );
}
