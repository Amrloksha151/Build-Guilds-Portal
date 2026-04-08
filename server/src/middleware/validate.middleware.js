import { sendError } from "../utils/response.js";

/**
 * @param {import('zod').ZodTypeAny} schema
 * @param {"body" | "query" | "params"} [target]
 */
export function validate(schema, target = "body") {
  return (req, res, next) => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      return sendError(res, "Validation failed", "VALIDATION_ERROR", 422, {
        issues: result.error.issues,
      });
    }

    req.validated = req.validated || {};
    req.validated[target] = result.data;

    return next();
  };
}

export default validate;
