import { injectable } from "inversify";
import { default as express, json } from 'express';
import type { Express } from 'express';
import { SalesRouter } from "../routers/SalesRouter.js";
import { ProductsRouter } from "../routers/ProductsRouter.js";
import { AuthRouter } from "../routers/AuthRouter.js";
import session from "express-session";
import { RedisStore } from "connect-redis";
import { DIContainer, TOKENS } from "../utils/DependencyInjection.js";
import type { Redis } from "ioredis";

@injectable()
export class ApiService {
  private app: Express;

  private redisClient = DIContainer.get(TOKENS.REDIS) as Redis

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
    this.app.use(
      session({
        store: new RedisStore({ client: this.redisClient, prefix: 'sess:' }),
        secret: process.env['SESSION_SECRET']!,
        resave: false,
        saveUninitialized: false,
        cookie: {
          secure: false,
          httpOnly: true,
          maxAge: 1000 * 60 * 60 * 2,
          sameSite: 'lax',
        },
      })
    );
    this.app.use(json());
    this.app.use('/api/sales', SalesRouter);
    this.app.use('/api/products', ProductsRouter);
    this.app.use('/api/auth', AuthRouter);
  }
}
