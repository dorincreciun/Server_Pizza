import { Router } from 'express';
import { prisma } from '../../db/client.js';

export const productsRouter = Router();

/**
 * @swagger
 * tags:
 *   - name: Products
 *     description: Product endpoints
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     tags: [Products]
 *     summary: List products
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 12, maximum: 100 }
 *     responses:
 *       200:
 *         description: OK
 */
productsRouter.get('/', async (req, res, next) => {
  try {
    const q = (req.query.q as string | undefined)?.trim();
    const category = (req.query.category as string | undefined)?.trim();
    const page = Math.max(parseInt((req.query.page as string) || '1', 10) || 1, 1);
    const limitReq = Math.max(parseInt((req.query.limit as string) || '12', 10) || 12, 1);
    const limit = Math.min(limitReq, 100);
    const sort = (req.query.sort as string | undefined)?.trim();
    const skip = (page - 1) * limit;

    const where: any = { available: true };
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }
    if (category) {
      where.category = { OR: [ { slug: category }, { name: { contains: category, mode: 'insensitive' } } ] };
    }

    let orderBy: any[] = [{ popularityScore: 'desc' }, { createdAt: 'desc' }];
    if (sort) {
      if (sort === 'newest') orderBy = [{ createdAt: 'desc' }];
      else if (sort === 'price_asc') orderBy = [{ basePrice: 'asc' }];
      else if (sort === 'price_desc') orderBy = [{ basePrice: 'desc' }];
      else if (sort === 'rating_desc') orderBy = [{ popularityScore: 'desc' }];
      else {
        const err: any = new Error('Invalid sort');
        err.statusCode = 400;
        err.code = 'BAD_REQUEST';
        err.details = { sort: ['sort must be one of newest, price_asc, price_desc, rating_desc'] };
        throw err;
      }
    }

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          variants: { select: { id: true, size: true, dough: true, priceDelta: true } },
        },
        skip,
        take: limit,
      }),
    ]);

    const items = products.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      description: p.description || undefined,
      imageUrl: p.imageUrl && /^https?:\/\//i.test(p.imageUrl) ? p.imageUrl : (p.imageUrl ? p.imageUrl : undefined),
      basePrice: p.basePrice,
      rating: undefined,
      category: p.category,
      variants: p.variants.map((v) => ({ id: v.id, size: v.size, dough: v.dough, priceDelta: v.priceDelta })),
    }));

    const totalPages = Math.ceil(total / limit) || 1;
    res.json({ items, page, limit, total, totalPages });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/products/{slug}:
 *   get:
 *     tags: [Products]
 *     summary: Get product by slug
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: OK
 */
productsRouter.get('/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        ingredients: true,
        variants: true,
      },
    });
    if (!product || product.available === false) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ product });
  } catch (err) {
    next(err);
  }
});
