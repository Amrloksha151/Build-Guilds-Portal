import { sendSuccess } from "../utils/response.js";

/**
 * @param {import("express").Request} _req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export async function listActivities(_req, res, next) {
  try {
    sendSuccess(res, [], "Activities fetched", 200);
  } catch (error) {
    next(error);
  }
}

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export async function getActivityById(req, res, next) {
  try {
    sendSuccess(res, { id: req.params.id }, "Activity fetched", 200);
  } catch (error) {
    next(error);
  }
}

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export async function createActivity(req, res, next) {
  try {
    sendSuccess(res, req.body, "Activity created", 201);
  } catch (error) {
    next(error);
  }
}

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export async function updateActivity(req, res, next) {
  try {
    sendSuccess(res, { id: req.params.id, ...req.body }, "Activity updated", 200);
  } catch (error) {
    next(error);
  }
}

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export async function deleteActivity(req, res, next) {
  try {
    sendSuccess(res, { id: req.params.id }, "Activity deleted", 200);
  } catch (error) {
    next(error);
  }
}