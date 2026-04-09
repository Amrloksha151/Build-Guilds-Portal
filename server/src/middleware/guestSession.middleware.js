import crypto from "node:crypto";
import { createOrRotateCsrfToken, CSRF_COOKIE_NAME } from "../utils/csrf.js";
import { buildCsrfCookieOptions } from "../utils/session.js";

function saveSession(session) {
  return new Promise((resolve, reject) => {
    session.save((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

/**
 * Bootstraps anonymous visitors with a persisted guest session and CSRF token.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function guestSessionMiddleware(req, res, next) {
  try {
    if (!req.session) {
      return next();
    }

    if (req.session.userId) {
      return next();
    }

    const shouldMarkGuest = req.session.isGuest !== true;
    const shouldBootstrapCsrf = !req.session.csrfBootstrap || !req.session.csrfTokenIssuedAt;

    if (!shouldMarkGuest && !shouldBootstrapCsrf) {
      return next();
    }

    if (shouldMarkGuest) {
      req.session.isGuest = true;
      req.session.guestAssignedAt = new Date().toISOString();
    }

    if (shouldBootstrapCsrf) {
      req.session.csrfBootstrap = crypto.randomUUID();
      req.session.csrfTokenIssuedAt = new Date().toISOString();
    }

    await saveSession(req.session);

    if (shouldBootstrapCsrf && req.sessionID) {
      const token = await createOrRotateCsrfToken(req.sessionID);
      req.csrfToken = token;

      const isProduction = process.env.NODE_ENV === "production";
      res.cookie(CSRF_COOKIE_NAME, token, buildCsrfCookieOptions(isProduction));
    }

    return next();
  } catch (error) {
    return next(error);
  }
}

export default guestSessionMiddleware;
