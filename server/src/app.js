import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";

import activitiesRoutes from "./routes/activities.routes.js";
import authRoutes from "./routes/auth.routes.js";
import leaderboardRoutes from "./routes/leaderboard.routes.js";
import participantsRoutes from "./routes/participants.routes.js";
import { optionalAuth } from "./middleware/auth.middleware.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import { rateLimitMiddleware } from "./middleware/rateLimit.middleware.js";
import { sendSuccess } from "./utils/response.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: process.env.CORS_ORIGIN ?? true,
      credentials: true,
    })
  );
  app.use(helmet());
  app.use(rateLimitMiddleware);
  app.use(express.json());
  app.use(cookieParser());
  app.use(optionalAuth);

  app.get("/api/v1/health", (_req, res) => sendSuccess(res, { status: "ok" }, "Healthy", 200));

  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/activities", activitiesRoutes);
  app.use("/api/v1/participants", participantsRoutes);
  app.use("/api/v1/leaderboard", leaderboardRoutes);

  app.use(errorMiddleware);

  return app;
}