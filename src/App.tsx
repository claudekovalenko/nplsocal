import { Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import ScrollToTop from '@/components/ScrollToTop';
import Home from '@/pages/Home';
import Vision from '@/pages/Vision';
import FourFields from '@/pages/FourFields';
import Tools from '@/pages/Tools';
import ToolDetail from '@/pages/ToolDetail';
import Training from '@/pages/Training';
import Events from '@/pages/Events';
import Hubs from '@/pages/Hubs';
import HubDetail from '@/pages/HubDetail';
import Connect from '@/pages/Connect';
import My100 from '@/pages/My100';
import NotFound from '@/pages/NotFound';

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="vision" element={<Vision />} />
          <Route path="four-fields" element={<FourFields />} />
          <Route path="tools" element={<Tools />} />
          <Route path="tools/:slug" element={<ToolDetail />} />
          <Route path="training" element={<Training />} />
          <Route path="events" element={<Events />} />
          <Route path="hubs" element={<Hubs />} />
          <Route path="hubs/:id" element={<HubDetail />} />
          <Route path="connect" element={<Connect />} />
          <Route path="my-100" element={<My100 />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}
