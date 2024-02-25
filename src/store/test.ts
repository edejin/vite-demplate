import {applyMiddleware, logMiddleware} from '@/utils/zustand';
import {sleep} from '@/utils';
import {testMiddleware} from '@/middleware/test';
import {StateCreator} from 'zustand';
import {addSimpleListeners} from '@/utils/simpleListenerMiddleware';

export interface Test {
  a: number;
  b: number;
  addA: () => void;
  addAWithDelay: (d: number) => void;
  removeA: () => void;
  addB: () => void;
  clearB: () => void;
}

const store: StateCreator<Test> = (set, get) => ({
  a: 0,
  b: 0,
  addA: () => set(state => ({a: state.a + 1})),
  removeA: () => set(state => ({a: state.a - 1})),
  addB: () => set(state => ({b: state.b + 1})),
  clearB: () => set({b: 0}),
  addAWithDelay: async (d: number) => {
    // It can be fetch
    await sleep(d);
    // `get()` return current value
    set({a: get().a + 1});
  }
});

export const useTestStore = applyMiddleware<Test>(store, [
  logMiddleware<Test>(),
  addSimpleListeners<Test>([
    {
      key: ['a', 'b'],
      compareFunction: (prev, next, key): boolean => {
        switch (key) {
          // We can have different check function for different variables
          case 'a':
            return prev.a !== next.a;
          default:
            return prev[key] !== next[key];
        }
      },
      isDefFunction: (v, key): boolean => {
        switch (key) {
          // We can have different check function for different variables
          case 'a':
            return v.a > 1;
          case 'b':
            return v.b > 0;
          default:
            return !!v[key];
        }
      },
      mount: () => {
        console.log(`mounted`)
      },
      unmount: () => {
        console.log(`unmounted`)
      },
      change: () => {
        console.log(`changed`)
      }
    }
  ]),
  testMiddleware
]);
