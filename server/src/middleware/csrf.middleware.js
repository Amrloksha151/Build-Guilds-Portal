import crypto from "node:crypto";
import { sendError } from "../utils/response.js";
import { verifyCsrfToken } from "../utils/csrf.js";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function csrfMiddleware(req, res, next) {
  try {
    if (SAFE_METHODS.has(req.method)) {
      return next();
    }

    const sessionSid = req.sessionID;
    const csrfToken = req.get("x-csrf-token");

    if (!sessionSid) {
      return sendError(res, "Unauthorized", "UNAUTHORIZED", 401);
    }

    if (!csrfToken) {
      return sendError(res, "Missing CSRF token", "CSRF_TOKEN_REQUIRED", 403);
    }

    const isValid = await verifyCsrfToken(sessionSid, csrfToken);

    if (!isValid) {
      return sendError(res, "Invalid CSRF token", "CSRF_TOKEN_INVALID", 403);
    }

    return next();
  } catch (error) {
    return next(error);
  }
}

export default csrfMiddleware;
