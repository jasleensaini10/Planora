import type { Trip } from '../types';

// Legacy key retained for backwards compatibility during rebrand.
const KEY = 'planora.trips.v1';
const LEGACY_KEY = 'wanderly.trips.v1';

export function loadTrips(): Trip[] {
  try {
    let raw = localStorage.getItem(KEY);
    if (!raw) {
      const legacy = localStorage.getItem(LEGACY_KEY);
      if (legacy) {
        localStorage.setItem(KEY, legacy);
        raw = legacy;
      }
    }
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
