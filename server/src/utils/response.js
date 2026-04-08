/**
 * @param {import("express").Response} res
 * @param {unknown} data
 * @param {string} [message]
 * @param {number} [statusCode]
 */
export function sendSuccess(res, data, message, statusCode = 200) {
  const body = { success: true, data };

  if (message) {
    body.message = message;
  }

  return res.status(statusCode).json(body);
}

/**
 * @param {import("express").Response} res
 * @param {string} message
 * @param {string} code
 * @param {number} [statusCode]
 * @param {object} [extra]
 */
export function sendError(res, message, code, statusCode = 400, extra = undefined) {
  const body = {
    success: false,
    error: message,
    code,
    statusCode,
  };

  if (extra && typeof extra === "object") {
    Object.assign(body, extra);
  }

  return res.status(statusCode).json(body);
}

/**
 * @param {import("express").Response} res
 * @param {unknown[]} data
 * @param {number} total
 * @param {number} page
 * @param {number} pageSize
 */
export function sendPaginated(res, data, total, page, pageSize) {
  const totalPages = Math.ceil(total / pageSize);

  return res.status(200).json({
    success: true,
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
    },
  });
}