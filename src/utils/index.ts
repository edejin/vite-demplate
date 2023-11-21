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
  });

  q.cancel = (reason?: any) => {
    if (!finished) {
      controller.abort(reason);
      finished = true;
    }
  };

  return q;
};
