import { nanoid } from 'nanoid';
import type { Activity, Category, Trip } from '../types';
import { attractionById } from '../data/attractions';
import { recommend } from './recommend';

const DAILY_TIME_BUDGET = 8 * 60; // 8 hours in minutes
const TARGET_PER_DAY = 4; // aim for 3–5; center at 4
const MAX_PER_DAY = 5;
const MIN_PER_DAY = 3;

/**
 * Build a day-by-day plan balancing categories.
 * Strategy:
 *  1. Take the top N scored attractions (N = durationDays * TARGET_PER_DAY, plus a buffer).
 *  2. Round-robin across the user's preferred categories to avoid overloading one type.
 *  3. Respect daily time budget; cap day size at MAX_PER_DAY.
 *  4. Overflow goes to the unassigned pool (dayIndex = null).
 */
export function autoPlan(trip: Trip): Activity[] {
  const scored = recommend(trip.destination, trip.preferences);
  const candidateCount = Math.min(scored.length, trip.durationDays * TARGET_PER_DAY + 4);
  const candidates = scored.slice(0, candidateCount).map((s) => s.attraction);

  const prefs: Category[] = trip.preferences.length ? trip.preferences : ['popular'];

  // Bucket candidates by their dominant preferred category (first matching pref).
  const buckets = new Map<Category, typeof candidates>();
  for (const cat of prefs) buckets.set(cat, []);
  const leftovers: typeof candidates = [];
  for (const a of candidates) {
    const cat = prefs.find((p) => a.categories.includes(p));
    if (cat) buckets.get(cat)!.push(a);
    else leftovers.push(a);
  }

  // Day scaffolding
  const days: { items: typeof candidates; minutes: number }[] = Array.from(
    { length: trip.durationDays },
    () => ({ items: [], minutes: 0 }),
  );

  const placed = new Set<string>();

  const tryPlace = (dayIdx: number, item: typeof candidates[number]): boolean => {
    const day = days[dayIdx];
    if (day.items.length >= MAX_PER_DAY) return false;
    if (day.minutes + item.visitMinutes > DAILY_TIME_BUDGET && day.items.length >= MIN_PER_DAY) return false;
    day.items.push(item);
    day.minutes += item.visitMinutes;
    placed.add(item.id);
    return true;
  };

  // Round-robin across days, cycling through preferred categories.
  let dayCursor = 0;
  let anyProgress = true;
  while (anyProgress) {
    anyProgress = false;
    for (let d = 0; d < trip.durationDays; d++) {
      const dayIdx = (dayCursor + d) % trip.durationDays;
      if (days[dayIdx].items.length >= MAX_PER_DAY) continue;
      for (const cat of prefs) {
        const bucket = buckets.get(cat)!;
        const next = bucket.find((a) => !placed.has(a.id));
        if (!next) continue;
        if (tryPlace(dayIdx, next)) {
          anyProgress = true;
          break;
        }
      }
    }
    dayCursor++;
  }

  // Fill remaining slots with leftovers if any day is still under MIN_PER_DAY.
  for (let d = 0; d < trip.durationDays; d++) {
    while (days[d].items.length < MIN_PER_DAY) {
      const next = leftovers.find((a) => !placed.has(a.id));
      if (!next) break;
      if (!tryPlace(d, next)) break;
    }
  }

  // Build Activity records.
  const activities: Activity[] = [];
  days.forEach((day, dayIndex) => {
    day.items.forEach((a, order) => {
      activities.push({ id: nanoid(8), attractionId: a.id, dayIndex, order });
    });
  });

  // Everything else → unassigned pool.
  const unassignedPool = candidates.filter((a) => !placed.has(a.id));
  unassignedPool.forEach((a, order) => {
    activities.push({ id: nanoid(8), attractionId: a.id, dayIndex: null, order });
  });

  return activities;
}

export function dayTotals(activities: Activity[], dayIndex: number) {
  const dayActs = activities.filter((a) => a.dayIndex === dayIndex);
  const minutes = dayActs.reduce((sum, a) => {
    const at = attractionById(a.attractionId);
    return sum + (at?.visitMinutes ?? 0);
  }, 0);
  return { count: dayActs.length, minutes };
}

export function formatMinutes(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
}
