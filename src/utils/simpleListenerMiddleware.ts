import {isDef, warn} from '@/utils/index';
import {Middleware} from '@/utils/zustand';

interface SimpleListenerDescriptor<T> {
  /**
   * Property name or list of properties names
   */
  key: (keyof T) | (keyof T)[];

  /**
   * Function to compare if property change
   * @param prev Previous value
   * @param next New value
   * @param keyName Name of property
   */
  compareFunction?: (prev: T, next: T, keyName: keyof T) => boolean;
  /**
   * Function to check if property defined
   * @param value Current value
   * @param keyName Name of property
   */
  isDefFunction?: (value: T, keyName: keyof T) => boolean;

  mount?: (value: T) => void;
  unmount?: (value: T) => void;
  change?: (prev: T, next: T, keyNames: (keyof T)[], mounted: boolean) => void;

  mounted?: boolean;
}

type TmpStore<T> = [(keyof T)[], (keyof T)[], (keyof T)[], (keyof T)[], (keyof T)[]];

const defaultCompareFunction = <T, >(prev: T, next: T, keyName: keyof T) => prev[keyName] !== next[keyName];
const defaultIsDefFunction = <T, >(value: T, keyName: keyof T) => isDef(value[keyName]);

export const addSimpleListeners = <T, >(listeners: SimpleListenerDescriptor<T>[]): Middleware<T> => {
  warn('addSimpleListeners: This is experimental function!!!!!!!!!!!!!');
  return (config) => (
    set,
    get,
    store
  ) => config(args => {
    const prev = get();
    set(args);
    const next = get();

    listeners.forEach((listener) => {
      const {
        key,
        compareFunction = defaultCompareFunction,
        isDefFunction = defaultIsDefFunction,
        mount,
        unmount,
        change: changeHandler
      } = listener;
      let {
        mounted = false
      } = listener;
      const k: (keyof T)[] = Array.isArray(key) ? key : [key];

      const [
        add,
        remove,
        exist,
        empty,
        change
      ] = k.reduce((a: TmpStore<T>, k: keyof T) => {
        const [add, remove, exist, empty, change] = a;
        const defPrev = isDefFunction(prev, k);
        const defNext = isDefFunction(next, k);
        if (!defPrev && defNext) {
          add.push(k);
        }
        if (defPrev && !defNext) {
          remove.push(k);
        }
        if (defPrev && defNext) {
          exist.push(k);
        }
        if (!defPrev && !defNext) {
          empty.push(k);
        }
        if (
          (!defPrev && defNext) ||
          (defPrev && !defNext) ||
          compareFunction(prev, next, k)
        ) {
          change.push(k);
        }
        return [add, remove, exist, empty, change] as TmpStore<T>;
      }, [[], [], [], [], []]);

      if (
        !mounted &&
        remove.length === 0 &&
        empty.length === 0 &&
        add.length > 0 &&
        (exist.length + add.length) === k.length &&
        mount
      ) {
        mounted = true;
        mount(next);
      }
      if (
        mounted &&
        add.length === 0 &&
        empty.length === 0 &&
        remove.length > 0 &&
        (exist.length + remove.length) === k.length &&
        unmount
      ) {
        mounted = false;
        unmount(prev);
      }
      if (change.length && changeHandler) {
        changeHandler(prev, next, change, mounted);
      }

      listener.mounted = mounted;
    });
  }, get, store);
};
