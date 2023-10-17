export const isDev = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export const log = (...args: any[]) => {
  if (isDev) {
    console.log(...args);
  }
};

export const sleep = (delay: number = 330): Promise<void> => new Promise((cb) => {
  setTimeout(cb, delay);
})
