import {Middleware} from '@/utils/zustand';
import {MapStore} from '@/store/map';
import {changeMapStyle} from '@/middleware/cmd/mapStyles';

export const mapMiddleware: Middleware<MapStore> = (config) => (
  set,
  get,
  store
) => config(args => {
  const {
    style: styleOld,
    projection: projectionOld
  } = get();

  set(args);

  const {
    style,
    projection,
    map
  } = get();

  if (style !== styleOld) {
    changeMapStyle()
  }

  if (projection !== projectionOld) {
    map?.setProjection(projection);
  }

}, get, store);
