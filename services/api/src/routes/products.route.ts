import { Router } from "express";

export const ProductsRouter = Router();

ProductsRouter.get('/', (_req, res) => {
  res.json({ products: [] });
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
