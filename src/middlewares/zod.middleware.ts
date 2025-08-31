import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';

export const validateBody = (schema: ZodSchema<any>) =>
  (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const err: any = new Error('Validation error');
      err.statusCode = 400;
      err.details = result.error.flatten();
      return next(err);
    }
    req.body = result.data;
    next();
  };

export const validateQuery = (schema: ZodSchema<any>) =>
  (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const err: any = new Error('Validation error');
      err.statusCode = 400;
      err.details = result.error.flatten();
      return next(err);
    }
    req.query = result.data as any;
    next();
  };

export const validateParams = (schema: ZodSchema<any>) =>
  (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      const err: any = new Error('Validation error');
      err.statusCode = 400;
      err.details = result.error.flatten();
      return next(err);
    }
    req.params = result.data as any;
    next();
  };
