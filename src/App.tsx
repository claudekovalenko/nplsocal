import { lazy, Suspense } from 'react';
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
import Track from '@/pages/Track';
import Register from '@/pages/Register';
import Roster from '@/pages/Roster';
import Push from '@/pages/Push';
import TrackEdit from '@/pages/TrackEdit';
import Admin from '@/pages/Admin';
import NotFound from '@/pages/NotFound';

// The Pray page carries its own map and two plans, so it loads on its own
// rather than adding to every other page's download.
const Pray = lazy(() => import('@/pages/Pray'));

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<Vision />} />
          <Route path="vision" element={<Navigate to="/about" replace />} />
          <Route path="four-fields" element={<FourFields />} />
          <Route path="tools" element={<Tools />} />
          <Route path="tools/:slug" element={<ToolDetail />} />
          <Route path="three-thirds" element={<ThreeThirds />} />
          <Route path="training" element={<Training />} />
          <Route path="events" element={<Events />} />
          <Route
            path="pray"
            element={
              <Suspense fallback={<div className="min-h-dvh" />}>
                <Pray />
              </Suspense>
            }
          />
          {/* "Gatherings" meant house-church gatherings to practitioners, so the
              section was renamed. Keep the old path working for saved links. */}
          <Route path="gatherings" element={<Navigate to="/events" replace />} />
          <Route path="regions" element={<Hubs />} />
          <Route path="regions/:id" element={<HubDetail />} />
          <Route path="hubs" element={<Navigate to="/regions" replace />} />
          <Route path="hubs/:id" element={<HubRedirect />} />
          <Route path="connect" element={<Connect />} />
          <Route path="track" element={<Track />} />
          <Route path="track/new" element={<TrackEdit />} />
          <Route path="track/:id" element={<TrackEdit />} />
          <Route path="push" element={<Push />} />
          <Route path="register/:eventId" element={<Register />} />
          <Route path="roster" element={<Roster />} />
          <Route path="roster/:eventId" element={<Roster />} />
          {/* The back end: sign in here, reach everything that is not public. */}
          <Route path="admin" element={<Admin />} />
          <Route path="signin" element={<Navigate to="/admin" replace />} />
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
