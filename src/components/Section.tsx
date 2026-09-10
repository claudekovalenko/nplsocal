import type { ReactNode } from 'react';

export default function Section({
  eyebrow,
  title,
  lead,
  children,
  className = '',
}: {
  eyebrow?: string;
  title?: string;
  lead?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`container-x py-12 md:py-16 ${className}`}>
      {(eyebrow || title) && (
        <div className="mb-8 max-w-2xl">
          {eyebrow && <div className="eyebrow">{eyebrow}</div>}
          {title && <h2 className="mt-2 font-display text-2xl font-bold tracking-tight md:text-3xl">{title}</h2>}
          {lead && <p className="mt-3 text-ink-500 dark:text-ink-300">{lead}</p>}
        </div>
      )}
      {children}
    </section>
  );
}
