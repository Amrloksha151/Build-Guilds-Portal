import { sendError } from "../utils/response.js";
import { verifyCsrfToken } from "../utils/csrf.js";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const CSRF_HEADER_NAME = "x-csrf-token";

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
    const csrfHeaderToken = req.get(CSRF_HEADER_NAME);

    if (!sessionSid) {
      return sendError(res, "Unauthorized", "UNAUTHORIZED", 401);
    }

    if (!csrfHeaderToken) {
      return sendError(res, "Missing CSRF token", "CSRF_TOKEN_REQUIRED", 403);
    }

    const isValid = await verifyCsrfToken(sessionSid, csrfHeaderToken);

    if (!isValid) {
      return sendError(res, "Invalid CSRF token", "CSRF_TOKEN_INVALID", 403);
    }

    return next();
  } catch (error) {
    return next(error);
  }
}

export default csrfMiddleware;
