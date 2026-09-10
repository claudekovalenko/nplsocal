import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { navigation, site } from '@/content';
import { useTheme } from '@/hooks/useTheme';
import Logo from './Logo';

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const { pathname } = useLocation();
  const onHero = pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const solid = scrolled || open || !onHero;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${
        solid ? 'border-b border-line bg-bg/80 backdrop-blur-xl' : 'bg-transparent'
      }`}
    >
      <div className="container-x flex h-14 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <Logo className="h-6 w-6" />
          <span className="text-sm font-semibold tracking-[0.12em] uppercase">{site.shortName}</span>
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex" aria-label="Primary">
          {navigation.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={'end' in n && n.end}
              className={({ isActive }) =>
                `rounded-md px-3 py-1.5 text-[13px] font-medium transition ${
                  isActive ? 'bg-fg/8 text-fg' : 'text-muted hover:bg-fg/5 hover:text-fg'
                }`
              }
            >
              {n.label}
            </NavLink>
          ))}
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
            {[...navigation, { to: '/my-100', label: 'My 100 List' }].map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={'end' in n && (n as { end?: boolean }).end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `border-b border-line py-3.5 text-base font-medium last:border-0 ${isActive ? 'text-fg' : 'text-muted'}`
                }
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
