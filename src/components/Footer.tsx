import { Link } from 'react-router-dom';
import { site, navigation, hubs } from '@/content';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="container-x flex flex-col gap-8 py-10 md:flex-row md:items-center md:justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <Logo className="h-6 w-6" />
          <span className="text-sm font-semibold uppercase tracking-[0.12em]">{site.shortName}</span>
        </Link>
        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm" aria-label="Footer">
          {navigation.map((n) => (
            <Link key={n.to} to={n.to} className="text-muted transition hover:text-fg">
              {n.label}
            </Link>
          ))}
          {hubs.map((h) => (
            <Link key={h.id} to={`/regions/${h.id}`} className="text-muted transition hover:text-fg">
              {h.shortName}
            </Link>
          ))}
          <Link to="/connect" className="text-muted transition hover:text-fg">
            Connect
          </Link>
        </nav>
      </div>
      <div className="border-t border-line">
        <div className="container-x flex flex-col gap-2 py-5 text-xs text-faint sm:flex-row sm:items-center sm:justify-between">
          <a href={`mailto:${site.contact.email}`} className="transition hover:text-fg">
            {site.contact.email}
          </a>
          <span>{site.scripture.ref}</span>
        </div>
      </div>
    </footer>
  );
}
