import { Link } from 'react-router-dom';
import { site, navigation, aboutMenu } from '@/content';
import Logo from './Logo';

export default function Footer({ minimal = false }: { minimal?: boolean } = {}) {
  if (minimal) {
    // Wordmark only. No links, so the form cannot be clicked out of. The build
    // date is here because an installed app serves the last version it cached,
    // and without a stamp there is no way to tell a missing change from a stale
    // copy — which has caught us out more than once.
    return (
      <footer className="mt-24 border-t border-line">
        <div className="container-x flex items-center justify-between gap-2.5 py-8">
          <span className="flex items-center gap-2.5">
            <Logo className="h-6 w-6" />
            <span className="text-sm font-semibold uppercase tracking-[0.12em]">{site.shortName}</span>
          </span>
          <span className="text-xs text-faint" title={`Build ${__BUILD_TIME__}`}>
            v{__BUILD_TIME__.slice(0, 10).replace(/-/g, '.')}
          </span>
        </div>
      </footer>
    );
  }

  return (
    <footer className="mt-24 border-t border-line">
      <div className="container-x flex flex-col gap-8 py-10 md:flex-row md:items-center md:justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <Logo className="h-6 w-6" />
          <span className="text-sm font-semibold uppercase tracking-[0.12em]">{site.shortName}</span>
        </Link>
        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm" aria-label="Footer">
          {/* Organizers get in from the account menu in the header, at every
              width. No reason to repeat it down here. */}
          {[...navigation, ...aboutMenu].map((n) => (
            <Link key={n.to} to={n.to} className="text-muted transition hover:text-fg">
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="border-t border-line">
        <div className="container-x flex flex-col gap-2 py-5 text-xs text-faint sm:flex-row sm:items-center sm:justify-between">
          <a href={`mailto:${site.contact.email}`} className="transition hover:text-fg">
            {site.contact.email}
          </a>
          <span className="flex items-center gap-3">
            <span>{site.scripture.ref}</span>
            <span title={`Build ${__BUILD_TIME__}`} className="text-faint">
              v{__BUILD_TIME__.slice(0, 10).replace(/-/g, '.')}
            </span>
          </span>
        </div>
      </div>
    </footer>
  );
}
