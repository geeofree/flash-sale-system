import type { RequestHandler } from "express";
import { jsonResponse } from "../utils/Response.js";
import { StatusCodes } from "http-status-codes";
import { DIContainer } from "../utils/DependencyInjection.js";
import { SalesService } from "../services/SalesService.js";
import { SalesTable } from "../../db/schema.js";

export const checkLatestSaleStatus: RequestHandler = async (_req, res, next) => {
  try {
    const salesService = DIContainer.get(SalesService);
    const latestSaleResponse = await salesService.getLatestSale();

    if (latestSaleResponse.statusCode !== StatusCodes.OK) {
      return latestSaleResponse;
    }

    const latestSale = latestSaleResponse.result.data as Omit<typeof SalesTable.$inferSelect , "id"> ;

    const now = new Date().getTime();
    const saleStartTime = new Date(latestSale.startTime).getTime();
    const saleEndTime = new Date(latestSale.endTime).getTime();

    if (now < saleStartTime) {
      const response = jsonResponse<null>({
        statusCode: StatusCodes.BAD_REQUEST,
        message: "Sale has not started yet.",
        data: null,
      });
      return res.json(response.result).status(response.statusCode);
    } else if (now > saleEndTime) {
      const response = jsonResponse<null>({
        statusCode: StatusCodes.BAD_REQUEST,
        message: "Sale has ended.",
        data: null,
      });
      return res.json(response.result).status(response.statusCode);
    }

    return next();
  } catch (error: unknown) {
    console.error(error);
    const response = jsonResponse<null>({
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Something went wrong while ordering the product.",
      data: null,
    })
    return res.json(response.result).status(response.statusCode);
  }
}
