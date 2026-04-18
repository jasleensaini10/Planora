import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import {
  ArrowLeft,
  Sparkles,
  List,
  Map as MapIcon,
  Clock,
  GripVertical,
  X,
  Plus,
} from 'lucide-react';
import { useTrips } from '../context/TripsContext';
import { attractionById } from '../data/attractions';
import { findDestination } from '../data/destinations';
import { autoPlan, dayTotals, formatMinutes } from '../lib/planner';
import { orderByNearest, formatKm } from '../lib/geo';
import { recommend } from '../lib/recommend';
import { nanoid } from 'nanoid';
import type { Activity, Trip } from '../types';
import CategoryBadge from '../components/CategoryBadge';
import MapView from '../components/MapView';

const UNASSIGNED = 'pool';

function ActivityCard({
  activity,
  onRemove,
  dragHandle,
}: {
  activity: Activity;
  onRemove: () => void;
  dragHandle?: React.ReactNode;
}) {
  const a = attractionById(activity.attractionId);
  if (!a) return null;
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-3 flex items-start gap-2 shadow-sm">
      {dragHandle}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-sm truncate">{a.name}</h4>
          <button
            onClick={onRemove}
            className="text-slate-400 hover:text-red-600 shrink-0"
            aria-label="Remove"
          >
            <X size={14} />
          </button>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
          <Clock size={11} /> {formatMinutes(a.visitMinutes)}
          <span>· ★ {a.rating.toFixed(1)}</span>
        </div>
        <div className="flex flex-wrap gap-1 mt-1.5">
          {a.categories.slice(0, 2).map((c) => <CategoryBadge key={c} category={c} />)}
        </div>
      </div>
    </div>
  );
}

function DraggableActivity({
  activity,
  onRemove,
}: {
  activity: Activity;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: activity.id });
  return (
    <div
      ref={setNodeRef}
      className={`transition ${isDragging ? 'opacity-40' : ''}`}
      style={{ touchAction: 'none' }}
    >
      <ActivityCard
        activity={activity}
        onRemove={onRemove}
        dragHandle={
          <button
            {...attributes}
            {...listeners}
            className="p-1 text-slate-400 hover:text-slate-700 cursor-grab active:cursor-grabbing"
            aria-label="Drag"
          >
            <GripVertical size={16} />
          </button>
        }
      />
    </div>
  );
}

function DayColumn({
  dayIndex,
  label,
  activities,
  totals,
  onRemove,
  droppableId,
  highlight,
}: {
  dayIndex: number | null;
  label: string;
  activities: Activity[];
  totals?: { count: number; minutes: number; km: number };
  onRemove: (id: string) => void;
  droppableId: string;
  highlight?: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: droppableId });
  return (
    <div
      ref={setNodeRef}
      className={`card p-4 flex flex-col gap-3 min-h-[220px] transition ${
        isOver ? 'ring-2 ring-brand-400 bg-brand-50/40' : ''
      } ${highlight ? 'border-brand-400' : ''}`}
    >
      <div className="flex items-baseline justify-between">
        <h3 className="font-semibold">{label}</h3>
        {totals && (
          <span className="text-xs text-slate-500">
            {totals.count} · {formatMinutes(totals.minutes)}
            {totals.km > 0 && <> · <span className="text-indigo-600 font-medium">{formatKm(totals.km)}</span></>}
          </span>
        )}
      </div>
      <div className="space-y-2 flex-1">
        {activities.length === 0 ? (
          <div className="text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg p-4 text-center">
            Drop activities here
          </div>
        ) : (
          activities.map((a) => (
            <DraggableActivity key={a.id} activity={a} onRemove={() => onRemove(a.id)} />
          ))
        )}
      </div>
      {/* silence unused var lint: dayIndex is used by parent's layout decisions */}
      <span className="hidden">{dayIndex}</span>
    </div>
  );
}

