import crypto from "node:crypto";

import { sendSuccess } from "../utils/response.js";
import {
  clearSessionCookie,
  createSession,
  deleteSessionById,
  getSessionCookieName,
  setSessionCookie,
} from "../utils/session.js";
import { ROLES } from "../../../shared/constants.js";

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export async function register(req, res, next) {
  try {
    const user = {
      id: crypto.randomUUID(),
      email: req.body.email,
      name: req.body.name,
      role: ROLES.PARTICIPANT,
    };
    const session = await createSession({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    setSessionCookie(res, session.sessionId);
    sendSuccess(res, { user, sessionExpiresAt: session.expiresAt }, "Registered", 201);
  } catch (error) {
    next(error);
  }
}

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export async function login(req, res, next) {
  try {
    const user = {
      id: crypto.randomUUID(),
      email: req.body.email,
      name: req.body.email.split("@")[0],
      role: ROLES.PARTICIPANT,
    };
    const session = await createSession({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    setSessionCookie(res, session.sessionId);
    sendSuccess(res, { user, sessionExpiresAt: session.expiresAt }, "Logged in", 200);
  } catch (error) {
    next(error);
  }
}

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export async function logout(req, res, next) {
  try {
    const sessionId = req.cookies?.[getSessionCookieName()];

    if (sessionId) {
      await deleteSessionById(sessionId);
    }

    clearSessionCookie(res);
    sendSuccess(res, null, "Logged out", 200);
  } catch (error) {
    next(error);
  }
}

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export async function getCurrentUser(req, res, next) {
  try {
    sendSuccess(res, { user: req.user ?? null }, "Current user", 200);
  } catch (error) {
    next(error);
  }
}