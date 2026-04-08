import { rateLimit } from "express-rate-limit";

export const rateLimitMiddleware = rateLimit({
  limit: 300,
  standardHeaders: true,
  windowMs: 15 * 60 * 1000,
});

export const authRateLimit = rateLimit({
  limit: 20,
  standardHeaders: true,
  windowMs: 15 * 60 * 1000,
});