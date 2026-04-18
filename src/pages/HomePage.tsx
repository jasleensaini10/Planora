import { Link } from 'react-router-dom';
import { MapPin, Calendar, Trash2, Plus } from 'lucide-react';
import { useTrips } from '../context/TripsContext';
import { findDestination } from '../data/destinations';
import CategoryBadge from '../components/CategoryBadge';

export default function HomePage() {
  const { trips, deleteTrip } = useTrips();

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <section className="card p-8 md:p-12 bg-gradient-to-br from-brand-600 to-brand-800 text-white border-0 shadow-lg">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight">Plan your next adventure.</h1>
        <p className="mt-3 text-brand-100 max-w-xl">
          Pick a destination, tell us what you love, and get a balanced day-by-day itinerary in seconds —
          or drag and drop your own.
        </p>
        <Link to="/new" className="btn bg-white text-brand-700 hover:bg-brand-50 mt-6">
          <Plus size={16} /> Create a trip
        </Link>
      </section>

      <section className="mt-10">
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
