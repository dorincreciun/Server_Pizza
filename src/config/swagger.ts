import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Request, Response } from 'express';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Pizza Shop API',
      version: '1.0.0',
      description: 'API for pizza shop: auth, catalog, products, cart, orders, recommendations',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Auth' },
      { name: 'Users' },
      { name: 'Catalog' },
      { name: 'Products' },
      { name: 'Cart' },
      { name: 'Orders' },
      { name: 'Recommendations' },
      { name: 'Health' },
    ],
  },
  apis: ['src/**/*.routes.ts'],
};

const swaggerSpec = swaggerJSDoc(options);

export const swaggerMiddleware = {
  ui: [swaggerUi.serve, swaggerUi.setup(swaggerSpec)],
  json: (_req: Request, res: Response) => res.json(swaggerSpec),
};
