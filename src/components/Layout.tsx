import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import BottomNav from './BottomNav';
import PwaBanners from './PwaBanners';

export default function Layout() {
  const { pathname } = useLocation();
  const onHero = pathname === '/';
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main className={`flex-1 pb-16 md:pb-0 ${onHero ? '' : 'pt-14'}`}>
        <Outlet />
      </main>
      <Footer />
      <BottomNav />
      <PwaBanners />
    </div>
  );
}
