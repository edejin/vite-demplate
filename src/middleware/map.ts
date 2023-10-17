import {Middleware} from '@/utils/zustand';
import {MapStore} from '@/store/map';

export const mapMiddleware: Middleware<MapStore> = (config) => (
  set,
  get,
  store
) => config(args => {
  const {
    map: prevMap
  } = get();

  set(args);

  const {
    map,
  } = get();

  if (!prevMap && map) {
    // Map created
  }

}, get, store);
