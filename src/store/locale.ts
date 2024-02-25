import {applyMiddleware, logMiddleware, Middleware} from '@/utils/zustand';
import {persistMiddlewareCreator} from '@/utils/persist2Middleware';
import {StateCreator} from 'zustand';

export enum Locale {
  EN = 'en',
  AR = 'ar'
}

const defaultLocale = Locale.EN;

export const RTLLocales = [Locale.AR];

interface Store {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const store: StateCreator<Store> = (set) => ({
  locale: defaultLocale,
  setLocale: (locale: Locale) => set(() => ({locale}))
});

export const useLocaleStore = applyMiddleware<Store>(store, [
  persistMiddlewareCreator({
    name: 'locale',
    syncDynamically: true
  }) as Middleware<Store>,
  logMiddleware<Store>()
]);
