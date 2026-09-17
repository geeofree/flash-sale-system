import type { Express } from 'express';
import { SalesRouter } from "./sales.route.js";

export function Routes(app: Express) {
  app.use('/api/sales', SalesRouter);
}
