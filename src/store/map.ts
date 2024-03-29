import {applyMiddleware, Middleware} from '@/utils/zustand';
import {Map} from 'mapbox-gl';
import {mapMiddleware} from '@/middleware/map';
import {StateCreator} from 'zustand';
import {persistMiddlewareCreator} from '@/utils/persist2Middleware';

export enum MapStyles {
  Satellite,
  Vector
}

export enum Projections {
  Globe = 'globe',
  Mercator = 'mercator'
}

export interface MapStore {
  map?: Map;
  setMap: (map?: Map) => void;
  style: MapStyles;
  setStyle: (style: MapStyles) => void;
  projection: Projections;
  setProjection: (projection: Projections) => void;
  showGrid: boolean;
  setShowGrid: (showGrid: boolean) => void;
}

const store: StateCreator<MapStore> = (set/*, get*/) => ({
  setMap: (map?: Map) => set(() => ({map})),
  style: MapStyles.Vector,
  setStyle: (style: MapStyles) => set({style}),
  projection: Projections.Mercator,
  setProjection: (projection: Projections) => set({projection}),
  showGrid: false,
  setShowGrid: (showGrid: boolean) => set({showGrid})
});

export const useMapStore = applyMiddleware<MapStore>(store, [
  persistMiddlewareCreator<MapStore>({
    name: 'map',
    syncDynamically: true,
    partialize: ({style, projection, showGrid}) => ({style, projection, showGrid} as MapStore)
  }) as Middleware<MapStore>,
  mapMiddleware
]);
