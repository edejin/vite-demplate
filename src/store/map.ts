import {applyMiddleware} from '@/utils/zustand';
import {Map} from 'maplibre-gl';
import {mapMiddleware} from '@/middleware/map';
import {StateCreator} from 'zustand';

export interface MapStore {
  map?: Map;
  setMap: (map?: Map) => void;
}

const store: StateCreator<MapStore> = (set/*, get*/) => ({
  setMap: (map?: Map) => set(() => ({map})),
});

export const useMapStore = applyMiddleware<MapStore>(store, [
  mapMiddleware
]);
