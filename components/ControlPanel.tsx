import { FormEvent, useMemo, useState } from 'react';
import type { LatLngTuple } from 'leaflet';
import type { RadarLayer } from '@/types';
import { useRadarStore } from '@/lib/store';
import { modelOverlayText } from '@/lib/mockRadar';

interface ControlPanelProps {
  isAdmin: boolean;
  onLogin: (username: string, password: string) => Promise<void>;
  onCreateWarning: (payload: {
    title: string;
    description: string;
    severity: 'low' | 'moderate' | 'high' | 'extreme';
    expiresAt: string;
    points: LatLngTuple[];
  }) => void;
  draftPoints: LatLngTuple[];
  drawingMode: boolean;
  setDrawingMode: (value: boolean) => void;
  clearDraft: () => void;
  goToLocation: (query: string) => void;
}

const layerOptions: { value: RadarLayer; label: string }[] = [
  { value: 'reflectivity', label: 'Reflectivity' },
  { value: 'velocity', label: 'Velocity' },
  { value: 'cc', label: 'Correlation Coef (CC)' },
  { value: 'srv', label: 'Storm Relative Velocity (SRV)' }
];

export default function ControlPanel({
  isAdmin,
  onLogin,
  onCreateWarning,
  draftPoints,
  drawingMode,
  setDrawingMode,
  clearDraft,
  goToLocation
}: ControlPanelProps) {
  const {
    radarLayer,
    radarOpacity,
    timelineIndex,
    isAnimating,
    setRadarLayer,
    setRadarOpacity,
    setTimelineIndex,
    setIsAnimating,
    model,
    modelHour,
    setModel,
    setModelHour,
    radarFrames,
    officialWarnings,
    kabebWarnings
  } = useRadarStore();

  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [search, setSearch] = useState('Oklahoma City');
  const [warningForm, setWarningForm] = useState({
    title: 'Kabeb Advisory',
    description: 'Rapidly strengthening storms expected in this area.',
    severity: 'moderate' as const,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16)
  });

  const activeFrame = radarFrames[timelineIndex];

  const warningCounts = useMemo(
    () => ({ official: officialWarnings.length, kabeb: kabebWarnings.length }),
    [officialWarnings.length, kabebWarnings.length]
  );

  const submitLogin = async (e: FormEvent) => {
    e.preventDefault();
    await onLogin(loginForm.username, loginForm.password);
  };

  const submitKabebWarning = (e: FormEvent) => {
    e.preventDefault();
    if (draftPoints.length < 3) return;

    onCreateWarning({
      ...warningForm,
      points: draftPoints,
      expiresAt: new Date(warningForm.expiresAt).toISOString()
    });
  };

  return (
    <div className="absolute left-4 top-4 z-[1000] flex w-[340px] max-w-[90vw] flex-col gap-3">
      <section className="panel p-4 shadow-glow">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-sky-300">Radar Controls</h2>
        <div className="space-y-3 text-sm">
          <div>
            <label className="mb-1 block text-xs text-slate-400">Layer</label>
            <select
              value={radarLayer}
              onChange={(e) => setRadarLayer(e.target.value as RadarLayer)}
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2"
            >
              {layerOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400">Opacity ({Math.round(radarOpacity * 100)}%)</label>
            <input
              type="range"
              min={0.1}
              max={1}
              step={0.05}
              value={radarOpacity}
              onChange={(e) => setRadarOpacity(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400">
              Time Scrubber ({new Date(activeFrame.timestamp).toLocaleTimeString()})
            </label>
            <input
              type="range"
              min={0}
              max={radarFrames.length - 1}
              value={timelineIndex}
              onChange={(e) => {
                setTimelineIndex(Number(e.target.value));
                setIsAnimating(false);
              }}
              className="w-full"
            />
            <button
              onClick={() => setIsAnimating(!isAnimating)}
              className="mt-2 w-full rounded-md border border-sky-500/40 bg-sky-500/10 px-3 py-2 text-xs font-semibold"
            >
              {isAnimating ? 'Pause Animation' : 'Play Animation'}
            </button>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              goToLocation(search);
            }}
          >
            <label className="mb-1 block text-xs text-slate-400">Location Search</label>
            <div className="flex gap-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2"
                placeholder="City, ST"
              />
              <button className="rounded-md bg-sky-600 px-3 py-2 text-xs font-semibold">Go</button>
            </div>
          </form>
        </div>
      </section>

      <section className="panel p-4">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-violet-300">Weather Models</h2>
        <div className="space-y-2 text-sm">
          <select
            value={model}
            onChange={(e) => setModel(e.target.value as 'gfs' | 'hrrr' | 'nam')}
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2"
          >
            <option value="gfs">GFS</option>
            <option value="hrrr">HRRR</option>
            <option value="nam">NAM</option>
          </select>
          <input
            type="range"
            min={0}
            max={48}
            step={1}
            value={modelHour}
            onChange={(e) => setModelHour(Number(e.target.value))}
            className="w-full"
          />
          <p className="text-xs text-slate-300">{modelOverlayText(model, modelHour)}</p>
        </div>
      </section>

      <section className="panel p-4">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-amber-300">Warning Status</h2>
        <p className="text-xs text-slate-200">Official warnings: {warningCounts.official}</p>
        <p className="text-xs text-pink-300">Kabeb warnings: {warningCounts.kabeb}</p>
      </section>

      {!isAdmin ? (
        <section className="panel p-4">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-pink-300">Admin Login</h2>
          <form onSubmit={submitLogin} className="space-y-2">
            <input
              required
              value={loginForm.username}
              onChange={(e) => setLoginForm((p) => ({ ...p, username: e.target.value }))}
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              placeholder="Username"
            />
            <input
              required
              type="password"
              value={loginForm.password}
              onChange={(e) => setLoginForm((p) => ({ ...p, password: e.target.value }))}
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              placeholder="Password"
            />
            <button className="w-full rounded-md bg-pink-600 px-3 py-2 text-xs font-semibold">Log in</button>
          </form>
        </section>
      ) : (
        <section className="panel p-4">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-pink-300">Kabeb Warnings</h2>
          <div className="mb-2 flex gap-2">
            <button
              className="rounded-md bg-pink-600 px-3 py-2 text-xs font-semibold"
              onClick={() => setDrawingMode(!drawingMode)}
            >
              {drawingMode ? 'Stop Drawing' : 'Draw Polygon'}
            </button>
            <button className="rounded-md border border-slate-700 px-3 py-2 text-xs" onClick={clearDraft}>
              Clear Points
            </button>
          </div>
          <p className="mb-2 text-xs text-slate-400">Points selected: {draftPoints.length} (minimum 3)</p>
          <form onSubmit={submitKabebWarning} className="space-y-2">
            <input
              required
              value={warningForm.title}
              onChange={(e) => setWarningForm((p) => ({ ...p, title: e.target.value }))}
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              placeholder="Warning title"
            />
            <textarea
              required
              value={warningForm.description}
              onChange={(e) => setWarningForm((p) => ({ ...p, description: e.target.value }))}
              className="h-20 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            />
            <select
              value={warningForm.severity}
              onChange={(e) =>
                setWarningForm((p) => ({ ...p, severity: e.target.value as 'low' | 'moderate' | 'high' | 'extreme' }))
              }
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            >
              <option value="low">Low</option>
              <option value="moderate">Moderate</option>
              <option value="high">High</option>
              <option value="extreme">Extreme</option>
            </select>
            <input
              type="datetime-local"
              value={warningForm.expiresAt}
              onChange={(e) => setWarningForm((p) => ({ ...p, expiresAt: e.target.value }))}
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            />
            <button className="w-full rounded-md bg-pink-700 px-3 py-2 text-xs font-semibold">Broadcast Kabeb Warning</button>
          </form>
        </section>
      )}
    </div>
  );
}
