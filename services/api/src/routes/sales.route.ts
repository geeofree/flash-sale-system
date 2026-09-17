import { Router } from 'express';

export const SalesRouter = Router();

SalesRouter.get('/status', (_req, res) => {
  res.json({ sales: "status" });
});
