import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon, ChevronDown, Lock, UserRound, LogOut } from 'lucide-react';
import { navigation, aboutMenu, site } from '@/content';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { roleLabel } from '@/lib/auth';
import Logo from './Logo';

/** Close a dropdown on an outside click or Escape. */
function useDismiss(open: boolean, close: (v: false) => void, ref: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && close(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close, ref]);
}

const linkClass = (isActive: boolean) =>
  `rounded-md px-3 py-1.5 text-[13px] font-medium transition ${isActive ? 'bg-fg/8 text-fg' : 'text-muted hover:bg-fg/5 hover:text-fg'}`;

export default function Header({ minimal = false }: { minimal?: boolean } = {}) {
  const [open, setOpen] = useState(false);
  const [about, setAbout] = useState(false);
  const [account, setAccount] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const auth = useAuth();
  const { pathname } = useLocation();
  const aboutRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const onHero = pathname === '/';
  const aboutActive = aboutMenu.some((a) => pathname.startsWith(a.to));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setAbout(false);
    setAccount(false);
    setOpen(false);
  }, [pathname]);

  useDismiss(about, setAbout, aboutRef);
  useDismiss(account, setAccount, accountRef);

  const solid = scrolled || open || !onHero || minimal;

  // On the form route the wordmark is not a link either: the whole point is
  // that there is nothing to click away to.
  if (minimal) {
    return (
      <header
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
        className="fixed inset-x-0 top-0 z-40 border-b border-line bg-bg/80 backdrop-blur-xl"
      >
        <div className="container-x flex h-14 items-center justify-between">
          <span className="flex items-center gap-2.5">
            <Logo className="h-6 w-6" />
            <span className="text-sm font-semibold uppercase tracking-[0.12em]">{site.shortName}</span>
          </span>
          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-md p-2 text-muted transition hover:bg-fg/5 hover:text-fg"
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </header>
    );
  }


  return (
    <header
      // Installed on a phone the web view starts behind the status bar, so the
      // bar sits over the logo and menu button unless we push the row down.
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
      className="pointer-events-none fixed inset-x-0 top-0 z-40"
    >
      {/*
        Over the hero it is full width and invisible. Once you scroll it pulls
        in from the edges and rounds into a floating pill, so the chrome reads
        as sitting above the page rather than being welded to the top of it.
        Width, radius and colour all animate, which is what makes it feel like
        one object moving rather than two states swapping.
      */}
      <div
        className={`pointer-events-auto mx-auto overflow-hidden transition-all duration-300 ease-out ${
          solid
            ? 'mt-2 w-[calc(100%-1rem)] max-w-5xl rounded-2xl border border-line bg-bg/75 shadow-[0_10px_34px_-14px_var(--glow)] backdrop-blur-xl sm:mt-3 sm:w-[calc(100%-2rem)]'
            : 'mt-0 w-full max-w-none rounded-none border border-transparent bg-transparent'
        }`}
      >
      <div className={`flex h-14 items-center justify-between ${solid ? 'px-4 sm:px-5' : 'container-x'}`}>
        <Link to="/" className="flex items-center gap-2.5">
          <Logo className="h-6 w-6" />
          <span className="text-sm font-semibold uppercase tracking-[0.12em]">{site.shortName}</span>
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex" aria-label="Primary">
          {navigation.map((n) => (
            <NavLink key={n.to} to={n.to} className={({ isActive }) => linkClass(isActive)}>
              {n.label}
            </NavLink>
          ))}
          <div ref={aboutRef} className="relative">
            <button
              type="button"
              onClick={() => setAbout((a) => !a)}
              aria-expanded={about}
              aria-haspopup="menu"
              className={`${linkClass(aboutActive)} inline-flex items-center gap-1`}
            >
              About <ChevronDown className={`h-3.5 w-3.5 transition ${about ? 'rotate-180' : ''}`} />
            </button>
            {about && (
              <div role="menu" className="absolute left-0 top-full mt-2 w-44 overflow-hidden rounded-lg border border-line bg-bg/95 py-1 shadow-2xl backdrop-blur-xl">
                {aboutMenu.map((a) => (
                  <NavLink
                    key={a.to}
                    to={a.to}
                    role="menuitem"
                    className={({ isActive }) => `block px-4 py-2 text-sm transition ${isActive ? 'text-fg' : 'text-muted hover:bg-fg/5 hover:text-fg'}`}
                  >
                    {a.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="flex items-center gap-1">
          {/*
            Organizers reach everything private from here. It lives in the top
            corner at every width rather than in the page: it is not a section
            of the site, and a visitor should be able to ignore it entirely.
          */}
          <div ref={accountRef} className="relative">
            <button
              type="button"
              onClick={() => setAccount((a) => !a)}
              aria-expanded={account}
              aria-haspopup="menu"
              aria-label={auth.email ? `Account — signed in as ${auth.email}` : 'Account — sign in'}
              className={`rounded-md p-2 transition hover:bg-fg/5 ${auth.email ? 'text-fg' : 'text-muted hover:text-fg'}`}
            >
              <UserRound className="h-4 w-4" />
            </button>
            {account && (
              <div
                role="menu"
                className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-lg border border-line bg-bg/95 py-1 shadow-2xl backdrop-blur-xl"
              >
                {auth.email ? (
                  <>
                    <div className="border-b border-line px-4 py-2.5">
                      <div className="truncate text-xs text-muted">{auth.email}</div>
                      {auth.role && <div className="eyebrow mt-0.5">{roleLabel[auth.role]}</div>}
                    </div>
                    <Link to="/admin" role="menuitem" className="block px-4 py-2.5 text-sm text-muted transition hover:bg-fg/5 hover:text-fg">
                      Sign-ups and leads
                    </Link>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setAccount(false);
                        auth.signOut();
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-muted transition hover:bg-fg/5 hover:text-fg"
                    >
                      <LogOut className="h-3.5 w-3.5" /> Sign out
                    </button>
                  </>
                ) : (
                  <div className="px-3 py-3">
                    <div className="px-1 text-xs text-muted">Organizers</div>
                    <Link to="/admin" role="menuitem" className="btn-primary mt-2.5 w-full">
                      <Lock className="h-3.5 w-3.5" /> Sign in
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-md p-2 text-muted transition hover:bg-fg/5 hover:text-fg"
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="rounded-md p-2 text-fg transition hover:bg-fg/5 md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" className="border-t border-line md:hidden" aria-label="Mobile">
          <div className="grid px-4 py-2 sm:px-5">
            {[...navigation, ...aboutMenu].map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) => `border-b border-line py-3.5 text-base font-medium last:border-0 ${isActive ? 'text-fg' : 'text-muted'}`}
              >
                {n.label}
              </NavLink>
            ))}
            {/* Set apart from the sections above: this is not a page of the
                site, it is the way in for the people running the events. */}
            <div className="mt-3 border-t border-line pt-4">
              {auth.email ? (
                <>
                  <div className="px-0.5 text-xs text-muted">{auth.email}</div>
                  <Link to="/admin" className="btn-primary mt-2.5 w-full">
                    Sign-ups and leads
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      auth.signOut();
                    }}
                    className="btn-ghost mt-2 w-full"
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </>
              ) : (
                <Link to="/admin" className="btn-primary w-full">
                  <Lock className="h-4 w-4" /> Sign in
                </Link>
              )}
            </div>
          </div>
        </nav>
      )}
      </div>
    </header>
  );
}
