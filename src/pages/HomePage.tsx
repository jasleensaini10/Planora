import { Link } from 'react-router-dom';
import { MapPin, Calendar, Trash2, Plus } from 'lucide-react';
import { useTrips } from '../context/TripsContext';
import { findDestination } from '../data/destinations';
import CategoryBadge from '../components/CategoryBadge';

export default function HomePage() {
  const { trips, deleteTrip } = useTrips();

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 shadow-soft bg-gradient-to-br from-brand-600 via-indigo-600 to-purple-700 text-white p-8 md:p-14">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-indigo-300/20 rounded-full blur-3xl" />
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur px-3 py-1 text-xs font-medium text-white/90">
            ✈️  Plan smarter, travel better
          </span>
          <h1 className="mt-4 text-4xl md:text-6xl font-display font-extrabold tracking-tight leading-[1.05]">
            Your next adventure,<br />
            <span className="bg-gradient-to-r from-amber-200 to-pink-200 bg-clip-text text-transparent">
              perfectly planned.
            </span>
          </h1>
          <p className="mt-4 text-brand-50/90 max-w-xl text-base md:text-lg">
            Tell Planora where you're going and what you love. We'll craft a day-by-day
            itinerary with geographically smart routes — or build it yourself, drag-and-drop.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/new" className="btn bg-white text-brand-700 hover:bg-brand-50 shadow-lg shadow-indigo-900/30">
              <Plus size={16} /> Create a trip
            </Link>
            {trips.length > 0 && (
              <a href="#your-trips" className="btn bg-white/10 text-white hover:bg-white/20 border border-white/20">
                View my trips
              </a>
            )}
          </div>
        </div>
      </section>

      <section className="mt-10" id="your-trips">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-xl font-semibold">Your trips</h2>
          <span className="text-sm text-slate-500">{trips.length} saved</span>
        </div>

        {trips.length === 0 ? (
          <div className="card p-10 text-center text-slate-500">
            <p className="text-lg">No trips yet.</p>
            <p className="text-sm mt-1">Start by creating your first itinerary.</p>
          </div>
        ) : (
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {trips.map((trip) => {
              const dest = findDestination(trip.destination);
              return (
                <li key={trip.id} className="card p-5 flex flex-col gap-3 hover:shadow-lg transition">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-2xl">{dest?.emoji ?? '📍'}</div>
                      <h3 className="font-semibold text-lg mt-1">{trip.destination}</h3>
                      <p className="text-xs text-slate-500">{dest?.country}</p>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm(`Delete trip to ${trip.destination}?`)) deleteTrip(trip.id);
                      }}
                      className="p-2 rounded hover:bg-slate-100 text-slate-400 hover:text-red-600"
                      aria-label="Delete trip"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {trip.preferences.map((p) => <CategoryBadge key={p} category={p} />)}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1"><Calendar size={12} />{trip.durationDays} day{trip.durationDays > 1 ? 's' : ''}</span>
                    <span className="inline-flex items-center gap-1"><MapPin size={12} />{trip.activities.filter(a => a.dayIndex !== null).length} activities planned</span>
                  </div>
                  <Link to={`/trip/${trip.id}`} className="btn-secondary mt-2 w-full">Open itinerary</Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
