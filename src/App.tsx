import { Link, Route, Routes } from 'react-router-dom';
import { Plane } from 'lucide-react';
import HomePage from './pages/HomePage';
import CreateTripPage from './pages/CreateTripPage';
import RecommendationsPage from './pages/RecommendationsPage';
import ItineraryPage from './pages/ItineraryPage';

export default function App() {
  return (
    <div className="min-h-full flex flex-col">
      <header className="sticky top-0 z-40 bg-white/75 backdrop-blur-md border-b border-slate-200/70">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 text-white shadow-md shadow-brand-500/30 group-hover:scale-105 transition">
              <Plane size={18} className="-rotate-45" />
            </span>
            <span className="font-display font-bold text-lg tracking-tight text-slate-900">Planora</span>
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
        Planora · curated local dataset · OpenStreetMap tiles
      </footer>
    </div>
  );
}
