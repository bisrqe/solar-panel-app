/**
 * App.jsx — Root component with routing and SolarProvider.
 */
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SolarProvider } from './context/SolarContext';
import ProgressBar from './components/ProgressBar';

const Section1 = lazy(() => import('./pages/Section1'));
const Section2 = lazy(() => import('./pages/Section2'));
const Section3 = lazy(() => import('./pages/Section3'));
const Section4 = lazy(() => import('./pages/Section4'));
const Section5 = lazy(() => import('./pages/Section5'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <span className="text-4xl animate-spin" aria-hidden="true" style={{ animationDuration: '1.5s' }}>☀</span>
        <p className="text-sm text-[#6b7280]">Cargando...</p>
      </div>
    </div>
  );
}

function Layout() {
  return (
    <div className="min-h-screen bg-[#F9F5EE]">
      <ProgressBar />
      <main>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Section1 />} />
            <Route path="/meta" element={<Section2 />} />
            <Route path="/diagnostico" element={<Section3 />} />
            <Route path="/planes" element={<Section4 />} />
            <Route path="/instala" element={<Section5 />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <SolarProvider>
        <Layout />
      </SolarProvider>
    </BrowserRouter>
  );
}
