import { Router } from "express";
import { z } from "zod";

import {
  getCurrentUser,
  login,
  logout,
  register,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authRateLimit } from "../middleware/rateLimit.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

const router = Router();

const registerBodySchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(8),
});

const loginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post("/register", authRateLimit, validate(registerBodySchema, "body"), register);
router.post("/login", authRateLimit, validate(loginBodySchema, "body"), login);
router.post("/logout", authMiddleware, logout);
router.get("/me", authMiddleware, getCurrentUser);

export default router;