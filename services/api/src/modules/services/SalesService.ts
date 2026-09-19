import { DIContainer, TOKENS } from "../utils/DependencyInjection.js";
import { type Database } from "./DbService.js";
import { jsonResponse, type JsonResponseMsg } from "../utils/Response.js";
import { inject, injectable } from "inversify";
import { StatusCodes } from "http-status-codes";
import { ProductsTable, SalesTable } from "../../db/schema.js";
import { sql } from "drizzle-orm";
import type { RedisClientType } from "redis";
import { ProductsService } from "./ProductsService.js";

export type FlashSaleParams = {
  startTime: Date;
  endTime: Date;
}

@injectable()
export class SalesService {
  @inject(TOKENS.DB)
  private db!: Database;

  @inject(ProductsService)
  private productService!: ProductsService;

  private redis = DIContainer.getAsync<RedisClientType>(TOKENS.REDIS);

  static USERS_KEY = 'SALE_USERS';

  static STOCK_KEY = 'SALE_STOCK';

  static WINDOW_KEY = 'SALE_WINDOW';

  async getAllSales(): Promise<JsonResponseMsg> {
    try {
      const sales = await this.db.select()
        .from(SalesTable) 
        .orderBy(sql`
          -- Tier 0: Active Sale right now
          -- Tier 1: Next upcoming sales
          -- Tier 2: Past sales
          CASE 
            WHEN NOW() BETWEEN ${SalesTable.startTime} AND ${SalesTable.endTime} THEN 0
            WHEN ${SalesTable.startTime} > NOW() THEN 1
            ELSE 2
          END ASC,

          -- Active sale: sorted by end time
          CASE 
            WHEN NOW() BETWEEN ${SalesTable.startTime} AND ${SalesTable.endTime} THEN ${SalesTable.endTime} 
          END ASC,

          -- Upcoming sales: sorted by nearest start time
          CASE 
            WHEN ${SalesTable.startTime} > NOW() THEN ${SalesTable.startTime} 
          END ASC,

          -- Past sales: sorted by most recently ended
          CASE 
            WHEN ${SalesTable.endTime} < NOW() THEN ${SalesTable.endTime} 
          END DESC
        `)
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
      const [sale] = await this.db.select()
        .from(SalesTable) 
        .orderBy(sql`
          -- Tier 0: Active Sale right now
          -- Tier 1: Next upcoming sales
          -- Tier 2: Past sales
          CASE 
            WHEN NOW() BETWEEN ${SalesTable.startTime} AND ${SalesTable.endTime} THEN 0
            WHEN ${SalesTable.startTime} > NOW() THEN 1
            ELSE 2
          END ASC,

          -- Active sale: sorted by end time
          CASE 
            WHEN NOW() BETWEEN ${SalesTable.startTime} AND ${SalesTable.endTime} THEN ${SalesTable.endTime} 
          END ASC,

          -- Upcoming sales: sorted by nearest start time
          CASE 
            WHEN ${SalesTable.startTime} > NOW() THEN ${SalesTable.startTime} 
          END ASC,

          -- Past sales: sorted by most recently ended
          CASE 
            WHEN ${SalesTable.endTime} < NOW() THEN ${SalesTable.endTime} 
          END DESC
        `)
        .limit(1);

      if (sale == null) {
        return jsonResponse<null>({
          statusCode: StatusCodes.NOT_FOUND,
          data: null,
          message: "No latest sale exists yet.",
        });
      }

      return jsonResponse<Omit<typeof SalesTable.$inferSelect, "id">>({
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

      if (params.startTime >= params.endTime) return jsonResponse({
        statusCode: StatusCodes.BAD_REQUEST,
        data: null, 
        message: "Start time must not be greater than or equal to end time.",
      });

      const [sale] = await this.db.insert(SalesTable).values({
        startTime: new Date(params.startTime),
        endTime: new Date(params.endTime)
      }).returning();

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

  async preloadSale(productSku: number): Promise<JsonResponseMsg> {
    try {
      const latestSaleRes = await this.getLatestSale();

      if (latestSaleRes.statusCode !== StatusCodes.OK) {
        return latestSaleRes;
      }

      const productRes = await this.productService.getProductBySku(productSku);

      if (productRes.statusCode !== StatusCodes.OK) {
        return productRes;
      }

      const latestSale = latestSaleRes.result.data as typeof SalesTable.$inferSelect;
      const product = productRes.result.data as typeof ProductsTable.$inferSelect;

      const redisClient = await this.redis;

      await redisClient.set(SalesService.STOCK_KEY, product.stock);

      await redisClient.hSet(SalesService.WINDOW_KEY, {
        startTime: latestSale.startTime.getTime(),
        endTime: latestSale.endTime.getTime(),
      });

      await redisClient.del(SalesService.USERS_KEY);

      return jsonResponse<null>({
        statusCode: StatusCodes.OK,
        message: "Successfully pre-loaded sale caches!",
        data: null,
      })
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
