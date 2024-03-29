import {applyMiddleware} from '@/utils/zustand';
import {StateCreator} from 'zustand';

// Should be power of 2
export enum VisibilityTypes {
  None = 0,
  Begin = 1,
  End = 2,
  Both = 3
}

export interface RespData {
  alt: number;
  distance: number;
  visibility: VisibilityTypes;
  lat: number;
  lon: number;
}

export interface Measure {
  distanceValue?: number;
  setDistanceValue: (distanceValue?: number) => void;

  altData: RespData[];
  setAltData: (altData?: RespData[]) => void;

  areaValue?: number;
  setAreaValue: (areaValue?: number) => void;

  arcValue?: number[];
  setArcValue: (arcValue?: number[]) => void;

  observerPosition?: {
    lat: number;
    lon: number;
  }
  setObserverPosition: (observerPosition?: {
    lat: number;
    lon: number;
  }) => void;
}

const store: StateCreator<Measure> = (set, get) => ({
  setDistanceValue: (distanceValue?: number) => set({distanceValue}),
  altData: [],
  setAltData: (altData: RespData[] = []) => set({altData}),
  setAreaValue: (areaValue?: number) => set({areaValue}),
  setArcValue: (arcValue?: number[]) => set({arcValue}),
  setObserverPosition: (observerPosition?: {
    lat: number;
    lon: number;
  }) => set({observerPosition})
});

export const useMeasureStore = applyMiddleware<Measure>(store, []);
