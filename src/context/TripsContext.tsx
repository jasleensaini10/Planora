import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { Trip } from '../types';
import { loadTrips, saveTrips } from '../lib/storage';

interface TripsContextValue {
  trips: Trip[];
  getTrip: (id: string) => Trip | undefined;
  upsertTrip: (trip: Trip) => void;
  deleteTrip: (id: string) => void;
}

const TripsContext = createContext<TripsContextValue | undefined>(undefined);

export function TripsProvider({ children }: { children: ReactNode }) {
  const [trips, setTrips] = useState<Trip[]>(() => loadTrips());
  const hydrated = useRef(true);

  useEffect(() => {
    if (!hydrated.current) return;
    saveTrips(trips);
  }, [trips]);

  const upsertTrip = useCallback((trip: Trip) => {
    setTrips((prev) => {
      const idx = prev.findIndex((t) => t.id === trip.id);
      if (idx === -1) return [trip, ...prev];
      const next = prev.slice();
      next[idx] = trip;
      return next;
    });
  }, []);

  const deleteTrip = useCallback((id: string) => {
    setTrips((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const getTrip = useCallback((id: string) => trips.find((t) => t.id === id), [trips]);

  const value = useMemo<TripsContextValue>(
    () => ({ trips, getTrip, upsertTrip, deleteTrip }),
    [trips, getTrip, upsertTrip, deleteTrip],
  );

  return <TripsContext.Provider value={value}>{children}</TripsContext.Provider>;
}

export function useTrips() {
  const ctx = useContext(TripsContext);
  if (!ctx) throw new Error('useTrips must be used within TripsProvider');
  return ctx;
}
