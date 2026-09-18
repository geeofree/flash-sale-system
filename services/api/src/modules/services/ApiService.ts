import { injectable } from "inversify";
import { default as express } from 'express';
import type { Express } from 'express';
import { SalesRouter } from "../routers/SalesRouter.js";
import { ProductsRouter } from "../routers/ProductsRouter.js";
import { AuthRouter } from "../routers/AuthRouter.js";

@injectable()
export class ApiService {
  private app: Express;

  constructor() {
    this.app = express();
    this.registerRoutes();
  }

  start() {
    const PORT = process.env['PORT'] || 3000;
    this.app.listen(PORT, () => {
      console.log(`API service running in localhost:${PORT}`);
    })
  }

  private registerRoutes() {
    this.app.use('/api/sales', SalesRouter);
    this.app.use('/api/products', ProductsRouter);
    this.app.use('/api/auth', AuthRouter);
  }
}
