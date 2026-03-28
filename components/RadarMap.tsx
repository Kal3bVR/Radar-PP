import { useMemo, useState } from 'react';
import { Circle, GeoJSON, MapContainer, Marker, Polygon, Popup, TileLayer, useMapEvents } from 'react-leaflet';
import type { LatLngTuple } from 'leaflet';
import type { Feature, Polygon as GeoPolygon } from 'geojson';
import { generateRadarCells, radarLayerColors } from '@/lib/mockRadar';
import { useRadarStore } from '@/lib/store';

interface RadarMapProps {
  draftPoints: LatLngTuple[];
  onDraftPoint: (point: LatLngTuple) => void;
  drawingMode: boolean;
}

function CursorTracker({ onMove }: { onMove: (lat: number, lon: number) => void }) {
  useMapEvents({
    mousemove(event) {
      onMove(event.latlng.lat, event.latlng.lng);
    }
  });
  return null;
}

export default function RadarMap({ draftPoints, onDraftPoint, drawingMode }: RadarMapProps) {
  const [cursor, setCursor] = useState({ lat: 0, lon: 0 });
  const { radarLayer, radarOpacity, timelineIndex, officialWarnings, kabebWarnings } = useRadarStore();

  const cells = useMemo(() => generateRadarCells(timelineIndex + 4), [timelineIndex]);

  const sketchPolygon: Feature<GeoPolygon> | null =
    draftPoints.length >= 3
      ? {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Polygon',
            coordinates: [[...draftPoints.map(([lat, lon]) => [lon, lat]), [draftPoints[0][1], draftPoints[0][0]]]]
          }
        }
      : null;

  return (
    <div className="relative h-full w-full">
      <MapContainer center={[37.8, -96.2]} zoom={5} minZoom={3} className="h-full w-full" zoomControl>
        <TileLayer
          url="https://api.maptiler.com/maps/019d34b0-bced-7e2d-8911-f41023514778/{z}/{x}/{y}.png?key=wiOlE29cBVaCXJZwXOD8"
          attribution="&copy; MapTiler & OpenStreetMap contributors"
        />

        <CursorTracker onMove={(lat, lon) => setCursor({ lat, lon })} />

        {cells.map((cell, idx) => (
          <Circle
            key={idx}
            center={cell.center}
            radius={cell.radius}
            pathOptions={{
              color: radarLayerColors[radarLayer],
              fillColor: radarLayerColors[radarLayer],
              fillOpacity: Math.min(radarOpacity, cell.value / 100)
            }}
          >
            <Popup>
              {radarLayer.toUpperCase()} signal {cell.value.toFixed(0)}
            </Popup>
          </Circle>
        ))}

        {officialWarnings.map((warning) => (
          <GeoJSON key={warning.id} data={warning.geometry} style={{ color: warning.color, weight: 2, fillOpacity: 0.2 }}>
            <Popup>
              <div className="space-y-1">
                <p className="font-semibold">{warning.type.replace('_', ' ')}</p>
                <p>Issued: {new Date(warning.issuedAt).toLocaleString()}</p>
                <p>Expires: {new Date(warning.expiresAt).toLocaleString()}</p>
                <p className="text-sm">{warning.description}</p>
              </div>
            </Popup>
          </GeoJSON>
        ))}

        {kabebWarnings.map((warning) => (
          <GeoJSON
            key={warning.id}
            data={warning.geometry}
            style={{ color: '#ec4899', weight: 3, fillColor: '#ec4899', fillOpacity: 0.14, className: 'kabeb-pulse' }}
          >
            <Popup>
              <div className="space-y-1">
                <p className="font-semibold">{warning.title}</p>
                <p className="text-xs uppercase">Severity: {warning.severity}</p>
                <p className="text-sm">{warning.description}</p>
                <p>Expires: {new Date(warning.expiresAt).toLocaleString()}</p>
              </div>
            </Popup>
          </GeoJSON>
        ))}

        {drawingMode && draftPoints.length > 0 && (
          <>
            <Polygon positions={draftPoints} pathOptions={{ color: '#f472b6', dashArray: '6 4' }} />
            {draftPoints.map((point, idx) => (
              <Marker key={`draft-${idx}`} position={point} />
            ))}
          </>
        )}

        {sketchPolygon && <GeoJSON data={sketchPolygon} style={{ color: '#f472b6', weight: 2, fillOpacity: 0.08 }} />}

        {drawingMode && <MapClickCapture onDraftPoint={onDraftPoint} />}
      </MapContainer>

      <div className="pointer-events-none absolute bottom-3 left-3 rounded bg-slate-950/80 px-3 py-1 text-xs text-slate-200">
        Lat {cursor.lat.toFixed(3)} | Lon {cursor.lon.toFixed(3)}
      </div>
    </div>
  );
}

function MapClickCapture({ onDraftPoint }: { onDraftPoint: (point: LatLngTuple) => void }) {
  useMapEvents({
    click(event) {
      onDraftPoint([event.latlng.lat, event.latlng.lng]);
    }
  });

  return null;
}
