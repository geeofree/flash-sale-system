import { Router } from "express";
import { DIContainer } from "../utils/DependencyInjection.js";
import { ProductsService } from "../services/ProductsService.js";
import { checkLatestSaleStatus } from "../middlewares/SalesMiddleware.js";
import { auth } from "../middlewares/AuthMiddleware.js";

export const ProductsRouter = Router();

ProductsRouter.get('/', async (_req, res) => {
  const productsService = DIContainer.get(ProductsService);
  const response = await productsService.getAllProducts();
  res.json(response.result).status(response.statusCode);
});

ProductsRouter.post('/', auth(["Admin"]), async (req, res) => {
  const params = req.body;
  const productsService = DIContainer.get(ProductsService);
  const response = await productsService.createProduct(params);
  res.json(response.result).status(response.statusCode);
});

ProductsRouter.get('/:sku', async (req, res) => {
  const { sku } = req.params;
  const productsService = DIContainer.get(ProductsService);
  const response = await productsService.getProductBySku(Number(sku));
  res.json(response.result).status(response.statusCode);
});

ProductsRouter.post('/:sku/purchase', auth(), checkLatestSaleStatus, async (_req, res) => {
  const productsService = DIContainer.get(ProductsService);
  const response = await productsService.createOrder();
  res.json(response.result).status(response.statusCode);
});

ProductsRouter.get('/:sku/purchase_status', (_req, res) => {
  res.json({ purchase_status: 'N/A' });
});
