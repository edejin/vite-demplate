import {useId, useRef} from 'react';
import {shallow} from 'zustand/shallow';

export const isDev = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export const log = (...args: any[]) => {
  if (isDev) {
    console.log(...args);
  }
};

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export const warn = (...args: any[]) => {
  if (isDev) {
    console.warn(...args);
  }
};

export const sleep = (delay: number = 330): Promise<void> => new Promise((cb) => {
  setTimeout(cb, delay);
});

interface CancelablePromise<T> extends Promise<T> {
  cancel: (reason?: any) => void;
}

export const cancelableFetch = (input: RequestInfo | URL, init?: RequestInit): CancelablePromise<Response> => {
  const controller = new AbortController();

  const q = fetch(input, {
    ...(init ?? {}),
    signal: controller.signal
  }) as CancelablePromise<Response>;

  let finished = false;
  q.then(() => {
    finished = true;
  }, () => {
    finished = true;
  });

  q.cancel = (reason?: any) => {
    if (!finished) {
      controller.abort(reason);
      finished = true;
    }
  };

  return q;
};

export const useCustomId = (id?: string) => {
  return id ?? useId();
};

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export const isDef = (e: any): boolean => e != undefined;

type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

type Many<T> = T | readonly T[];

const deepPick = <S, >(state: S, path: string | string[]): Partial<S> => (
  Array.isArray(path) ? path : [path]
).reduce((a: Partial<S>, keys) => {
  let u: any = a;
  let y: any = state;

  keys.split('.').forEach((k) => {
    const e = y[k];

    if (Array.isArray(e)) {
      u[k] = [];
    } else if (e !== null && typeof e === 'object') {
      u[k] = {};
    } else {
      u[k] = e;
    }
    u = u[k];
    y = y[k];
  });

  return a;
}, {}) as Partial<S>;

const pick = <S, >(state: S, path: Many<keyof S>) => ((Array.isArray(path) ? path : [path]) as (keyof S)[]).reduce((res: S, path: keyof S) => {
  res[path] = state[path];
  return res;
}, {} as S);

export function useSelector<S extends object, P extends keyof S>(
  paths: Many<P>
): (state: S) => Pick<S, P> {
  const prev = useRef<Pick<S, P>>({} as Pick<S, P>);

  return (state: S) => {
    if (state) {
      const next = pick(state, paths);
      return shallow(prev.current, next) ? prev.current : (prev.current = next);
    }
    return prev.current;
  };
}

export function useDeepSelector<S extends object, P extends keyof S>(paths: string | string[]): (state: S) => Pick<S, P> {
  warn('useDeepSelector: This is experimental function!!!!!!!!!!!!!');
  const prev = useRef<Pick<S, P>>({} as Pick<S, P>);

  return (state: S) => {
    if (state) {
      const next = deepPick(state, paths) as Pick<S, P>;
      return shallow(prev.current, next) ? prev.current : (prev.current = next);
    }
    return prev.current;
  };
}

export const downloadFile = (fileName: string, type: string, byte: any) => {
  const blob = new Blob([byte], {type});
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
