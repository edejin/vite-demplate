import {Middleware} from '@/utils/zustand';
import {Test} from '@/store/test';

export const testMiddleware: Middleware<Test> = (config) => (
  set,
  get,
  store
) => config(args => {
  set(args);
  console.log('TODO: Add custom middleware logic here');
}, get, store);
