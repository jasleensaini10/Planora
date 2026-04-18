import type { Trip } from '../types';

const KEY = 'wanderly.trips.v1';

export function loadTrips(): Trip[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveTrips(trips: Trip[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(trips));
  } catch {
    // ignore quota errors
  }
}
