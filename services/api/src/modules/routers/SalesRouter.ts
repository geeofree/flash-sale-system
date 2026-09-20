import { Router } from 'express';
import { DIContainer } from '../utils/DependencyInjection.js';
import { SalesService } from '../services/SalesService.js';
import { auth } from '../middlewares/AuthMiddleware.js';

export const SalesRouter = Router();

SalesRouter.get('/', auth(["Admin"]), async (_req, res) => {
  const salesService = DIContainer.get(SalesService);
  const allSales = await salesService.getAllSales();
  res.status(allSales.statusCode).json(allSales.result);
});

SalesRouter.get('/latest/status', async (_req, res) => {
  const salesService = DIContainer.get(SalesService);
  const latestSale = await salesService.getLatestSaleStatus();
  res.status(latestSale.statusCode).json(latestSale.result);
});

SalesRouter.post('/', auth(["Admin"]), async (req, res) => {
  const params = req.body;
  const salesService = DIContainer.get(SalesService);
  const response = await salesService.createSale(params);
  res.status(response.statusCode).json(response.result);
});

SalesRouter.post('/preload/:productSku', auth(["Admin"]), async (req, res) => {
  const { productSku } = req.params;
  const salesService = DIContainer.get(SalesService);
  const response = await salesService.preloadSale(Number(productSku));
  res.status(response.statusCode).json(response.result);
});
