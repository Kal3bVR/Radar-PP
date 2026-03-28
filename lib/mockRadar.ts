import type { LatLngTuple } from 'leaflet';
import type { ModelType, RadarFrame, RadarLayer } from '@/types';

const random = (min: number, max: number) => Math.random() * (max - min) + min;

const layers: Record<RadarLayer, string> = {
  reflectivity: '#22d3ee',
  velocity: '#f97316',
  cc: '#e879f9',
  srv: '#ef4444'
};

export const radarLayerColors = layers;

export const generateRadarFrames = (count = 18): RadarFrame[] => {
  const now = Date.now();
  return Array.from({ length: count }).map((_, i) => ({
    id: `frame-${i}`,
    timestamp: new Date(now - (count - i - 1) * 2 * 60 * 1000).toISOString(),
    opacity: random(0.3, 0.85)
  }));
};

export interface Cell {
  center: LatLngTuple;
  radius: number;
  value: number;
}

export const generateRadarCells = (seed = 7): Cell[] => {
  const base: LatLngTuple[] = [
    [35.6, -97.4],
    [33.0, -96.7],
    [39.2, -94.8],
    [41.1, -93.6],
    [29.8, -95.3]
  ];

  return base.map((c, idx) => ({
    center: [c[0] + Math.sin(seed + idx) * 0.2, c[1] + Math.cos(seed + idx) * 0.2],
    radius: random(20000, 65000),
    value: random(25, 80)
  }));
};

export const modelOverlayText = (model: ModelType, hour: number): string => {
  if (model === 'hrrr') return `HRRR high-resolution forecast +${hour}h`;
  if (model === 'nam') return `NAM mesoscale run +${hour}h`;
  return `GFS synoptic guidance +${hour}h`;
};
