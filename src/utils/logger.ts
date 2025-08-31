import morgan from 'morgan';

export const requestLogger = morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev');

export const logger = {
  info: (obj: unknown) => {
    if (process.env.NODE_ENV === 'production') {
      // Minimal JSON logger
      // eslint-disable-next-line no-console
      console.log(JSON.stringify({ level: 'info', ...((obj as any) || {}) }));
    } else {
      // eslint-disable-next-line no-console
      console.log(obj);
    }
  },
  error: (obj: unknown) => {
    if (process.env.NODE_ENV === 'production') {
      // eslint-disable-next-line no-console
      console.error(JSON.stringify({ level: 'error', ...((obj as any) || {}) }));
    } else {
      // eslint-disable-next-line no-console
      console.error(obj);
    }
  },
};
