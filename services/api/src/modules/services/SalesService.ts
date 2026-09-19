import { TOKENS } from "../utils/DependencyInjection.js";
import { type Database } from "./DbService.js";
import { jsonResponse, type JsonResponseMsg } from "../utils/Response.js";
import { inject, injectable } from "inversify";
import { StatusCodes } from "http-status-codes";
import { SalesTable } from "../../db/schema.js";
import { asc, getTableColumns } from "drizzle-orm";

export type FlashSaleParams = {
  startTime: Date;
  endTime: Date;
}

@injectable()
export class SalesService {
  @inject(TOKENS.DB)
  private db!: Database;

  async getAllSales(): Promise<JsonResponseMsg> {
    try {
      const { id, ...returnedColumns } = getTableColumns(SalesTable);
      const sales = await this.db.select(returnedColumns)
        .from(SalesTable) 
        .orderBy(asc(SalesTable.startTime))
      return jsonResponse({
        statusCode: StatusCodes.OK,
        data: sales,
        message: "Successfully retrieve all sales!",
      });
    } catch (error: unknown) {
      return jsonResponse<null>({
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Something went wrong while fetching all sales.",
        data: null,
      })
    }
  }

  async getLatestSale(): Promise<JsonResponseMsg> {
    try {
      const { id, ...returnedColumns } = getTableColumns(SalesTable);
      const [sale] = await this.db.select(returnedColumns)
        .from(SalesTable) 
        .orderBy(asc(SalesTable.startTime))
        .limit(1);
      return jsonResponse({
        statusCode: StatusCodes.OK,
        data: sale,
        message: "Successfully retrieve latest sale!",
      });
    } catch (error: unknown) {
      return jsonResponse<null>({
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Something went wrong while fetching latest sale.",
        data: null,
      })
    }
  }

  async createSale(params: typeof SalesTable.$inferInsert): Promise<JsonResponseMsg> {
    try {
      if (params.startTime == null || params.endTime == null) return jsonResponse({
        statusCode: StatusCodes.BAD_REQUEST,
        data: null, 
        message: "Start time or end time not provided.",
      });

      const { id, ...returnedColumns } = getTableColumns(SalesTable);

      const [sale] = await this.db.insert(SalesTable).values({
        startTime: new Date(params.startTime),
        endTime: new Date(params.endTime)
      }).returning(returnedColumns);

      return jsonResponse({
        statusCode: StatusCodes.CREATED,
        data: sale,
        message: "Successfully created new sale!",
      });
    } catch (error: unknown) {
      console.log(error);
      return jsonResponse<null>({
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Something went wrong while creating new sale.",
        data: null,
      })
    }
  }
}
