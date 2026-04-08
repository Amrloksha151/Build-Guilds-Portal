import { sendError } from "../utils/response.js";

/**
 * @param {Error & { code?: string, statusCode?: number }} error
 * @param {import("express").Request} _req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} _next
 */
export function errorMiddleware(error, _req, res, _next) {
  const statusCode = Number.isInteger(error.statusCode) ? error.statusCode : 500;
  const code = error.code ?? "INTERNAL_SERVER_ERROR";
  const message = statusCode >= 500 ? "Internal server error" : error.message;

  return sendError(res, message, code, statusCode);
}