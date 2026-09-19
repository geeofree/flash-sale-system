import { Router } from "express";
import { DIContainer } from "../utils/DependencyInjection.js";
import { AuthService } from "../services/AuthService.js";
import { StatusCodes } from "http-status-codes";
import { UsersTable } from "../../db/schema.js";

export const AuthRouter = Router();

AuthRouter.post('/sign-in', async (req, res) => {
  const authService = DIContainer.get(AuthService);
  const response = await authService.signIn(req.body);
  if (response.statusCode === StatusCodes.OK) {
    req.session.user = response.result.data as Omit<typeof UsersTable.$inferSelect, "password">;
  }
  res.json(response.result).status(response.statusCode);
});

AuthRouter.post('/sign-up', async (req, res) => {
  const authService = DIContainer.get(AuthService);
  const response = await authService.signUp(req.body);
  res.json(response.result).status(response.statusCode);
});
