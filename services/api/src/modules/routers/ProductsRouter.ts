import { Router } from "express";
import { DIContainer } from "../utils/DependencyInjection.js";
import { RedisService } from "../services/RedisService.js";
import type { Redis } from "ioredis";

export const ProductsRouter = Router();

ProductsRouter.get('/', async (_req, res) => {
  const redis = DIContainer.get(RedisService) as Redis;
  await redis.set('products', 'hi products');
  const products = await redis.get('products');
  res.json({ products });
});

ProductsRouter.get('/:sku', (_req, res) => {
  res.json({ product: {} });
});

ProductsRouter.post('/:sku/purchase', (_req, res) => {
  res.json({ queue_ticket: '' });
});

ProductsRouter.get('/:sku/purchase_status', (_req, res) => {
  res.json({ purchase_status: 'N/A' });
});
