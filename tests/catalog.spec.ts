import request from 'supertest';
import { createApp } from '../src/app/app.js';

describe('Catalog endpoints', () => {
  const app = createApp();

  it('GET /api/categories should list categories', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      { id: 1, name: 'Pizza', slug: 'pizza' },
      { id: 2, name: 'Paste', slug: 'paste' },
    ]);
  });

  it('GET /api/ingredients should list ingredients', async () => {
    const res = await request(app).get('/api/ingredients');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      { id: 1, name: 'Mozzarella', slug: 'mozzarella', priceDelta: 3 },
      { id: 2, name: 'Busuioc', slug: 'busuioc', priceDelta: 0 },
    ]);
  });

  it('GET /api/products should list products with pagination defaults', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBeGreaterThan(0);
    expect(res.body.total).toBe(2);
    expect(res.body.items.length).toBeGreaterThan(0);
    expect(res.body.items[0]).toMatchObject({
      slug: 'margherita',
      name: 'Margherita',
      category: { id: 1, name: 'Pizza', slug: 'pizza' },
    });
  });

  it('GET /api/products?sort=price_asc should pass', async () => {
    const res = await request(app).get('/api/products?sort=price_asc');
    expect(res.status).toBe(200);
  });

  it('GET /api/products?sort=invalid should return 400 with structured error', async () => {
    const res = await request(app).get('/api/products?sort=unknown');
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe('BAD_REQUEST');
    expect(res.body.error.details).toBeDefined();
  });

  it('GET /api/products/:slug should return a product', async () => {
    const res = await request(app).get('/api/products/margherita');
    expect(res.status).toBe(200);
    expect(res.body.product).toBeDefined();
    expect(res.body.product.slug).toBe('margherita');
  });

  it('GET /api/products/:slug should return 404 for absent or unavailable', async () => {
    const res1 = await request(app).get('/api/products/unknown');
    expect(res1.status).toBe(404);
    const res2 = await request(app).get('/api/products/hidden');
    expect(res2.status).toBe(404);
  });
});
