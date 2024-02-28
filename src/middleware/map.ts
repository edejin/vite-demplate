import {Middleware} from '@/utils/zustand';
import {MapStore} from '@/store/map';
import {changeMapStyle} from '@/middleware/cmd/mapStyles';

export const mapMiddleware: Middleware<MapStore> = (config) => (
  set,
  get,
  store
) => config(args => {
  const {
    style: styleOld
  } = get();

  set(args);

  const {
    style
  } = get();

  if (style !== styleOld) {
    changeMapStyle()
  }

}, get, store);
