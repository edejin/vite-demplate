import {useId, useRef} from 'react';
import {shallow} from 'zustand/shallow';

export const isDev = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export const log = (...args: any[]) => {
  if (isDev) {
    console.log(...args);
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
}

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export const isDef = (e: any): boolean => e != undefined;

type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

type Many<T> = T | readonly T[];

const pick = <S, >(state: S, path: Many<keyof S>) => ((Array.isArray(path) ? path : [path]) as S[]).reduce((res, path) => {
  res[path] = state[path];
  return res;
}, {});

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

export const downloadFile = (fileName: string, type: string, byte: any) => {
  const blob = new Blob([byte], {type});
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
