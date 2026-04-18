import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { nanoid } from 'nanoid';
import { Sparkles, Hand } from 'lucide-react';
import { DESTINATIONS } from '../data/destinations';
import { CATEGORIES, CATEGORY_META, type Category, type Trip } from '../types';
import { useTrips } from '../context/TripsContext';
import { autoPlan } from '../lib/planner';

export default function CreateTripPage() {
  const navigate = useNavigate();
  const { upsertTrip } = useTrips();

  const [destination, setDestination] = useState('');
  const [prefs, setPrefs] = useState<Category[]>(['popular']);
  const [duration, setDuration] = useState(5);
  const [mode, setMode] = useState<'auto' | 'manual'>('auto');

  const suggestions = useMemo(() => {
    const q = destination.trim().toLowerCase();
    if (!q) return DESTINATIONS;
    return DESTINATIONS.filter(
      (d) => d.city.toLowerCase().includes(q) || d.country.toLowerCase().includes(q),
    );
  }, [destination]);

  const matched = DESTINATIONS.find((d) => d.city.toLowerCase() === destination.trim().toLowerCase());
  const canSubmit = !!matched && prefs.length > 0;

  const togglePref = (c: Category) => {
    setPrefs((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  };

  const handleSubmit = () => {
    if (!matched) return;
    const base: Trip = {
      id: nanoid(10),
      destination: matched.city,
      preferences: prefs,
      durationDays: duration,
      mode,
      activities: [],
      createdAt: new Date().toISOString(),
    };
    const trip: Trip = mode === 'auto' ? { ...base, activities: autoPlan(base) } : base;
    upsertTrip(trip);
    navigate(mode === 'auto' ? `/trip/${trip.id}` : `/trip/${trip.id}/recommend`);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold">Create a trip</h1>
      <p className="text-slate-500 text-sm mt-1">Tell us where you're going and what you love.</p>

      <div className="space-y-6 mt-8">
        {/* Destination */}
        <div className="card p-6">
          <label className="block text-sm font-semibold mb-2">Destination</label>
          <input
            className="input"
            placeholder="Start typing a city…"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            list="destinations"
          />
          <datalist id="destinations">
            {DESTINATIONS.map((d) => (
              <option key={d.city} value={d.city}>{d.country}</option>
            ))}
          </datalist>
          <div className="flex flex-wrap gap-2 mt-3">
            {suggestions.slice(0, 8).map((d) => (
              <button
                key={d.city}
                type="button"
                onClick={() => setDestination(d.city)}
                className={`chip ${matched?.city === d.city ? 'chip-active' : ''}`}
              >
                <span>{d.emoji}</span>{d.city}
              </button>
            ))}
          </div>
          {!matched && destination && (
            <p className="text-xs text-amber-600 mt-2">
              We only have curated data for these 8 cities right now — pick one to continue.
            </p>
          )}
        </div>

        {/* Preferences */}
        <div className="card p-6">
          <label className="block text-sm font-semibold mb-2">What do you enjoy?</label>
          <p className="text-xs text-slate-500 mb-3">Select one or more — we'll balance your itinerary across them.</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => togglePref(c)}
                className={`chip ${prefs.includes(c) ? 'chip-active' : ''}`}
              >
                <span>{CATEGORY_META[c].icon}</span>{CATEGORY_META[c].label}
              </button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div className="card p-6">
          <div className="flex items-baseline justify-between mb-2">
            <label className="text-sm font-semibold">Trip duration</label>
            <span className="text-brand-700 font-semibold">{duration} day{duration > 1 ? 's' : ''}</span>
          </div>
          <input
            type="range"
            min={1}
            max={14}
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value, 10))}
            className="w-full accent-brand-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>1</span><span>7</span><span>14</span>
          </div>
        </div>

        {/* Mode */}
        <div className="card p-6">
          <label className="block text-sm font-semibold mb-3">How would you like to plan?</label>
          <div className="grid sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMode('auto')}
              className={`text-left p-4 rounded-lg border-2 transition ${mode === 'auto' ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:border-slate-300'}`}
            >
              <Sparkles className="text-brand-600" size={18} />
              <div className="font-semibold mt-2">Plan for me</div>
              <div className="text-xs text-slate-500 mt-1">
                Auto-generate a balanced itinerary with 3–5 activities per day.
              </div>
            </button>
            <button
              type="button"
              onClick={() => setMode('manual')}
              className={`text-left p-4 rounded-lg border-2 transition ${mode === 'manual' ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:border-slate-300'}`}
            >
              <Hand className="text-brand-600" size={18} />
              <div className="font-semibold mt-2">I'll plan myself</div>
              <div className="text-xs text-slate-500 mt-1">
                Browse recommendations and drag activities into days.
              </div>
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <button disabled={!canSubmit} onClick={handleSubmit} className="btn-primary">
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
}
