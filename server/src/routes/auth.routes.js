import express from "express";
import { z } from "zod";
import authController from "../controllers/auth.controller.js";
import { authRateLimit } from "../middleware/rateLimit.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

const router = express.Router();

const registerSchema = z
  .object({
    username: z.string().min(3).max(50),
    password: z.string().min(8).max(200),
  })
  .strict();

const loginSchema = z
  .object({
    username: z.string().min(3).max(50),
    password: z.string().min(8).max(200),
  })
  .strict();

router.post("/register", authRateLimit, validate(registerSchema), authController.register);
router.post("/login", authRateLimit, validate(loginSchema), authController.login);

export default router;
