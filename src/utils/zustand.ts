import {create, StateCreator} from 'zustand';
import {log} from '@/utils/index';

// eslint-disable-next-line  @typescript-eslint/ban-types
export type Middleware<T extends {}> = (
  config: StateCreator<T>,
) => StateCreator<T>;

// eslint-disable-next-line  @typescript-eslint/ban-types
export const applyMiddleware = <T extends {}>(s: StateCreator<T>, middlewares: Middleware<T>[]) => create<T>(
  middlewares.reduce((a, m) => m(a), s)
);

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export const logMiddleware: Middleware<any> = (config) => (
  set,
  get,
  store
) => config(args => {
  log('  applying', args);
  set(args);
  log('  new state', get());
}, get, store);
