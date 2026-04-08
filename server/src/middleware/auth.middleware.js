import User from "../models/user.js";
import { sendError } from "../utils/response.js";

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function authMiddleware(req, res, next) {
  try {
    if (!req.session?.userId) {
      return sendError(res, "Unauthorized", "UNAUTHORIZED", 401);
    }

    const user = await User.findByPk(req.session.userId);

    if (!user) {
      req.session.destroy(() => {});
      return sendError(res, "Unauthorized", "UNAUTHORIZED", 401);
    }

    req.user = {
      id: user.id,
      username: user.username,
      role: user.role,
    };

    return next();
  } catch (error) {
    return next(error);
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function optionalAuth(req, res, next) {
  if (!req.session?.userId) {
    return next();
  }

  return authMiddleware(req, res, next);
}

export default authMiddleware;
