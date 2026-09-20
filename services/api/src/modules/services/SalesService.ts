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

  async getLatestSaleStatus() {
    try {
      const redisClient = await this.redis;

      const [startTimeRes, endTimeRes] = await redisClient.hmGet(
        SalesService.WINDOW_KEY,
        ["startTime", "endTime"]
      );

      if (startTimeRes == null || endTimeRes == null) {
        return jsonResponse<null>({
          statusCode: StatusCodes.BAD_REQUEST,
          message: "No latest sale is available.",
          data: null,
        })
      }

      const startTime = Number(startTimeRes);
      const endTime = Number(endTimeRes);
      const now = (new Date()).getTime();

      if (now < startTime) {
        return jsonResponse<null>({
          statusCode: StatusCodes.BAD_REQUEST,
          message: "Sale has not started yet.",
          data: null,
        })
      } else if (now > endTime) {
        return jsonResponse<null>({
          statusCode: StatusCodes.BAD_REQUEST,
          message: "Sale has ended.",
          data: null,
        })
      }

      return jsonResponse<null>({
        statusCode: StatusCodes.OK,
        message: "Sale is active!",
        data: null,
      })
    } catch (error: unknown) {
      console.log(error);
      return jsonResponse<null>({
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Something went wrong while getting the status of the latest sale.",
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

      await Promise.all([
        redisClient.set(SalesService.STOCK_KEY, product.stock),
        redisClient.hSet(SalesService.WINDOW_KEY, {
          startTime: latestSale.startTime.getTime(),
          endTime: latestSale.endTime.getTime(),
        }),
        // TODO: Instead of deleting the users sale cache,
        // preload it with the entries of orders in the database.
        // Do this when we have the order worker ready.
        redisClient.del(SalesService.USERS_KEY),
      ]);

      return jsonResponse<null>({
        statusCode: StatusCodes.OK,
        message: "Successfully pre-loaded sale caches!",
        data: null,
      })
    } catch (error: unknown) {
      console.log(error);
      return jsonResponse<null>({
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Something went wrong while pre-loading a sale.",
        data: null,
      })
    }
  }

  async checkProductPurchaseForSale(userId: number): Promise<JsonResponseMsg> {
    try {
      const redisClient = await this.redis;

      const result = await redisClient.eval(`
        local sale_window_key = KEYS[1]
        local users_key = KEYS[2]
        local stock_key = KEYS[3]

        local sale_window = redis.call('HMGET', sale_window_key, ARGV[1], ARGV[2])
        local start_time = tonumber(sale_window[1])
        local end_time = tonumber(sale_window[2])

        local stock = tonumber(redis.call('GET', stock_key))
        local user_id = ARGV[3]

        local now = tonumber(ARGV[4])

        -- 1. Check Flash Sale Window
        if not start_time or not end_time or now < start_time or now > end_time then
            return "SALE_INACTIVE"
        end

        -- 2. Check Single-Item Per User Constraint
        if redis.call('SISMEMBER', users_key, user_id) == 1 then
            return "ALREADY_PURCHASED"
        end

        if not stock or stock <= 0 then
            return "SOLD_OUT"
        end

        -- 4. Atomically Deduct Stock & Record User Purchase
        redis.call('DECR', stock_key)
        redis.call('SADD', users_key, user_id)

        return "SUCCESS"
      `, {
        keys: [
          SalesService.WINDOW_KEY,
          SalesService.USERS_KEY,
          SalesService.STOCK_KEY,
        ],
        arguments: [
          "startTime",
          "endTime",
          userId.toString(),
          new Date().getTime().toString()
        ]
      });

      switch (result) {
        case "SUCCESS":
          return jsonResponse<string>({
            statusCode: StatusCodes.CREATED,
            message: "Order successfully reserved!",
            data: result,
          });

        case "ALREADY_PURCHASED":
          return jsonResponse<string>({
            statusCode: StatusCodes.CONFLICT,
            message: "You have already bought this item.",
            data: result,
          });

        case "SALE_INACTIVE":
          return jsonResponse<string>({
            statusCode: StatusCodes.BAD_REQUEST,
            message: "Sale has not yet started or has ended.",
            data: result,
          });

        case "SOLD_OUT":
          return jsonResponse<string>({
            statusCode: StatusCodes.GONE,
            message: "Item has been sold out.",
            data: result,
          });
      }

      return jsonResponse<null>({
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Something went wrong while retrieving the sale status.",
        data: null,
      })
    } catch (error: unknown) {
      console.log(error);
      return jsonResponse<null>({
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Something went wrong while retrieving the sale status.",
        data: null,
      })
    }
  }
}
