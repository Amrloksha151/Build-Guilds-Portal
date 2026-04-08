import { sendSuccess } from "../utils/response.js";

/**
 * @param {import("express").Request} _req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export async function listParticipants(_req, res, next) {
  try {
    sendSuccess(res, [], "Participants fetched", 200);
  } catch (error) {
    next(error);
  }
}

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export async function getParticipantById(req, res, next) {
  try {
    sendSuccess(res, { id: req.params.id }, "Participant fetched", 200);
  } catch (error) {
    next(error);
  }
}

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export async function updateParticipant(req, res, next) {
  try {
    sendSuccess(res, { id: req.params.id, ...req.body }, "Participant updated", 200);
  } catch (error) {
    next(error);
  }
}