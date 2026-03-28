import type { Feature, Polygon, MultiPolygon } from 'geojson';

export type RadarLayer = 'reflectivity' | 'velocity' | 'cc' | 'srv';

export type ModelType = 'gfs' | 'hrrr' | 'nam';

export interface RadarFrame {
  id: string;
  timestamp: string;
  opacity: number;
}

export interface OfficialWarning {
  id: string;
  type: 'tornado' | 'severe_thunderstorm' | 'flash_flood' | 'special_weather';
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
  severity: 'low' | 'moderate' | 'high' | 'extreme';
  expiresAt: string;
  createdAt: string;
  createdBy: string;
  geometry: Feature<Polygon>;
}
