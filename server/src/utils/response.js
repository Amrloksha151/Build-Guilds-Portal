/**
 * @param {import('express').Response} res
 * @param {unknown} data
 * @param {string} [message]
 * @param {number} [statusCode]
 */
export function sendSuccess(res, data, message, statusCode = 200) {
	const payload = {
		success: true,
		data,
	};

	if (message) {
		payload.message = message;
	}

	return res.status(statusCode).json(payload);
}

/**
 * @param {import('express').Response} res
 * @param {string} message
 * @param {string} [code]
 * @param {number} [statusCode]
 * @param {Record<string, unknown>} [extra]
 */
export function sendError(
	res,
	message,
	code = "INTERNAL_SERVER_ERROR",
	statusCode = 500,
	extra
) {
	return res.status(statusCode).json({
		success: false,
		error: message,
		code,
		statusCode,
		...(extra || {}),
	});
}

/**
 * @param {import('express').Response} res
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

