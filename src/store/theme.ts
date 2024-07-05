import {applyMiddleware, logMiddleware, Middleware} from '@/utils/zustand';
import {persistMiddlewareCreator} from '@/utils/persist2Middleware';
import {StateCreator} from 'zustand';
import {themeMiddleware} from '@/middleware/theme';
import {SetStateAction, useActionByName} from '@/utils';

export enum Theme {
  Light = 'light',
  Dark = 'dark'
}

export interface ThemeStore {
  theme: Theme;
  setTheme: (theme: SetStateAction<Theme>) => void;
}

const defaultTheme = Theme.Light;

const store: StateCreator<ThemeStore> = (set) => ({
  theme: defaultTheme,
  setTheme: (theme: SetStateAction<Theme>) => set(useActionByName<ThemeStore, Theme>(theme, 'theme'))
});

export const useThemeStore = applyMiddleware<ThemeStore>(store, [
  persistMiddlewareCreator({
    name: 'theme',
    syncDynamically: true
  }) as Middleware<ThemeStore>,
  logMiddleware<ThemeStore>(),
  themeMiddleware
]);
