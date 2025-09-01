import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { createApp } from './app.js';

const app = createApp();

const port = env.PORT;
app.listen(port, () => {
  logger.info({ msg: `Server listening on http://localhost:${port}` });
});
