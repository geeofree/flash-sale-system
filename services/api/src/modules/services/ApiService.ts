import { injectable } from "inversify";
import { default as express, json } from 'express';
import type { Express } from 'express';
import { SalesRouter } from "../routers/SalesRouter.js";
import { ProductsRouter } from "../routers/ProductsRouter.js";
import { AuthRouter } from "../routers/AuthRouter.js";
import session from "express-session";
import { RedisStore } from "connect-redis";
import { DIContainer, TOKENS } from "../utils/DependencyInjection.js";
import type { RedisClientType } from "redis";

@injectable()
export class ApiService {
  private app: Express;

  private redisClient = DIContainer.getAsync<RedisClientType>(TOKENS.REDIS)

  constructor() {
    this.app = express();
  }

  async start() {
    await this.registerRoutes();
    const PORT = process.env['PORT'] || 3000;
    this.app.listen(PORT, () => {
      console.log(`API service running in localhost:${PORT}`);
    })
  }

  private async registerRoutes() {
    const redisClient = await this.redisClient;
    this.app.set('trust proxy', 1);
    this.app.use(
      session({
        store: new RedisStore({ client: redisClient, prefix: 'sess:' }),
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
