import type { Express } from 'express';
import { SalesRouter } from "./sales.route.js";
import { ProductsRouter } from './products.route.js';
import { AuthRouter } from './auth.route.js';

export function Routes(app: Express) {
  app.use('/api/sales', SalesRouter);
  app.use('/api/products', ProductsRouter);
  app.use('/api/auth', AuthRouter);
}
