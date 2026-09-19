import type { RequestHandler } from "express";
import { jsonResponse } from "../utils/Response.js";
import { StatusCodes } from "http-status-codes";

export function auth(roles?: string[]) {
  const middleware: RequestHandler = (req, res, next) => {
    if (req.session.user == null) {
      const response = jsonResponse<null>({
        statusCode: StatusCodes.UNAUTHORIZED,
        message: "You are unauthenticated. Please sign-in.",
        data: null,
      });
      return res.status(response.statusCode).json(response.result);
    }

    if (roles == null) {
      return next();
    }

    if (roles.length > 0 && !roles.includes(req.session.user.role)) {
      const response = jsonResponse<null>({
        statusCode: StatusCodes.UNAUTHORIZED,
        message: "You do not have the right authorization to access this service.",
        data: null,
      });
      return res.status(response.statusCode).json(response.result);
    }

    return next();
  }
  return middleware;
}
