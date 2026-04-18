import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useMemo } from 'react';
import type { Attraction } from '../types';
import { distanceKm, formatKm, pathLengthKm } from '../lib/geo';

// Fix default marker icons when bundled by Vite.
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Numbered pin icon factory (colored circle with the stop number).
function numberedIcon(num: number) {
  return L.divIcon({
    className: 'planora-pin',
    html: `
      <div style="
        background: linear-gradient(135deg, #2f8bff, #4f46e5);
        color: white;
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(47, 139, 255, 0.45);
        border: 2px solid white;
      ">
        <span style="transform: rotate(45deg); font-weight: 700; font-size: 13px;">${num}</span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 30],
    popupAnchor: [0, -28],
  });
}

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 14);
      return;
    }
    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [map, points]);
  return null;
}

export default function MapView({
  center,
  attractions,
}: {
  center: { lat: number; lng: number };
  attractions: Attraction[]; // already ordered
}) {
  const points = useMemo<[number, number][]>(
    () => attractions.map((a) => [a.lat, a.lng]),
    [attractions],
  );
  const totalKm = useMemo(() => pathLengthKm(attractions), [attractions]);

  return (
    <div className="relative h-[520px] rounded-2xl overflow-hidden border border-slate-200 shadow-soft">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={13}
        scrollWheelZoom
        key={`${center.lat},${center.lng}`}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds points={points} />

        {points.length >= 2 && (
          <Polyline
            positions={points}
            pathOptions={{
              color: '#4f46e5',
              weight: 4,
              opacity: 0.75,
              dashArray: '8 8',
            }}
          />
        )}

        {attractions.map((a, i) => {
          const prev = i > 0 ? attractions[i - 1] : null;
          const legKm = prev ? distanceKm(prev, a) : 0;
          return (
            <Marker key={a.id} position={[a.lat, a.lng]} icon={numberedIcon(i + 1)}>
              <Popup>
                <div className="text-sm">
                  <div className="font-semibold">#{i + 1} · {a.name}</div>
                  <div className="text-slate-500 mt-1">
                    {a.visitMinutes} min · ★ {a.rating.toFixed(1)}
                  </div>
                  {prev && (
                    <div className="text-xs text-indigo-600 mt-1">
                      {formatKm(legKm)} from previous stop
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {attractions.length > 0 && (
        <div className="absolute top-3 right-3 z-[500] bg-white/95 backdrop-blur rounded-lg border border-slate-200 shadow-md px-3 py-2 text-xs">
          <div className="font-semibold text-slate-900">
            {attractions.length} stop{attractions.length > 1 ? 's' : ''}
          </div>
          {attractions.length >= 2 && (
            <div className="text-slate-500 mt-0.5">
              <span className="text-indigo-600 font-medium">{formatKm(totalKm)}</span> total route
            </div>
          )}
        </div>
      )}
    </div>
  );
}
