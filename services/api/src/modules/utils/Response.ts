import type { StatusCodes } from "http-status-codes"

export type JsonResponseMsg<T = unknown> = {
  statusCode: StatusCodes;
  result: Omit<JsonResponseParams<T>, "statusCode">
}

export type JsonResponseParams<T = unknown> = {
  statusCode: StatusCodes;
  message: string;
  data: T;
}

export const jsonResponse = <T = unknown>(params: JsonResponseParams<T>): JsonResponseMsg => ({
  statusCode: params.statusCode,
  result: {
    data: params.data,
    message: params.message,
  }
})
