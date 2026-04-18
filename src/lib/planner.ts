import { nanoid } from 'nanoid';
import type { Activity, Attraction, Category, Trip } from '../types';
import { attractionById } from '../data/attractions';
import { findDestination } from '../data/destinations';
import { recommend } from './recommend';
import { distanceKm, orderByNearest } from './geo';

const DAILY_TIME_BUDGET = 8 * 60; // 8 hours in minutes
const TARGET_PER_DAY = 4; // aim for 3–5; center at 4
const MAX_PER_DAY = 5;
const MIN_PER_DAY = 3;
const MAX_DAY_RADIUS_KM = 8; // prefer activities within 8km of the day's anchor

/**
 * Auto-plan strategy:
 *  1. Take top scored candidates (N = durationDays * TARGET_PER_DAY + buffer).
 *  2. Pick one geographic anchor per day (most central unused candidate
 *     that is far from already-used anchors), ensuring each day explores a
 *     distinct part of the city.
 *  3. Fill each day with the closest remaining candidates, balancing
 *     categories and respecting MAX_PER_DAY + DAILY_TIME_BUDGET.
 *  4. Order each day's stops by nearest-neighbour walking path.
 *  5. Remaining items go to the unassigned pool.
 */
export function autoPlan(trip: Trip): Activity[] {
  const scored = recommend(trip.destination, trip.preferences);
  const bufferSize = Math.min(scored.length, trip.durationDays * TARGET_PER_DAY + 6);
  const candidates = scored.slice(0, bufferSize).map((s) => s.attraction);
  if (candidates.length === 0) return [];

  const prefs: Category[] = trip.preferences.length ? trip.preferences : ['popular'];
  const dest = findDestination(trip.destination);
  const cityCenter = dest ? { lat: dest.lat, lng: dest.lng } : candidates[0];

  const placed = new Set<string>();
  const dayBuckets: Attraction[][] = Array.from({ length: trip.durationDays }, () => []);
  const dayAnchors: Attraction[] = [];

  // Pick anchors: the highest-rated unused candidate that maximizes minimum
  // distance to existing anchors. First anchor = the one closest to city center.
  for (let d = 0; d < trip.durationDays; d++) {
    const pool = candidates.filter((a) => !placed.has(a.id));
    if (!pool.length) break;
    let best: Attraction | undefined;
    let bestScore = -Infinity;
    for (const cand of pool) {
      // distance to nearest existing anchor (bigger = better spread).
      const minDistToAnchors = dayAnchors.length
        ? Math.min(...dayAnchors.map((anchor) => distanceKm(cand, anchor)))
        : -distanceKm(cand, cityCenter); // for first anchor, prefer central
      // weight: ensure spread primarily, break ties by rating.
      const score = minDistToAnchors + cand.rating * 0.2;
      if (score > bestScore) {
        bestScore = score;
        best = cand;
      }
    }
    if (!best) break;
    placed.add(best.id);
    dayAnchors.push(best);
    dayBuckets[d].push(best);
  }

  // Fill each day: pick the closest remaining candidate to the day's anchor,
  // prefer category diversity and respect time/count caps.
  for (let d = 0; d < dayAnchors.length; d++) {
    const anchor = dayAnchors[d];
    let minutes = anchor.visitMinutes;
    const usedCats = new Set<Category>(anchor.categories);

    while (dayBuckets[d].length < MAX_PER_DAY) {
      const pool = candidates
        .filter((a) => !placed.has(a.id))
        .map((a) => ({
          a,
          dist: distanceKm(a, anchor),
          // prefer items near the anchor, with a diversity + category boost.
          catBonus: a.categories.some((c) => prefs.includes(c) && !usedCats.has(c)) ? 1 : 0,
        }))
        // Soft radius: allow items slightly outside if day is still short.
        .filter((x) => x.dist <= (dayBuckets[d].length < MIN_PER_DAY ? MAX_DAY_RADIUS_KM * 1.5 : MAX_DAY_RADIUS_KM))
        .sort((x, y) => y.catBonus - x.catBonus || x.dist - y.dist);

      const next = pool[0]?.a;
      if (!next) break;
      if (minutes + next.visitMinutes > DAILY_TIME_BUDGET && dayBuckets[d].length >= MIN_PER_DAY) break;

      dayBuckets[d].push(next);
      placed.add(next.id);
      minutes += next.visitMinutes;
      next.categories.forEach((c) => usedCats.add(c));
    }
  }

  // Top up any short days by relaxing the radius (use any closest remaining).
  for (let d = 0; d < dayAnchors.length; d++) {
    while (dayBuckets[d].length < MIN_PER_DAY) {
      const pool = candidates
        .filter((a) => !placed.has(a.id))
        .map((a) => ({ a, dist: distanceKm(a, dayAnchors[d]) }))
        .sort((x, y) => x.dist - y.dist);
      const next = pool[0]?.a;
      if (!next) break;
      dayBuckets[d].push(next);
      placed.add(next.id);
    }
  }

  // Order each day's items by nearest-neighbour walking path starting at the anchor.
  const activities: Activity[] = [];
  dayBuckets.forEach((items, dayIndex) => {
    if (!items.length) return;
    const anchor = items[0];
    const rest = items.slice(1);
    const { ordered } = orderByNearest(rest, anchor);
    const finalOrder = [anchor, ...ordered];
    finalOrder.forEach((a, order) => {
      activities.push({ id: nanoid(8), attractionId: a.id, dayIndex, order });
    });
  });

  // Unassigned pool gets the rest of the top candidates.
  candidates
    .filter((a) => !placed.has(a.id))
    .forEach((a, order) => {
      activities.push({ id: nanoid(8), attractionId: a.id, dayIndex: null, order });
    });

  return activities;
}

export function dayTotals(activities: Activity[], dayIndex: number) {
  const dayActs = activities
    .filter((a) => a.dayIndex === dayIndex)
    .sort((a, b) => a.order - b.order);
  const minutes = dayActs.reduce((sum, a) => {
    const at = attractionById(a.attractionId);
    return sum + (at?.visitMinutes ?? 0);
  }, 0);
  let km = 0;
  for (let i = 1; i < dayActs.length; i++) {
    const prev = attractionById(dayActs[i - 1].attractionId);
    const curr = attractionById(dayActs[i].attractionId);
    if (prev && curr) km += distanceKm(prev, curr);
  }
  return { count: dayActs.length, minutes, km };
}

export function formatMinutes(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
}
