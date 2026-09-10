import { NavLink } from 'react-router-dom';
import { Home, Wrench, CalendarDays, Users, ListChecks } from 'lucide-react';

const items = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/tools', label: 'Toolbox', icon: Wrench },
  { to: '/events', label: 'Events', icon: CalendarDays },
  { to: '/hubs', label: 'Hubs', icon: Users },
  { to: '/my-100', label: 'My 100', icon: ListChecks },
];

export default function BottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-100 bg-sand-50/95 backdrop-blur-md md:hidden dark:border-ink-800 dark:bg-ink-950/95"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Quick"
    >
      <div className="grid grid-cols-5">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${
                isActive ? 'text-sun-600 dark:text-sun-400' : 'text-ink-500 dark:text-ink-400'
              }`
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
