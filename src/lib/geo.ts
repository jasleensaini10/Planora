// Haversine distance & nearest-neighbour ordering helpers.

export interface LatLng {
  lat: number;
  lng: number;
}

const R_KM = 6371;

export function distanceKm(a: LatLng, b: LatLng): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function formatKm(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

/**
 * Order a set of points by nearest-neighbour starting from `start`,
 * returning both the ordered points and the cumulative distance.
 */
export function orderByNearest<T extends LatLng>(points: T[], start?: LatLng): { ordered: T[]; totalKm: number } {
  if (points.length === 0) return { ordered: [], totalKm: 0 };
  const remaining = points.slice();
  const ordered: T[] = [];
  let current: LatLng = start ?? remaining[0];
  if (!start) {
    ordered.push(remaining.shift()!);
    current = ordered[0];
  }
  let total = 0;
  while (remaining.length) {
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const d = distanceKm(current, remaining[i]);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }
    const next = remaining.splice(bestIdx, 1)[0];
    total += bestDist;
    ordered.push(next);
    current = next;
  }
  return { ordered, totalKm: total };
}

/**
 * Compute cumulative path length along the given ordered points.
 */
export function pathLengthKm(points: LatLng[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += distanceKm(points[i - 1], points[i]);
  }
  return total;
}
