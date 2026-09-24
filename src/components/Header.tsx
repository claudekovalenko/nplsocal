import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon, ChevronDown } from 'lucide-react';
import { navigation, aboutMenu, site } from '@/content';
import { useTheme } from '@/hooks/useTheme';
import Logo from './Logo';

const linkClass = (isActive: boolean) =>
  `rounded-md px-3 py-1.5 text-[13px] font-medium transition ${isActive ? 'bg-fg/8 text-fg' : 'text-muted hover:bg-fg/5 hover:text-fg'}`;

export default function Header() {
  const [open, setOpen] = useState(false);
  const [about, setAbout] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const { pathname } = useLocation();
  const aboutRef = useRef<HTMLDivElement>(null);
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
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!about) return;
    const onDown = (e: MouseEvent) => !aboutRef.current?.contains(e.target as Node) && setAbout(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setAbout(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [about]);

  const solid = scrolled || open || !onHero;

  return (
    <header
      // Installed on a phone the web view starts behind the status bar, so the
      // bar sits over the logo and menu button unless we push the row down.
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${solid ? 'border-b border-line bg-bg/80 backdrop-blur-xl' : 'bg-transparent'}`}
    >
      <div className="container-x flex h-14 items-center justify-between">
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
        <nav id="mobile-nav" className="border-t border-line bg-bg md:hidden" aria-label="Mobile">
          <div className="container-x grid py-2">
            {[...navigation, ...aboutMenu].map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) => `border-b border-line py-3.5 text-base font-medium last:border-0 ${isActive ? 'text-fg' : 'text-muted'}`}
              >
                {n.label}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
