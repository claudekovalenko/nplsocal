import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, Sun, Moon, MonitorSmartphone } from 'lucide-react';
import { navigation, site } from '@/content';
import { useTheme } from '@/hooks/useTheme';
import Logo from './Logo';

export default function Header() {
  const [open, setOpen] = useState(false);
  const { theme, cycle } = useTheme();
  const ThemeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : MonitorSmartphone;

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100/80 bg-sand-50/85 backdrop-blur-md dark:border-ink-800 dark:bg-ink-950/80">
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <Logo className="h-8 w-8" />
          <span className="font-display text-base font-bold tracking-tight">
            {site.shortName}
            <span className="ml-1.5 hidden text-xs font-medium text-ink-400 sm:inline">Los Angeles · Orange County</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {navigation.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={'end' in n && n.end}
              className={({ isActive }) =>
                `rounded-full px-3 py-1.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-ink-900 text-white dark:bg-white dark:text-ink-950'
                    : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900 dark:text-ink-300 dark:hover:bg-ink-800 dark:hover:text-white'
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
            onClick={cycle}
            className="rounded-full p-2 text-ink-500 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800"
            aria-label={`Theme: ${theme}. Click to change.`}
            title={`Theme: ${theme}`}
          >
            <ThemeIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="rounded-full p-2 text-ink-700 hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-800 md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" className="border-t border-ink-100 md:hidden dark:border-ink-800" aria-label="Mobile">
          <div className="container-x grid gap-1 py-3">
            {navigation.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={'end' in n && n.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-xl px-3 py-2.5 text-base font-medium ${
                    isActive ? 'bg-ink-900 text-white dark:bg-white dark:text-ink-950' : 'text-ink-700 dark:text-ink-200'
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
            <NavLink
              to="/my-100"
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-2.5 text-base font-medium text-sun-600 dark:text-sun-400"
            >
              My 100 List
            </NavLink>
          </div>
        </nav>
      )}
    </header>
  );
}
