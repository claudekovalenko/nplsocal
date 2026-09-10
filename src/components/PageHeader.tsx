import type { ReactNode } from 'react';

export default function PageHeader({
  eyebrow,
  title,
  lead,
  children,
  align = 'center',
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  children?: ReactNode;
  align?: 'center' | 'left';
}) {
  const c = align === 'center' ? 'mx-auto text-center' : '';
  return (
    <section className="border-b border-line">
      <div className="container-x py-16 md:py-24">
        <div className={`max-w-3xl ${c}`}>
          {eyebrow && <div className="eyebrow fade-up">{eyebrow}</div>}
          <h1 className="fade-up fade-up-2 mt-4 text-4xl leading-[1.05] md:text-6xl">{title}</h1>
          {lead && <p className="fade-up fade-up-3 mt-6 text-base leading-relaxed text-muted md:text-lg">{lead}</p>}
        </div>
        {children}
      </div>
    </section>
  );
}
