import {useId, useRef} from 'react';
import {shallow} from 'zustand/shallow';

export const isDev = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

export type SetStateAction<S> = S | ((prevState: S) => S);

export const isFunction = (f: any): boolean => typeof f === 'function';

export const useActionByName = <T, K>(newValue: SetStateAction<K>, name: keyof T) =>  (s: T) => ({[name]: isFunction(newValue) ? (newValue as (v: K) => K)(s[name] as K) : newValue})

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

export const isDef = (e: any): boolean => typeof e !== 'undefined' && e !== null;

type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

type Many<T> = T | readonly T[];

export const alwaysArray = <Y, >(args: Many<Y>): Y[] => Array.isArray(args) ? args : [<Y>args];

const deepPick = <S, >(state: S, path: string | string[]): Partial<S> => alwaysArray<string>(path).reduce((a: Partial<S>, keys) => {
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

const pick = <S, >(state: S, path: Many<keyof S>) => alwaysArray<keyof S>(path).reduce((res: S, path: keyof S) => {
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

export enum FileContentType {
  CSS = 'text/css',
  CSV = 'text/csv',
  HTML = 'text/html',
  JS = 'text/javascript',
  JSON = 'application/json',
  PNG = 'image/png',
  SVG = 'image/svg+xml',
  TXT = 'text/plain',
  ZIP = 'application/zip' // is the standard, but beware that Windows uploads .zip with MIME type `application/x-zip-compressed`.
}

/**
 * Download file from front-end.
 * If text file should support Arabic (e.g., `csv`, `txt`) than you should start it from '\ufeff' (to support UTF-8 with BOM)
 * @param fileName
 * @param type Content type
 * @param byte Typed array or string
 */
export const downloadFile = (fileName: string, type: FileContentType, byte: BlobPart) => {
  const blob = new Blob([byte], {type});
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
