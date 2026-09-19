import { TOKENS } from "../utils/DependencyInjection.js";
import { inject, injectable } from "inversify";
import { jsonResponse } from "../utils/Response.js";
import { StatusCodes } from "http-status-codes";
import { ProductsTable, SalesTable } from "../../db/schema.js";
import type { Database } from "./DbService.js";
import { eq, getTableColumns } from "drizzle-orm";
import { SalesService } from "./SalesService.js";

@injectable()
export class ProductsService {
  @inject(SalesService)
  private salesService!: SalesService;

  @inject(TOKENS.DB)
  private db!: Database;

  async getAllProducts() {
    try {
      const products = await this.db
        .select()
        .from(ProductsTable);
      return jsonResponse({
        statusCode: StatusCodes.OK,
        data: products,
        message: "Successfully retrieved all list of products!",
      });
    } catch (error) {
      console.error(error);
      return jsonResponse<null>({
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Something went wrong while retrieving products.",
        data: null,
      })
    }
  }

  async getProductBySku(sku: number) {
    try {
      const [product] = await this.db
        .select()
        .from(ProductsTable)
        .where(eq(ProductsTable.id, sku))

      if (product == null) {
        return jsonResponse({
          statusCode: StatusCodes.NOT_FOUND,
          data: null,
          message: "Product does not exists.",
        });
      }

      return jsonResponse({
        statusCode: StatusCodes.OK,
        data: product,
        message: "Successfully retrieved product!",
      });
    } catch (error) {
      console.error(error);
      return jsonResponse<null>({
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Something went wrong while retrieving the product.",
        data: null,
      })
    }
  }

  async createProduct(params: typeof ProductsTable.$inferInsert) {
    try {
      const allColumns = getTableColumns(ProductsTable);
      const [newProduct] = await this.db.insert(ProductsTable)
        .values(params)
        .returning(allColumns);
      return jsonResponse({
        statusCode: StatusCodes.CREATED,
        data: newProduct,
        message: "Successfully created new product!",
      });
    } catch (error) {
      console.error(error);
      return jsonResponse<null>({
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Something went wrong while creating the product.",
        data: null,
      })
    }
  }

  async createOrder() {
    try {
      const latestSaleResponse = await this.salesService.getLatestSale();

      if (latestSaleResponse.statusCode !== StatusCodes.OK) {
        return latestSaleResponse;
      }

      const latestSale = latestSaleResponse.result.data as Omit<typeof SalesTable.$inferSelect , "id"> ;

      const now = new Date().getTime();
      const saleStartTime = new Date(latestSale.startTime).getTime();
      const saleEndTime = new Date(latestSale.endTime).getTime();

      if (now < saleStartTime) {
        return jsonResponse<null>({
          statusCode: StatusCodes.BAD_REQUEST,
          message: "Sale has not started yet.",
          data: null,
        });
      } else if (now > saleEndTime) {
        return jsonResponse<null>({
          statusCode: StatusCodes.BAD_REQUEST,
          message: "Sale has ended.",
          data: null,
        });
      }

      return jsonResponse<null>({
        statusCode: StatusCodes.OK,
        message: "Product successfully reserved!",
        data: null,
      });
    } catch (error) {
      console.error(error);
      return jsonResponse<null>({
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Something went wrong while ordering the product.",
        data: null,
      })
    }
  }
}
