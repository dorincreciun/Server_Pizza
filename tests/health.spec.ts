import request from 'supertest';
import { createApp } from '../src/app/app.js';

describe('Health endpoint', () => {
  const app = createApp();

  it('GET /health should return status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});
