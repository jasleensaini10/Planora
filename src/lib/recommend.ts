import type { Attraction, Category } from '../types';
import { attractionsForCity } from '../data/attractions';

export interface Scored {
  attraction: Attraction;
  score: number;
}

export function scoreAttraction(a: Attraction, prefs: Category[]): number {
  const ratingScore = a.rating / 5; // 0..1
  const prefOverlap = prefs.length
    ? a.categories.filter((c) => prefs.includes(c)).length / prefs.length
    : 0;
  const popularBoost = a.categories.includes('popular') ? 1 : 0;
  return 0.6 * ratingScore + 0.3 * prefOverlap + 0.1 * popularBoost;
}

export function recommend(city: string, prefs: Category[]): Scored[] {
  const pool = attractionsForCity(city);
  return pool
    .map((a) => ({ attraction: a, score: scoreAttraction(a, prefs) }))
    .sort((x, y) => {
      if (y.score !== x.score) return y.score - x.score;
      if (y.attraction.rating !== x.attraction.rating) return y.attraction.rating - x.attraction.rating;
      return x.attraction.name.localeCompare(y.attraction.name);
    });
}
