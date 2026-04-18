import { Link, Route, Routes } from 'react-router-dom';
import { Compass } from 'lucide-react';
import HomePage from './pages/HomePage';
import CreateTripPage from './pages/CreateTripPage';
import RecommendationsPage from './pages/RecommendationsPage';
import ItineraryPage from './pages/ItineraryPage';

export default function App() {
  return (
    <div className="min-h-full flex flex-col">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-semibold text-slate-900">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
              <Compass size={18} />
            </span>
            Wanderly
          </Link>
          <Link to="/new" className="btn-primary">New trip</Link>
        </div>
      </header>
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/new" element={<CreateTripPage />} />
          <Route path="/trip/:id/recommend" element={<RecommendationsPage />} />
          <Route path="/trip/:id" element={<ItineraryPage />} />
        </Routes>
      </main>
      <footer className="py-6 text-center text-xs text-slate-400">
        Wanderly · curated local dataset · OpenStreetMap tiles
      </footer>
    </div>
  );
}
