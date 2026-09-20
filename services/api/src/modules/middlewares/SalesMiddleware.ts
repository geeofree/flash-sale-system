import type { RequestHandler } from "express";
import { jsonResponse } from "../utils/Response.js";
import { StatusCodes } from "http-status-codes";
import { DIContainer } from "../utils/DependencyInjection.js";
import { SalesService } from "../services/SalesService.js";

export const checkProductPurchaseForSale: RequestHandler = async (req, res, next) => {
  try {
    const salesService = DIContainer.get(SalesService);

    if (req.session.user?.id == null) {
      const unauthorized = jsonResponse<null>({
        statusCode: StatusCodes.UNAUTHORIZED,
        message: "You are not authenticated. Please sign-in.",
        data: null,
      })
      return res.status(unauthorized.statusCode).json(unauthorized.result);
    }

    const latestSaleStatus = await salesService.checkProductPurchaseForSale(req.session.user.id);

    if (latestSaleStatus.statusCode !== StatusCodes.CREATED) {
      return res.status(latestSaleStatus.statusCode).json(latestSaleStatus.result);
    }

    return next();
  } catch (error: unknown) {
    console.error(error);
    const response = jsonResponse<null>({
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Something went wrong while ordering the product.",
      data: null,
    })
    return res.status(response.statusCode).json(response.result);
  }
}
