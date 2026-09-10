import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import ScrollToTop from '@/components/ScrollToTop';
import Home from '@/pages/Home';
import Vision from '@/pages/Vision';
import FourFields from '@/pages/FourFields';
import Tools from '@/pages/Tools';
import ToolDetail from '@/pages/ToolDetail';
import ThreeThirds from '@/pages/ThreeThirds';
import Training from '@/pages/Training';
import Events from '@/pages/Events';
import Hubs from '@/pages/Hubs';
import HubDetail from '@/pages/HubDetail';
import Connect from '@/pages/Connect';
import My100 from '@/pages/My100';
import Track from '@/pages/Track';
import TrackEdit from '@/pages/TrackEdit';
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
          <Route path="three-thirds" element={<ThreeThirds />} />
          <Route path="training" element={<Training />} />
          <Route path="events" element={<Events />} />
          <Route path="regions" element={<Hubs />} />
          <Route path="regions/:id" element={<HubDetail />} />
          <Route path="hubs" element={<Navigate to="/regions" replace />} />
          <Route path="hubs/:id" element={<HubRedirect />} />
          <Route path="connect" element={<Connect />} />
          <Route path="my-100" element={<My100 />} />
          <Route path="track" element={<Track />} />
          <Route path="track/new" element={<TrackEdit />} />
          <Route path="track/:id" element={<TrackEdit />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}

import { useParams } from 'react-router-dom';
function HubRedirect() {
  const { id } = useParams();
  return <Navigate to={`/regions/${id}`} replace />;
}
