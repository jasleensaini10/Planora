export type Category = 'nature' | 'shopping' | 'food' | 'history' | 'popular';

export const CATEGORIES: Category[] = ['nature', 'shopping', 'food', 'history', 'popular'];

export const CATEGORY_META: Record<Category, { label: string; color: string; icon: string }> = {
  nature: { label: 'Nature', color: 'bg-emerald-100 text-emerald-700', icon: '🌿' },
  shopping: { label: 'Shopping', color: 'bg-pink-100 text-pink-700', icon: '🛍️' },
  food: { label: 'Food', color: 'bg-amber-100 text-amber-700', icon: '🍜' },
  history: { label: 'History', color: 'bg-violet-100 text-violet-700', icon: '🏛️' },
  popular: { label: 'Popular', color: 'bg-brand-100 text-brand-700', icon: '⭐' },
};

export interface Attraction {
  id: string;
  name: string;
  description: string;
  categories: Category[];
  rating: number; // 1..5
  visitMinutes: number;
  lat: number;
  lng: number;
  city: string;
}

export interface Activity {
  id: string;
  attractionId: string;
  dayIndex: number | null; // null = unassigned pool
  order: number;
}

export interface Trip {
  id: string;
  destination: string; // city name, matches Attraction.city
  preferences: Category[];
  durationDays: number; // 1..14
  mode: 'auto' | 'manual';
  activities: Activity[];
  createdAt: string;
}
