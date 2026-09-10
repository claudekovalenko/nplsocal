import { NavLink } from 'react-router-dom';
import { Home, Wrench, CalendarDays, Map, ListChecks } from 'lucide-react';

const items = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/tools', label: 'Toolbox', icon: Wrench },
  { to: '/events', label: 'Events', icon: CalendarDays },
  { to: '/hubs', label: 'Map', icon: Map },
  { to: '/my-100', label: 'My 100', icon: ListChecks },
];

export default function BottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/85 backdrop-blur-xl md:hidden"
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
              `flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium tracking-wide transition ${
                isActive ? 'text-fg' : 'text-faint'
              }`
            }
          >
            <Icon className="h-5 w-5" strokeWidth={1.75} />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
