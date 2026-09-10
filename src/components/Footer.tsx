import { Link } from 'react-router-dom';
import { site, navigation, hubs } from '@/content';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-ink-100 bg-white dark:border-ink-800 dark:bg-ink-900">
      <div className="container-x grid gap-10 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5">
            <Logo className="h-9 w-9" />
            <div>
              <div className="font-bold">{site.name}</div>
              <div className="text-xs text-ink-400">{site.tagline}</div>
            </div>
          </div>
          <p className="mt-4 max-w-md text-sm text-ink-500 dark:text-ink-300">{site.description}</p>
          <p className="mt-4 text-xs text-ink-400">
            Part of the wider{' '}
            <a href={site.urls.international} target="_blank" rel="noreferrer" className="underline decoration-sun-400 underline-offset-2">
              #NoPlaceLeft
            </a>{' '}
            movement. All tools are freely given — use, adapt, and pass them on.
          </p>
        </div>

        <div>
          <div className="eyebrow">Explore</div>
          <ul className="mt-3 space-y-2 text-sm">
            {navigation
              .filter((n) => n.to !== '/')
              .map((n) => (
                <li key={n.to}>
                  <Link to={n.to} className="text-ink-600 hover:text-ink-900 dark:text-ink-300 dark:hover:text-white">
                    {n.label}
                  </Link>
                </li>
              ))}
            <li>
              <Link to="/my-100" className="text-ink-600 hover:text-ink-900 dark:text-ink-300 dark:hover:text-white">
                My 100 List
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <div className="eyebrow">Hubs</div>
          <ul className="mt-3 space-y-2 text-sm">
            {hubs.map((h) => (
              <li key={h.id}>
                <Link to={`/hubs/${h.id}`} className="text-ink-600 hover:text-ink-900 dark:text-ink-300 dark:hover:text-white">
                  {h.shortName}
                </Link>
              </li>
            ))}
            <li>
              <a href={`mailto:${site.contact.email}`} className="text-ink-600 hover:text-ink-900 dark:text-ink-300 dark:hover:text-white">
                {site.contact.email}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ink-100 py-4 text-center text-xs text-ink-400 dark:border-ink-800">
        {site.scripture.ref} · "{site.scripture.text}"
      </div>
    </footer>
  );
}
