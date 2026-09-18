import { Router } from "express";
import { DIContainer } from "../utils/DependencyInjection.js";
import { RedisService } from "../services/RedisService.js";
import type { Redis } from "ioredis";
import { ProductsService } from "../services/ProductsService.js";

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

ProductsRouter.post('/:sku/purchase', async (_req, res) => {
  const productsService = DIContainer.get(ProductsService);
  const response = await productsService.createOrder();
  res.json(response.result).status(response.statusCode);
});

ProductsRouter.get('/:sku/purchase_status', (_req, res) => {
  res.json({ purchase_status: 'N/A' });
});
