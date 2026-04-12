import Announcement from "../models/announcement.js";
import { sendSuccess } from "../utils/response.js";

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function getAnnouncements(req, res, next) {
	try {
		const announcements = await Announcement.findAll({
			order: [["time", "DESC"]],
		});

		return sendSuccess(res, announcements, "Announcements loaded", 200);
	} catch (error) {
		return next(error);
	}
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function createAnnouncement(req, res, next) {
	try {
		const { content } = req.validated?.body || req.body;

		const announcement = await Announcement.create({
			time: new Date(),
			content,
			author: req.user.username,
		});

		return sendSuccess(res, announcement, "Announcement created", 201);
	} catch (error) {
		return next(error);
	}
}

export default {
	getAnnouncements,
	createAnnouncement,
};
