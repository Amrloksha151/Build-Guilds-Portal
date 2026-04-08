import { sendError } from "../utils/response.js";
import { clearSessionCookie, getSessionById, getSessionCookieName } from "../utils/session.js";

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export async function authMiddleware(req, res, next) {
  try {
    const sessionId = req.cookies?.[getSessionCookieName()];

    if (!sessionId) {
      return sendError(res, "Unauthorized", "UNAUTHORIZED", 401);
    }

    const session = await getSessionById(sessionId);

    if (!session) {
      clearSessionCookie(res);
      return sendError(res, "Unauthorized", "UNAUTHORIZED", 401);
    }

    req.session = session;
    req.user = {
      id: session.user_id,
      email: session.email,
      name: session.name,
      role: session.role,
    };
    return next();
  } catch (error) {
    return next(error);
  }
}

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} _res
 * @param {import("express").NextFunction} next
 */
export async function optionalAuth(req, res, next) {
  try {
    const sessionId = req.cookies?.[getSessionCookieName()];

    if (!sessionId) {
      req.user = null;
      return next();
    }

    const session = await getSessionById(sessionId);

    if (!session) {
      clearSessionCookie(res);
      req.user = null;
      return next();
    }

    req.session = session;
    req.user = {
      id: session.user_id,
      email: session.email,
      name: session.name,
      role: session.role,
    };
    return next();
  } catch (error) {
    return next(error);
  }
}