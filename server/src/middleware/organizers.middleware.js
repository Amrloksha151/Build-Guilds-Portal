import { sendError } from "../utils/response.js";

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function organizersMiddleware(req, res, next) {
	try {
		if (!req.user) {
			return sendError(res, "Unauthorized", "UNAUTHORIZED", 401);
		}

		if (req.user.role !== "organizer" && req.user.role !== "admin") {
			return sendError(res, "Forbidden", "FORBIDDEN", 403);
		}

		return next();
	} catch (error) {
		return next(error);
	}
}

export default organizersMiddleware;
