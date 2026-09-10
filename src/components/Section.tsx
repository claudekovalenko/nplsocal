import type { ReactNode } from 'react';

export default function Section({
  eyebrow,
  title,
  lead,
  children,
  className = '',
  align = 'left',
}: {
  eyebrow?: string;
  title?: string;
  lead?: string;
  children: ReactNode;
  className?: string;
  align?: 'left' | 'center';
}) {
  const c = align === 'center' ? 'mx-auto text-center' : '';
  return (
    <section className={`container-x py-16 md:py-24 ${className}`}>
      {(eyebrow || title) && (
        <div className={`mb-10 max-w-2xl ${c}`}>
          {eyebrow && <div className="eyebrow">{eyebrow}</div>}
          {title && <h2 className="mt-3 text-3xl md:text-4xl">{title}</h2>}
          {lead && <p className="mt-4 leading-relaxed text-muted">{lead}</p>}
        </div>
      )}
      {children}
    </section>
  );
}
