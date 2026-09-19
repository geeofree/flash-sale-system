import { Router } from 'express';
import { DIContainer } from '../utils/DependencyInjection.js';
import { SalesService } from '../services/SalesService.js';
import { auth } from '../middlewares/AuthMiddleware.js';

export const SalesRouter = Router();

SalesRouter.get('/', auth(["Admin"]), async (_req, res) => {
  const salesService = DIContainer.get(SalesService);
  const saleStatus = await salesService.getAllSales();
  res.json(saleStatus.result).status(saleStatus.statusCode);
});

SalesRouter.get('/latest', async (_req, res) => {
  const salesService = DIContainer.get(SalesService);
  const saleStatus = await salesService.getLatestSale();
  res.json(saleStatus.result).status(saleStatus.statusCode);
});

SalesRouter.post('/', auth(["Admin"]), async (req, res) => {
  const params = req.body;
  const salesService = DIContainer.get(SalesService);
  const response = await salesService.createSale(params);
  res.json(response.result).status(response.statusCode);
});
