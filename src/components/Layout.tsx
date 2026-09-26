import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import BottomNav from './BottomNav';
import PwaBanners from './PwaBanners';

export default function Layout() {
  const { pathname } = useLocation();
  const onHero = pathname === '/';

  /**
   * The registration form is sent to someone as a link with one job: fill it
   * in. On that route the site's navigation is stripped — no menu, no tab bar,
   * no footer links — so there is nothing to wander off into mid-form. A way
   * back goes in once there is somewhere useful to send people afterwards.
   */
  const focused = pathname.startsWith('/register/');

  return (
    // Installed, the app runs edge to edge under the status bar and the home
    // indicator, so both insets have to be paid for explicitly. The bottom
    // padding belongs on this wrapper, not on main: the footer comes after main,
    // so padding there left the tab bar covering the footer. The tab bar itself
    // grows by the bottom inset, hence more padding than the bar's own height.
    <div
      className={`flex min-h-dvh flex-col ${
        focused ? '' : 'pb-[calc(4.25rem_+_env(safe-area-inset-bottom))] md:pb-0'
      }`}
    >
      <Header minimal={focused} />
      <main className={`flex-1 ${onHero ? '' : 'pt-[var(--header-h)]'}`}>
        <Outlet />
      </main>
      <Footer minimal={focused} />
      {!focused && <BottomNav />}
      <PwaBanners />
    </div>
  );
}
