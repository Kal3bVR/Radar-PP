import dynamic from 'next/dynamic';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { LatLngTuple } from 'leaflet';
import { io, type Socket } from 'socket.io-client';
import ControlPanel from '@/components/ControlPanel';
import { useRadarStore } from '@/lib/store';
import type { KabebWarning, OfficialWarning } from '@/types';

const RadarMap = dynamic(() => import('@/components/RadarMap'), { ssr: false });

const favoriteLocations: Record<string, LatLngTuple> = {
  'oklahoma city': [35.4676, -97.5164],
  dallas: [32.7767, -96.797],
  chicago: [41.8781, -87.6298],
  miami: [25.7617, -80.1918],
  denver: [39.7392, -104.9903]
};

interface BootstrapResponse {
  officialWarnings: OfficialWarning[];
  kabebWarnings: KabebWarning[];
}

export default function HomePage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [drawingMode, setDrawingMode] = useState(false);
  const [draftPoints, setDraftPoints] = useState<LatLngTuple[]>([]);
  const [mapFocus, setMapFocus] = useState<LatLngTuple | null>(null);

  const soundRef = useRef<HTMLAudioElement | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const { setOfficialWarnings, setKabebWarnings, prependKabebWarning, radarFrames, timelineIndex, isAnimating, setTimelineIndex } =
    useRadarStore();

  useEffect(() => {
    soundRef.current = new Audio(
      'data:audio/wav;base64,UklGRjwAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YRgAAAAA////AAAAAAAAAAAAAAAAAAAAAA=='
    );
  }, []);

  useEffect(() => {
    const session = sessionStorage.getItem('kabeb_admin');
    if (session) setIsAdmin(true);

    fetch('/api/bootstrap')
      .then((res) => res.json())
      .then((data: BootstrapResponse) => {
        setOfficialWarnings(data.officialWarnings);
        setKabebWarnings(data.kabebWarnings);
      });

    const socket = io({ path: '/ws' });
    socketRef.current = socket;

    socket.on('kabeb:init', (warnings: KabebWarning[]) => {
      setKabebWarnings(warnings);
    });

    socket.on('kabeb:new', (warning: KabebWarning) => {
      prependKabebWarning(warning);
      soundRef.current?.play().catch(() => {
        // autoplay may be blocked until user interaction
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [prependKabebWarning, setKabebWarnings, setOfficialWarnings]);

  useEffect(() => {
    if (!isAnimating) return;
    const id = setInterval(() => {
      setTimelineIndex((timelineIndex + 1) % radarFrames.length);
    }, 700);

    return () => clearInterval(id);
  }, [isAnimating, radarFrames.length, setTimelineIndex, timelineIndex]);

  const onLogin = async (username: string, password: string) => {
    const result = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (!result.ok) {
      alert('Invalid credentials');
      return;
    }

    sessionStorage.setItem('kabeb_admin', username);
    setIsAdmin(true);
  };

  const createKabebWarning = (payload: {
    title: string;
    description: string;
    severity: 'low' | 'moderate' | 'high' | 'extreme';
    expiresAt: string;
    points: LatLngTuple[];
  }) => {
    const warning: KabebWarning = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      createdBy: sessionStorage.getItem('kabeb_admin') || 'admin',
      title: payload.title,
      description: payload.description,
      severity: payload.severity,
      expiresAt: payload.expiresAt,
      geometry: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [[...payload.points.map(([lat, lon]) => [lon, lat]), [payload.points[0][1], payload.points[0][0]]]]
        }
      }
    };

    socketRef.current?.emit('kabeb:create', warning);
    setDraftPoints([]);
    setDrawingMode(false);
  };

  const goToLocation = (query: string) => {
    const key = query.toLowerCase().trim();
    const location = favoriteLocations[key];

    if (!location) {
      alert('Location not found in quick-search. Try: Oklahoma City, Dallas, Chicago, Miami, Denver');
      return;
    }

    setMapFocus(location);
  };

  const headerText = useMemo(
    () => `Frame ${timelineIndex + 1}/${radarFrames.length} • Updated ${new Date(radarFrames[timelineIndex].timestamp).toLocaleTimeString()}`,
    [radarFrames, timelineIndex]
  );

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-slate-950">
      <div className="absolute right-4 top-4 z-[1000] panel px-4 py-3 text-right">
        <h1 className="text-lg font-bold tracking-wide text-sky-300">Radar PP</h1>
        <p className="text-xs text-slate-300">Professional Weather Workstation</p>
        <p className="mt-1 text-[11px] text-slate-400">{headerText}</p>
      </div>

      <ControlPanel
        isAdmin={isAdmin}
        onLogin={onLogin}
        onCreateWarning={createKabebWarning}
        draftPoints={draftPoints}
        drawingMode={drawingMode}
        setDrawingMode={setDrawingMode}
        clearDraft={() => setDraftPoints([])}
        goToLocation={goToLocation}
      />

      <RadarMap
        draftPoints={draftPoints}
        drawingMode={drawingMode}
        onDraftPoint={(point) => setDraftPoints((prev) => [...prev, point])}
      />

      {mapFocus && (
        <div className="absolute bottom-3 right-4 z-[1000] panel px-3 py-2 text-xs">
          Focus target set to {mapFocus[0].toFixed(2)}, {mapFocus[1].toFixed(2)} (center manually with map controls)
        </div>
      )}

      <aside className="absolute bottom-4 left-1/2 z-[1000] w-[380px] max-w-[92vw] -translate-x-1/2 rounded-xl border border-slate-700/80 bg-slate-900/80 p-3 text-xs backdrop-blur-md">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-semibold text-slate-200">Legend</span>
          <span className="text-[10px] text-slate-400">MapTiler basemap + simulated radar products</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-slate-300">
          <div className="flex items-center gap-2"><span className="legend-swatch bg-cyan-400" />Reflectivity</div>
          <div className="flex items-center gap-2"><span className="legend-swatch bg-orange-500" />Velocity</div>
          <div className="flex items-center gap-2"><span className="legend-swatch bg-fuchsia-400" />CC</div>
          <div className="flex items-center gap-2"><span className="legend-swatch bg-red-500" />SRV</div>
        </div>
      </aside>
    </main>
  );
}