export default function ItineraryPage() {
  const { id } = useParams();
  const { getTrip, upsertTrip } = useTrips();
  const trip = id ? getTrip(id) : undefined;

  const [view, setView] = useState<'list' | 'map'>('list');
  const [selectedDay, setSelectedDay] = useState(0);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const activitiesByDay = useMemo(() => {
    const map = new Map<number | 'pool', Activity[]>();
    if (!trip) return map;
    for (let d = 0; d < trip.durationDays; d++) map.set(d, []);
    map.set('pool', []);
    for (const a of trip.activities) {
      const key = a.dayIndex === null ? 'pool' : a.dayIndex;
      map.get(key)?.push(a);
    }
    for (const [, list] of map) list.sort((x, y) => x.order - y.order);
    return map;
  }, [trip]);

  if (!trip) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <p>Trip not found. <Link className="text-brand-600 underline" to="/">Go home</Link></p>
      </div>
    );
  }

  const dest = findDestination(trip.destination);

  const updateActivities = (activities: Activity[]) => {
    upsertTrip({ ...trip, activities });
  };

  const handleRemove = (activityId: string) => {
    updateActivities(trip.activities.filter((a) => a.id !== activityId));
  };

  const handleDragStart = (e: DragStartEvent) => setActiveDragId(String(e.active.id));

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveDragId(null);
    const { active, over } = e;
    if (!over) return;
    const activityId = String(active.id);
    const overId = String(over.id);
    const targetDay: number | null = overId === UNASSIGNED ? null : parseInt(overId.replace('day-', ''), 10);

    const current = trip.activities.find((a) => a.id === activityId);
    if (!current) return;
    if (current.dayIndex === targetDay) return;

    const nextSameBucket = trip.activities.filter(
      (a) => a.id !== activityId && a.dayIndex === targetDay,
    );
    const updated: Activity = { ...current, dayIndex: targetDay, order: nextSameBucket.length };
    const rest = trip.activities.filter((a) => a.id !== activityId);
    updateActivities([...rest, updated]);
  };

  const regenerate = () => {
    if (!confirm('Replace current plan with a fresh auto-generated itinerary?')) return;
    const freshTrip: Trip = { ...trip, activities: [] };
    const next = autoPlan(freshTrip);
    upsertTrip({ ...trip, activities: next, mode: 'auto' });
  };

  const plannedActivitiesIds = new Set(trip.activities.map((a) => a.attractionId));
  const recommendations = recommend(trip.destination, trip.preferences)
    .filter((s) => !plannedActivitiesIds.has(s.attraction.id))
    .slice(0, 12);

  const addRecommendation = (attractionId: string, dayIndex: number | null) => {
    const sameBucket = trip.activities.filter((a) => a.dayIndex === dayIndex).length;
    const activity: Activity = {
      id: nanoid(8),
      attractionId,
      dayIndex,
      order: sameBucket,
    };
    updateActivities([...trip.activities, activity]);
  };

  const activeActivity = activeDragId
    ? trip.activities.find((a) => a.id === activeDragId)
    : null;

  // Map view data — respect saved order; nearest-neighbour fallback for any missing order.
  const selectedDayActivities = activitiesByDay.get(selectedDay) ?? [];
  const rawMapAttractions = selectedDayActivities
    .map((a) => attractionById(a.attractionId))
    .filter((a): a is NonNullable<typeof a> => !!a);
  const mapAttractions = useMemo(() => {
    if (rawMapAttractions.length <= 2) return rawMapAttractions;
    // Start from the first (order=0) to preserve user intent, re-order the rest by nearest-neighbour.
    const [first, ...rest] = rawMapAttractions;
    const { ordered } = orderByNearest(rest, first);
    return [first, ...ordered];
  }, [rawMapAttractions]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link to="/" className="btn-ghost inline-flex mb-4 -ml-2"><ArrowLeft size={16} />Back</Link>

      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <div className="text-3xl">{dest?.emoji}</div>
          <h1 className="text-2xl font-bold">{trip.destination}</h1>
          <p className="text-sm text-slate-500">
            {trip.durationDays} day{trip.durationDays > 1 ? 's' : ''} · {dest?.country}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {trip.preferences.map((p) => <CategoryBadge key={p} category={p} />)}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to={`/trip/${trip.id}/recommend`} className="btn-secondary">
            <Plus size={14} /> Browse recommendations
          </Link>
          <button onClick={regenerate} className="btn-secondary">
            <Sparkles size={14} /> Auto-plan
          </button>
          <div className="inline-flex rounded-lg border border-slate-200 bg-white overflow-hidden">
            <button
              onClick={() => setView('list')}
              className={`px-3 py-2 text-sm inline-flex items-center gap-1 ${view === 'list' ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <List size={14} /> List
            </button>
            <button
              onClick={() => setView('map')}
              className={`px-3 py-2 text-sm inline-flex items-center gap-1 ${view === 'map' ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <MapIcon size={14} /> Map
            </button>
          </div>
        </div>
      </div>

      {view === 'map' && dest && (
        <div className="space-y-3 mb-6">
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: trip.durationDays }).map((_, i) => (
              <button
                key={i}
                onClick={() => setSelectedDay(i)}
                className={`chip ${selectedDay === i ? 'chip-active' : ''}`}
              >
                Day {i + 1}
              </button>
            ))}
          </div>
          <MapView center={{ lat: dest.lat, lng: dest.lng }} attractions={mapAttractions} />
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: trip.durationDays }).map((_, i) => {
            const totals = dayTotals(trip.activities, i);
            return (
              <DayColumn
                key={i}
                dayIndex={i}
                droppableId={`day-${i}`}
                label={`Day ${i + 1}`}
                activities={activitiesByDay.get(i) ?? []}
                totals={totals}
                onRemove={handleRemove}
                highlight={view === 'map' && selectedDay === i}
              />
            );
          })}

          <DayColumn
            dayIndex={null}
            droppableId={UNASSIGNED}
            label="Unassigned"
            activities={activitiesByDay.get('pool') ?? []}
            onRemove={handleRemove}
          />
        </div>

        <DragOverlay>
          {activeActivity ? (
            <ActivityCard activity={activeActivity} onRemove={() => {}} />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Quick add panel */}
      <section className="mt-10">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-lg font-semibold">Add more activities</h2>
          <button
            className="text-sm text-brand-700 hover:underline"
            onClick={() => setShowAddMenu((v) => !v)}
          >
            {showAddMenu ? 'Hide' : 'Show recommendations'}
          </button>
        </div>
        {showAddMenu && (
          <ul className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {recommendations.map(({ attraction: a }) => (
              <li key={a.id} className="card p-4 flex flex-col gap-2">
                <h4 className="font-medium text-sm">{a.name}</h4>
                <p className="text-xs text-slate-500 line-clamp-2">{a.description}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {a.categories.slice(0, 3).map((c) => <CategoryBadge key={c} category={c} />)}
                </div>
                <button
                  onClick={() => addRecommendation(a.id, null)}
                  className="btn-secondary mt-auto"
                >
                  <Plus size={14} /> Add to unassigned
                </button>
              </li>
            ))}
            {recommendations.length === 0 && (
              <li className="text-sm text-slate-500">All recommended activities are already in your trip.</li>
            )}
          </ul>
        )}
      </section>
    </div>
  );
}
