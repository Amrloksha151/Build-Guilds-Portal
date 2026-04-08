import { sendError } from "../utils/response.js";

/**
 * @param {Error & { statusCode?: number, code?: string }} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function errorMiddleware(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const code = err.code || "INTERNAL_SERVER_ERROR";
  const message = statusCode === 500 ? "Internal server error" : err.message;

  return sendError(res, message, code, statusCode);
}

export default errorMiddleware;
