export const prisma = {
  category: {
    findMany: async () => [
      { id: 1, name: 'Pizza', slug: 'pizza' },
      { id: 2, name: 'Paste', slug: 'paste' },
    ],
  },
  ingredient: {
    findMany: async () => [
      { id: 1, name: 'Mozzarella', slug: 'mozzarella', priceDelta: 3 },
      { id: 2, name: 'Busuioc', slug: 'busuioc', priceDelta: 0 },
    ],
  },
  product: {
    count: async () => 2,
    findMany: async (_args: any) => [
      {
        id: 10,
        slug: 'margherita',
        name: 'Margherita',
        description: 'Clasica',
        imageUrl: '/img/margherita.jpg',
        basePrice: 20,
        popularityScore: 100,
        createdAt: new Date(),
        category: { id: 1, name: 'Pizza', slug: 'pizza' },
        variants: [
          { id: 101, size: 'mica', dough: 'traditional', priceDelta: 0 },
          { id: 102, size: 'medie', dough: 'traditional', priceDelta: 5 },
        ],
      },
    ],
    findUnique: async (args: any) => {
      if (args.where.slug === 'margherita') {
        return {
          id: 10,
          slug: 'margherita',
          name: 'Margherita',
          description: 'Clasica',
          basePrice: 20,
          available: true,
          category: { id: 1, name: 'Pizza', slug: 'pizza' },
          ingredients: [],
          variants: [],
        };
      }
      if (args.where.slug === 'hidden') {
        return { id: 99, slug: 'hidden', name: 'Hidden', description: '', basePrice: 1, available: false, category: { id:1, name:'Pizza', slug:'pizza' }, ingredients: [], variants: [] };
      }
      return null;
    },
  },
} as any;
