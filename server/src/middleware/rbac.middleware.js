import { sendError } from "../utils/response.js";
import { ROLE_ORDER } from "../../../shared/constants.js";

/**
 * @param {...string} roles
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    const userRole = req.user?.role ?? ROLE_ORDER[0];
    const hasRole = roles.some((role) => ROLE_ORDER.indexOf(userRole) >= ROLE_ORDER.indexOf(role));

    if (!hasRole) {
      return sendError(res, "Forbidden", "FORBIDDEN", 403);
    }

    return next();
  };
}

/**
 * @param {string} paramKey
 * @param {...string} roles
 */
export function requireSelfOrRole(paramKey, ...roles) {
  return (req, res, next) => {
    if (req.user?.id && req.params?.[paramKey] && req.user.id === req.params[paramKey]) {
      return next();
    }

    return requireRole(...roles)(req, res, next);
  };
}