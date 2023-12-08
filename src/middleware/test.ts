import {Middleware} from '@/utils/zustand';
import {Test} from '@/store/test';
import {log} from '@/utils';

export const testMiddleware: Middleware<Test> = (config) => (
  set,
  get,
  store
) => config(args => {
  set(args);
  log('TODO: Add custom middleware logic here');
}, get, store);
