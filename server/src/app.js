import cors from "cors";
import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import session from "express-session";
import connectSessionSequelize from "connect-session-sequelize";

import sequelize from "./db/sequelize.js";
import Session from "./models/session.js";
import { globalRateLimit } from "./middleware/rateLimit.middleware.js";
import guestSessionMiddleware from "./middleware/guestSession.middleware.js";
import csrfMiddleware from "./middleware/csrf.middleware.js";
import { buildSessionCookieOptions, parseSessionTtlMs } from "./utils/session.js";

const SequelizeStore = connectSessionSequelize(session.Store);

const sessionStore = new SequelizeStore({
  db: sequelize,
  table: Session,
  tableName: "sessions",
  checkExpirationInterval: 15 * 60 * 1000,
  expiration: parseSessionTtlMs(process.env.SESSION_TTL),
});

const sessionStoreReady = sessionStore.sync();

export function createApp() {
  const app = express();
  const isProduction = process.env.NODE_ENV === "production";
  const cookieName = process.env.SESSION_COOKIE_NAME || "bgp_session";
  const sessionSecret = process.env.SESSION_SECRET;

  if (!sessionSecret) {
    throw new Error("SESSION_SECRET is required");
  }

  app.set("trust proxy", 1);

  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || true,
      credentials: true,
    })
  );

  app.use(helmet());
  app.use(globalRateLimit);
  app.use(express.json());
  app.use(cookieParser());

  app.use(async (req, res, next) => {
    try {
      await sessionStoreReady;
      return next();
    } catch (error) {
      error.statusCode = 503;
      error.code = "SESSION_STORE_INIT_FAILED";
      return next(error);
    }
  });

  app.use(
    session({
      name: cookieName,
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      store: sessionStore,
      cookie: buildSessionCookieOptions(isProduction),
    })
  );

  app.use(guestSessionMiddleware);
  app.use(csrfMiddleware);

  return app;
}
