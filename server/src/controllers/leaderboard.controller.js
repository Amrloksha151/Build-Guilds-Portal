import { sendSuccess } from "../utils/response.js";

/**
 * @param {import("express").Request} _req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export async function listLeaderboard(_req, res, next) {
  try {
    sendSuccess(res, [], "Leaderboard fetched", 200);
  } catch (error) {
    next(error);
  }
}

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export async function getLeaderboardById(req, res, next) {
  try {
    sendSuccess(res, { id: req.params.id }, "Leaderboard entry fetched", 200);
  } catch (error) {
    next(error);
  }
}

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export async function recalculateLeaderboard(req, res, next) {
  try {
    sendSuccess(res, { id: req.params.id }, "Leaderboard recalculated", 202);
  } catch (error) {
    next(error);
  }
}