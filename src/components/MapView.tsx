import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { Attraction } from '../types';

// Fix default marker icons when bundled by Vite.
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export default function MapView({
  center,
  attractions,
}: {
  center: { lat: number; lng: number };
  attractions: Attraction[];
}) {
  return (
    <div className="h-[500px] rounded-xl overflow-hidden border border-slate-200">
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
        {attractions.map((a, i) => (
          <Marker key={a.id} position={[a.lat, a.lng]}>
            <Popup>
              <div className="text-sm">
                <div className="font-semibold">#{i + 1} · {a.name}</div>
                <div className="text-slate-500 mt-1">{a.visitMinutes} min · ★ {a.rating.toFixed(1)}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
