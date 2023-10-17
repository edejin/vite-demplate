import {applyMiddleware, logMiddleware, Middleware} from '@/utils/zustand';
import {persistMiddlewareCreator} from '@/utils/persist2Middleware';
import {StateCreator} from 'zustand';

export enum Theme {
  Light = 'light',
  Dark = 'dark'
}

interface Store {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const defaultTheme = Theme.Light;

const store: StateCreator<Store> = (set) => ({
  theme: defaultTheme,
  setTheme: (theme: Theme) => set(() => ({theme}))
});

export const useThemeStore = applyMiddleware<Store>(store, [
  persistMiddlewareCreator({
    name: 'theme',
    syncDynamically: true
  }) as Middleware<Store>,
  logMiddleware
]);
