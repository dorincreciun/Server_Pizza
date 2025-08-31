import { prisma } from './client.js';
import bcrypt from 'bcryptjs';
import fs from 'node:fs';
import path from 'node:path';

async function main() {
  // Categories
  const categories = [
    { name: 'Clasice', slug: 'clasice' },
    { name: 'Picante', slug: 'picante' },
    { name: 'Veggie', slug: 'veggie' },
    { name: 'Cu pui', slug: 'cu-pui' },
    { name: 'Dulci', slug: 'dulci' },
    { name: 'Premium', slug: 'premium' },
    { name: 'Speciale', slug: 'speciale' },
  ];
  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
  }

  // Ingredients
  const ingredients = [
    ['Mozzarella', 'mozzarella', 0],
    ['Sos roșii', 'sos-rosii', 0],
    ['Pepperoni', 'pepperoni', 4],
    ['Ardei', 'ardei', 2],
    ['Măsline', 'masline', 2],
    ['Ciuperci', 'ciuperci', 3],
    ['Porumb', 'porumb', 2],
    ['Pui', 'pui', 5],
    ['Șuncă', 'sunca', 4],
    ['Ananas', 'ananas', 3],
    ['Ceapă', 'ceapa', 1.5],
    ['Jalapeño', 'jalapeno', 3],
    ['Parmezan', 'parmezan', 4],
    ['Busuioc', 'busuioc', 1],
  ] as const;
  for (const [name, slug, priceDelta] of ingredients) {
    await prisma.ingredient.upsert({
      where: { slug },
      update: {},
      create: { name, slug, priceDelta },
    });
  }

  const allIngr = await prisma.ingredient.findMany();
  const moz = allIngr.find((i: { slug: string }) => i.slug === 'mozzarella')!;
  const sos = allIngr.find((i: { slug: string }) => i.slug === 'sos-rosii')!;
  const pepperoni = allIngr.find((i: { slug: string }) => i.slug === 'pepperoni')!;
  const pui = allIngr.find((i: { slug: string }) => i.slug === 'pui')!;
  const veggieIds = allIngr
      .filter((i: { slug: string }) => ['ardei','masline','ciuperci','porumb','ceapa','busuioc'].includes(i.slug))
      .map((i: { id: number }) => i.id);

  const catClasice = await prisma.category.findUniqueOrThrow({ where: { slug: 'clasice' } });
  const catPicante = await prisma.category.findUniqueOrThrow({ where: { slug: 'picante' } });
  const catVeggie = await prisma.category.findUniqueOrThrow({ where: { slug: 'veggie' } });
  const catPui = await prisma.category.findUniqueOrThrow({ where: { slug: 'cu-pui' } });
  const catDulci = await prisma.category.findUniqueOrThrow({ where: { slug: 'dulci' } });
  const catPremium = await prisma.category.findUniqueOrThrow({ where: { slug: 'premium' } });

  // Images pool from local img directory
  const imgDir = path.resolve(process.cwd(), 'img');
  const imageFiles = fs.existsSync(imgDir)
    ? fs.readdirSync(imgDir).filter((f) => f.toLowerCase().endsWith('.png') || f.toLowerCase().endsWith('.jpg') || f.toLowerCase().endsWith('.jpeg'))
    : [];

  // Fix existing imageUrl values that might have been stored with backslashes or missing leading slash
  const toFix = await prisma.product.findMany({ where: { imageUrl: { not: null } }, select: { id: true, imageUrl: true } });
  for (const p of toFix) {
    const current = (p.imageUrl as string);
    let norm = current.replace(/\\/g, '/');
    // If it's an absolute URL, leave it as is
    if (/^https?:\/\//i.test(norm)) {
      continue;
    }
    // Ensure leading slash
    if (!norm.startsWith('/')) norm = '/' + norm;
    // If it was 'img/...' make it '/img/...'
    if (norm.startsWith('/img/') === false) {
      if (norm.startsWith('/img')) {
        // e.g., '/img\\file.png' already handled by backslash replacement
        norm = norm.replace('/img', '/img');
      } else if (norm.includes('/img/')) {
        norm = norm.slice(norm.indexOf('/img/'));
      }
    }
    if (norm !== current) {
      await prisma.product.update({ where: { id: p.id }, data: { imageUrl: norm } });
    }
  }

  // Helper to create product
  async function createProduct(opts: {
    name: string;
    slug: string;
    description: string;
    basePrice: number;
    isConfigurable: boolean;
    categoryId: number;
    ingredientSlugs: string[];
    popularityScore?: number;
    variants?: { size: 'mica' | 'medie' | 'mare'; dough: 'subtire' | 'traditional'; priceDelta: number }[];
    imageIndexHint?: number;
  }) {
    const ingrs = await prisma.ingredient.findMany({ where: { slug: { in: opts.ingredientSlugs } } });
    const imageUrl = imageFiles.length
      ? ('/img/' + imageFiles[(opts.imageIndexHint ?? Math.floor(Math.random() * imageFiles.length)) % imageFiles.length])
      : null;
    const created = await prisma.product.upsert({
      where: { slug: opts.slug },
      update: {},
      create: {
        name: opts.name,
        slug: opts.slug,
        description: opts.description,
        basePrice: opts.basePrice,
        isConfigurable: opts.isConfigurable,
        categoryId: opts.categoryId,
        popularityScore: opts.popularityScore ?? Math.floor(Math.random() * 100),
        ...(imageUrl ? { imageUrl } : {}),
        ingredients: { connect: ingrs.map((i: { id: number }) => ({ id: i.id })) },
      },
    });
    if (opts.isConfigurable && opts.variants && opts.variants.length) {
      for (const v of opts.variants) {
        await prisma.productVariant.upsert({
          where: { productId_size_dough: { productId: created.id, size: v.size, dough: v.dough } },
          update: { priceDelta: v.priceDelta },
          create: { productId: created.id, size: v.size, dough: v.dough, priceDelta: v.priceDelta },
        });
      }
    }
    return created;
  }

  // Generate a large catalog of pizzas (500+)
  const baseRecipes = [
    { name: 'Margherita', baseSlug: 'margherita', description: 'Clasică cu sos și mozzarella', basePrice: 20, cat: catClasice.id, ings: ['sos-rosii','mozzarella'] },
    { name: 'Pepperoni', baseSlug: 'pepperoni', description: 'Pepperoni și mozzarella', basePrice: 28, cat: catPicante.id, ings: ['sos-rosii','mozzarella','pepperoni'] },
    { name: 'Veggie Mix', baseSlug: 'veggie-mix', description: 'Legume proaspete', basePrice: 26, cat: catVeggie.id, ings: ['sos-rosii','mozzarella','ardei','masline','ciuperci','porumb','ceapa','busuioc'] },
    { name: 'Chicken Deluxe', baseSlug: 'chicken-deluxe', description: 'Pui și legume', basePrice: 25, cat: catPui.id, ings: ['sos-rosii','mozzarella','pui','ardei','ciuperci'] },
    { name: 'Hawaiian', baseSlug: 'hawaiian', description: 'Șuncă și ananas', basePrice: 27, cat: catClasice.id, ings: ['sos-rosii','mozzarella','ananas','sunca'] },
    { name: 'Spicy Inferno', baseSlug: 'spicy-inferno', description: 'Jalapeño și pepperoni', basePrice: 29, cat: catPicante.id, ings: ['sos-rosii','mozzarella','jalapeno','pepperoni'] },
    { name: 'Formaggi', baseSlug: 'formaggi', description: 'Brânzeturi variate', basePrice: 30, cat: catPremium.id, ings: ['mozzarella','parmezan'] },
  ];

  const variantMatrix: { size: 'mica' | 'medie' | 'mare'; dough: 'subtire' | 'traditional'; priceDelta: number }[] = [
    { size: 'mica', dough: 'subtire', priceDelta: 0 },
    { size: 'medie', dough: 'subtire', priceDelta: 6 },
    { size: 'mare', dough: 'subtire', priceDelta: 12 },
    { size: 'mica', dough: 'traditional', priceDelta: 2 },
    { size: 'medie', dough: 'traditional', priceDelta: 8 },
    { size: 'mare', dough: 'traditional', priceDelta: 14 },
  ];

  // We will create ~520 products: 7 bases * ~75 variants (by ingredient twists, spicy flags implicit via jalapeno, etc.)
  let createdCount = 0;
  for (let i = 0; i < 80; i++) {
    for (const base of baseRecipes) {
      const extraPool = allIngr
        .filter((ing: { slug: string }) => !base.ings.includes(ing.slug))
        .map((x: { slug: string }) => x.slug);
      // deterministically pick 0-3 extras
      const extras: string[] = [];
      const extraCount = (i % 4); // 0..3 extras
      for (let j = 0; j < extraCount && j < extraPool.length; j++) {
        const idx = (i * 7 + j * 3) % extraPool.length;
        extras.push(extraPool[idx]);
      }
      const ingredientSlugs = Array.from(new Set([...base.ings, ...extras]));
      const slug = `${base.baseSlug}-${i+1}`;
      await createProduct({
        name: `${base.name} #${i+1}`,
        slug,
        description: base.description,
        basePrice: base.basePrice + (i % 5),
        isConfigurable: true,
        categoryId: base.cat,
        ingredientSlugs,
        variants: variantMatrix,
        popularityScore: Math.floor(((i % 10) + 1) * 7 + Math.random() * 10),
      });
      createdCount++;
    }
  }

  // Also add a few non-configurable specials to cover simple type
  const simpleSpecials = [
    { name: 'Bianca', slug: 'bianca', description: 'Fără sos roșu, brânzeturi și ierburi', basePrice: 24, cat: catPremium.id, ings: ['mozzarella','parmezan','busuioc'] },
    { name: 'Rustica', slug: 'rustica', description: 'Legume rustice coapte', basePrice: 23, cat: catVeggie.id, ings: ['sos-rosii','mozzarella','ciuperci','ardei','ceapa'] },
  ];
  for (const s of simpleSpecials) {
    await createProduct({
      name: s.name,
      slug: s.slug,
      description: s.description,
      basePrice: s.basePrice,
      isConfigurable: false,
      categoryId: s.cat,
      ingredientSlugs: s.ings,
      popularityScore: Math.floor(Math.random() * 100),
    });
    createdCount++;
  }

  // eslint-disable-next-line no-console
  console.log(`Created or ensured ~${createdCount} products`);

  // Users
  const saltRounds = 12;
  const pass1 = await bcrypt.hash('password123', saltRounds);
  const pass2 = await bcrypt.hash('password123', saltRounds);
  const verifiedUser = await prisma.user.upsert({
    where: { email: 'verified@pizza.local' },
    update: {},
    create: { email: 'verified@pizza.local', passwordHash: pass1, name: 'Verified User', emailVerifiedAt: new Date(), role: 'user' },
  });
  await prisma.cart.upsert({ where: { userId: verifiedUser.id }, update: {}, create: { userId: verifiedUser.id } });

  await prisma.user.upsert({
    where: { email: 'unverified@pizza.local' },
    update: {},
    create: { email: 'unverified@pizza.local', passwordHash: pass2, name: 'Unverified User', role: 'user' },
  });

  // Example order
  const productPep = await prisma.product.findUnique({ where: { slug: 'pepperoni-pizza' } });
  if (productPep) {
    const order = await prisma.order.create({
      data: {
        userId: verifiedUser.id,
        status: 'platit',
        subtotal: productPep.basePrice,
        taxes: Math.round(productPep.basePrice * 0.08 * 100) / 100,
        deliveryFee: 0,
        total: Math.round(productPep.basePrice * 1.08 * 100) / 100,
        deliveryAddress: 'Str. Exemplu 1',
        deliveryEta: new Date(Date.now() + 45 * 60000),
      },
    });
    await prisma.orderItem.create({
      data: {
        orderId: order.id,
        productId: productPep.id,
        quantity: 1,
        snapshotName: productPep.name,
        snapshotConfig: { size: null, dough: null, customIngredients: [] },
        unitPrice: productPep.basePrice,
        lineTotal: productPep.basePrice,
      },
    });
  }

  // Purchase stats example
  const allProducts = await prisma.product.findMany({ take: 5 });
  for (const p of allProducts) {
    const existing = await prisma.purchaseStat.findFirst({ where: { productId: p.id, userId: null } });
    const inc = Math.floor(Math.random() * 10) + 1;
    if (existing) {
      await prisma.purchaseStat.update({ where: { id: existing.id }, data: { count: { increment: inc } } });
    } else {
      await prisma.purchaseStat.create({ data: { productId: p.id, userId: null, count: inc } });
    }
  }

  // Done
  // eslint-disable-next-line no-console
  console.log('Seed completed');
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
