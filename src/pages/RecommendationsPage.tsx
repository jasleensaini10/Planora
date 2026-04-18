import { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { nanoid } from 'nanoid';
import { Clock, Plus, Check, Star, ArrowRight } from 'lucide-react';
import { useTrips } from '../context/TripsContext';
import { recommend } from '../lib/recommend';
import { formatMinutes } from '../lib/planner';
import CategoryBadge from '../components/CategoryBadge';

export default function RecommendationsPage() {
  const { id } = useParams();
  const { getTrip, upsertTrip } = useTrips();
  const navigate = useNavigate();
  const trip = id ? getTrip(id) : undefined;

  const scored = useMemo(
    () => (trip ? recommend(trip.destination, trip.preferences) : []),
    [trip],
  );

  if (!trip) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <p>Trip not found. <Link className="text-brand-600 underline" to="/">Go home</Link></p>
      </div>
    );
  }

  const inTrip = new Set(trip.activities.map((a) => a.attractionId));

  const toggle = (attractionId: string) => {
    if (inTrip.has(attractionId)) {
      const activities = trip.activities.filter((a) => a.attractionId !== attractionId);
      upsertTrip({ ...trip, activities });
    } else {
      const order = trip.activities.filter((a) => a.dayIndex === null).length;
      const activities = [
        ...trip.activities,
        { id: nanoid(8), attractionId, dayIndex: null, order },
      ];
      upsertTrip({ ...trip, activities });
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Recommendations for</p>
          <h1 className="text-2xl font-bold">{trip.destination} · {trip.durationDays} days</h1>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {trip.preferences.map((p) => <CategoryBadge key={p} category={p} />)}
          </div>
        </div>
        <button
          onClick={() => navigate(`/trip/${trip.id}`)}
          className="btn-primary"
        >
          Continue to itinerary <ArrowRight size={16} />
        </button>
      </div>

      {scored.length === 0 && (
        <div className="card p-10 text-center text-slate-500">
          No attractions found for this destination.
        </div>
      )}

      <ul className="grid md:grid-cols-2 gap-4">
        {scored.map(({ attraction: a }) => {
          const added = inTrip.has(a.id);
          return (
            <li key={a.id} className="card p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{a.name}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span className="inline-flex items-center gap-1"><Star size={12} className="fill-amber-400 stroke-amber-500" />{a.rating.toFixed(1)}</span>
                    <span className="inline-flex items-center gap-1"><Clock size={12} />{formatMinutes(a.visitMinutes)}</span>
                  </div>
                </div>
                <button
                  onClick={() => toggle(a.id)}
                  className={added ? 'btn-secondary' : 'btn-primary'}
                  aria-label={added ? 'Remove from trip' : 'Add to trip'}
                >
                  {added ? <><Check size={14} /> Added</> : <><Plus size={14} /> Add</>}
                </button>
              </div>
              <p className="text-sm text-slate-600">{a.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {a.categories.map((c) => <CategoryBadge key={c} category={c} />)}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
