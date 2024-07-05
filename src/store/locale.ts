import {applyMiddleware, logMiddleware, Middleware} from '@/utils/zustand';
import {persistMiddlewareCreator} from '@/utils/persist2Middleware';
import {StateCreator} from 'zustand';
import {SetStateAction, useActionByName} from '@/utils';

export enum Locale {
  EN = 'en',
  AR = 'ar'
}

const defaultLocale = Locale.EN;

export const RTLLocales = [Locale.AR];

interface Store {
  locale: Locale;
  setLocale: (locale: SetStateAction<Locale>) => void;
}

const store: StateCreator<Store> = (set) => ({
  locale: defaultLocale,
  setLocale: (locale: SetStateAction<Locale>) => set(useActionByName<Store, Locale>(locale, 'locale'))
});

export const useLocaleStore = applyMiddleware<Store>(store, [
  persistMiddlewareCreator({
    name: 'locale',
    syncDynamically: true
  }) as Middleware<Store>,
  logMiddleware<Store>()
]);
