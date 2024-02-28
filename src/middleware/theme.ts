import {Middleware} from '@/utils/zustand';
import {ThemeStore} from '@/store/theme';
import {changeMapStyle} from '@/middleware/cmd/mapStyles';

export const themeMiddleware: Middleware<ThemeStore> = (config) => (
  set,
  get,
  store
) => config(args => {
  const {
    theme: themeOld
  } = get();

  set(args);

  const {
    theme
  } = get();

  if (theme !== themeOld) {
    changeMapStyle()
  }

}, get, store);
