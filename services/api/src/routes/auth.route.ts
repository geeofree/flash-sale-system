import { Router } from "express";

export const AuthRouter = Router();

AuthRouter.post('/login', (_req, res) => {
  res.json({ user: {} });
});
