import { Router } from 'express';
import { DIContainer } from '../utils/DependencyInjection.js';
import { SalesService } from '../services/SalesService.js';

export const SalesRouter = Router();

SalesRouter.get('/status', async (_req, res) => {
  const salesService = DIContainer.get(SalesService);
  const saleStatus = await salesService.getSaleStatus();
  res.json(saleStatus.result).status(saleStatus.statusCode);
});

SalesRouter.post('/', async (req, res) => {
  const params = req.body;
  const salesService = DIContainer.get(SalesService);
  const response = await salesService.createFlashSale(params);
  res.json(response.result).status(response.statusCode);
});
