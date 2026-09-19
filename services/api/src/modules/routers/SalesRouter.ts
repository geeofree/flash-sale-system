import { Router } from 'express';
import { DIContainer } from '../utils/DependencyInjection.js';
import { SalesService } from '../services/SalesService.js';
import { auth } from '../middlewares/AuthMiddleware.js';

export const SalesRouter = Router();

SalesRouter.get('/', auth(["Admin"]), async (_req, res) => {
  const salesService = DIContainer.get(SalesService);
  const saleStatus = await salesService.getAllSales();
  res.status(saleStatus.statusCode).json(saleStatus.result);
});

SalesRouter.get('/latest', async (_req, res) => {
  const salesService = DIContainer.get(SalesService);
  const saleStatus = await salesService.getLatestSale();
  res.status(saleStatus.statusCode).json(saleStatus.result);
});

SalesRouter.post('/', auth(["Admin"]), async (req, res) => {
  const params = req.body;
  const salesService = DIContainer.get(SalesService);
  const response = await salesService.createSale(params);
  res.status(response.statusCode).json(response.result);
});

SalesRouter.post('/pre-load/:productSku', auth(["Admin"]), async (req, res) => {
  const { productSku } = req.params;
  const salesService = DIContainer.get(SalesService);
  const response = await salesService.preloadSale(Number(productSku));
  res.status(response.statusCode).json(response.result);
});
