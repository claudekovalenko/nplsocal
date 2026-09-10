import { Link } from 'react-router-dom';
import { site, navigation, hubs } from '@/content';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="container-x grid gap-12 py-14 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <Logo className="h-6 w-6" />
            <span className="text-sm font-semibold uppercase tracking-[0.12em]">{site.shortName}</span>
          </div>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted">{site.description}</p>
          <p className="mt-5 text-xs text-faint">
            Part of the{' '}
            <a href={site.urls.international} target="_blank" rel="noreferrer" className="text-muted underline-offset-4 hover:underline">
              #NoPlaceLeft
            </a>{' '}
            movement. All tools are freely given.
          </p>
        </div>
        <div>
          <div className="eyebrow">Explore</div>
          <ul className="mt-4 space-y-2.5 text-sm">
            {navigation
              .filter((n) => n.to !== '/')
              .map((n) => (
                <li key={n.to}>
                  <Link to={n.to} className="text-muted transition hover:text-fg">
                    {n.label}
                  </Link>
                </li>
              ))}
            <li>
              <Link to="/my-100" className="text-muted transition hover:text-fg">
                My 100 List
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="eyebrow">Network</div>
          <ul className="mt-4 space-y-2.5 text-sm">
            {hubs.map((h) => (
              <li key={h.id}>
                <Link to={`/hubs/${h.id}`} className="text-muted transition hover:text-fg">
                  {h.shortName}
                </Link>
              </li>
            ))}
            <li>
              <a href={`mailto:${site.contact.email}`} className="text-muted transition hover:text-fg">
                {site.contact.email}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="container-x flex flex-col gap-2 py-5 text-xs text-faint sm:flex-row sm:items-center sm:justify-between">
          <span>{site.name}</span>
          <span>
            {site.scripture.ref} · "{site.scripture.text}"
          </span>
        </div>
      </div>
    </footer>
  );
}
