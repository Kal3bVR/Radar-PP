import type { Feature, MultiPolygon, Polygon } from 'geojson';

export type Severity = 'low' | 'moderate' | 'high' | 'extreme';

export type WarningType = 'tornado' | 'severe_thunderstorm' | 'flash_flood' | 'special_weather';

export interface OfficialWarning {
  id: string;
  type: WarningType;
  issuedAt: string;
  expiresAt: string;
  description: string;
  color: string;
  geometry: Feature<Polygon | MultiPolygon>;
}

export interface KabebWarning {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  expiresAt: string;
  createdAt: string;
  createdBy: string;
  geometry: Feature<Polygon>;
}

const now = Date.now();

export const officialWarnings: OfficialWarning[] = [
  {
    id: 'off-1',
    type: 'severe_thunderstorm',
    issuedAt: new Date(now - 20 * 60 * 1000).toISOString(),
    expiresAt: new Date(now + 40 * 60 * 1000).toISOString(),
    description: 'Quarter-size hail and 60 mph wind gusts are possible.',
    color: '#f59e0b',
    geometry: {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [[[-97.8, 35.4], [-97.2, 35.4], [-97.1, 35.8], [-97.7, 35.9], [-97.8, 35.4]]]
      }
    }
  },
  {
    id: 'off-2',
    type: 'flash_flood',
    issuedAt: new Date(now - 10 * 60 * 1000).toISOString(),
    expiresAt: new Date(now + 80 * 60 * 1000).toISOString(),
    description: 'Flooding caused by excessive rainfall is expected in low-lying areas.',
    color: '#22c55e',
    geometry: {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [[[-96.95, 32.6], [-96.4, 32.6], [-96.35, 33.0], [-96.85, 33.1], [-96.95, 32.6]]]
      }
    }
  }
];

let kabebWarnings: KabebWarning[] = [];

export const getKabebWarnings = (): KabebWarning[] => kabebWarnings;

export const addKabebWarning = (warning: KabebWarning): KabebWarning => {
  kabebWarnings = [warning, ...kabebWarnings];
  return warning;
};
