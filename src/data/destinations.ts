export interface Destination {
  city: string;
  country: string;
  lat: number;
  lng: number;
  emoji: string;
}

export const DESTINATIONS: Destination[] = [
  { city: 'Paris',     country: 'France',         lat: 48.8566, lng: 2.3522,    emoji: '🇫🇷' },
  { city: 'Rome',      country: 'Italy',          lat: 41.9028, lng: 12.4964,   emoji: '🇮🇹' },
  { city: 'Tokyo',     country: 'Japan',          lat: 35.6762, lng: 139.6503,  emoji: '🇯🇵' },
  { city: 'New York',  country: 'United States',  lat: 40.7128, lng: -74.0060,  emoji: '🇺🇸' },
  { city: 'Barcelona', country: 'Spain',          lat: 41.3851, lng: 2.1734,    emoji: '🇪🇸' },
  { city: 'London',    country: 'United Kingdom', lat: 51.5074, lng: -0.1278,   emoji: '🇬🇧' },
  { city: 'Bangkok',   country: 'Thailand',       lat: 13.7563, lng: 100.5018,  emoji: '🇹🇭' },
  { city: 'Istanbul',  country: 'Turkey',         lat: 41.0082, lng: 28.9784,   emoji: '🇹🇷' },
];

export function findDestination(city: string): Destination | undefined {
  return DESTINATIONS.find((d) => d.city.toLowerCase() === city.toLowerCase());
}
