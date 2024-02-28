import {applyMiddleware, Middleware} from '@/utils/zustand';
import {Map} from 'mapbox-gl';
import {mapMiddleware} from '@/middleware/map';
import {StateCreator} from 'zustand';
import {persistMiddlewareCreator} from '@/utils/persist2Middleware';

export enum MapStyles {
  Satellite,
  Vector
}

export interface MapStore {
  map?: Map;
  setMap: (map?: Map) => void;
  style: MapStyles;
  setStyle: (style: MapStyles) => void;
}

const store: StateCreator<MapStore> = (set/*, get*/) => ({
  setMap: (map?: Map) => set(() => ({map})),
  style: MapStyles.Vector,
  setStyle: (style: MapStyles) => set({style})
});

export const useMapStore = applyMiddleware<MapStore>(store, [
  persistMiddlewareCreator({
    name: 'map',
    syncDynamically: true,
    partialize: ({style}) => ({style})
  }) as Middleware<MapStore>,
  mapMiddleware
]);
