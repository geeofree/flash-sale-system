import { DIContainer } from "../utils/DependencyInjection.js";
import { DbService, type Database } from "./DbService.js";
import { jsonResponse, type JsonResponseMsg } from "../utils/Response.js";
import { injectable } from "inversify";
import { StatusCodes } from "http-status-codes";
import { SalesTable } from "../../db/schema.js";
import { getTableColumns } from "drizzle-orm";

export type FlashSaleParams = {
  startTime: Date;
  endTime: Date;
}

@injectable()
export class SalesService {
  private db = DIContainer.get(DbService) as Database;

  async getSaleStatus(): Promise<JsonResponseMsg> {
    try {
      const { id, ...returnedColumns } = getTableColumns(SalesTable);
      const sales = await this.db.select(returnedColumns).from(SalesTable);
      return jsonResponse({
        statusCode: StatusCodes.OK,
        data: sales,
        message: "Successfully retrieve sale status!",
      });
    } catch (error: unknown) {
      return jsonResponse<null>({
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Something went wrong while fetching sale status.",
        data: null,
      })
    }
  }

  async createFlashSale(params: typeof SalesTable.$inferInsert): Promise<JsonResponseMsg> {
    try {
      if (params.startTime == null || params.endTime == null) return jsonResponse({
        statusCode: StatusCodes.BAD_REQUEST,
        data: null, 
        message: "Start time or end time not provided.",
      });

      const { id, ...returnedColumns } = getTableColumns(SalesTable);

      const sales = await this.db.insert(SalesTable).values({
        startTime: new Date(params.startTime),
        endTime: new Date(params.endTime)
      }).returning(returnedColumns);

      return jsonResponse({
        statusCode: StatusCodes.CREATED,
        data: sales,
        message: "Successfully created sale status!",
      });
    } catch (error: unknown) {
      console.log(error);
      return jsonResponse<null>({
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Something went wrong while fetching sale status.",
        data: null,
      })
    }
  }
}
