import { create } from 'zustand';
import { generateRadarFrames } from './mockRadar';
import type { KabebWarning, ModelType, OfficialWarning, RadarLayer } from '@/types';

interface RadarState {
  radarLayer: RadarLayer;
  radarOpacity: number;
  timelineIndex: number;
  isAnimating: boolean;
  model: ModelType;
  modelHour: number;
  officialWarnings: OfficialWarning[];
  kabebWarnings: KabebWarning[];
  setRadarLayer: (layer: RadarLayer) => void;
  setRadarOpacity: (opacity: number) => void;
  setTimelineIndex: (index: number) => void;
  setIsAnimating: (animating: boolean) => void;
  setModel: (model: ModelType) => void;
  setModelHour: (hour: number) => void;
  setOfficialWarnings: (warnings: OfficialWarning[]) => void;
  setKabebWarnings: (warnings: KabebWarning[]) => void;
  prependKabebWarning: (warning: KabebWarning) => void;
  radarFrames: ReturnType<typeof generateRadarFrames>;
}

export const useRadarStore = create<RadarState>((set) => ({
  radarLayer: 'reflectivity',
  radarOpacity: 0.7,
  timelineIndex: 0,
  isAnimating: true,
  model: 'hrrr',
  modelHour: 1,
  officialWarnings: [],
  kabebWarnings: [],
  radarFrames: generateRadarFrames(),
  setRadarLayer: (radarLayer) => set({ radarLayer }),
  setRadarOpacity: (radarOpacity) => set({ radarOpacity }),
  setTimelineIndex: (timelineIndex) => set({ timelineIndex }),
  setIsAnimating: (isAnimating) => set({ isAnimating }),
  setModel: (model) => set({ model }),
  setModelHour: (modelHour) => set({ modelHour }),
  setOfficialWarnings: (officialWarnings) => set({ officialWarnings }),
  setKabebWarnings: (kabebWarnings) => set({ kabebWarnings }),
  prependKabebWarning: (warning) => set((state) => ({ kabebWarnings: [warning, ...state.kabebWarnings] }))
}));
