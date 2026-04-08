import { Router } from "express";
import { z } from "zod";

import {
  createActivity,
  deleteActivity,
  getActivityById,
  listActivities,
  updateActivity,
} from "../controllers/activities.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/rbac.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { ACTIVITY_STATUSES, ROLES } from "../../../shared/constants.js";

const router = Router();

const activityBodySchema = z.object({
  title: z.string().min(1),
  description: z.string().max(500).optional().nullable(),
  points: z.number().int().nonnegative().optional(),
  status: z.enum(Object.values(ACTIVITY_STATUSES)).optional(),
});

const activityUpdateSchema = activityBodySchema.partial();

router.get("/", listActivities);
router.get("/:id", getActivityById);
router.post("/", authMiddleware, requireRole(ROLES.ORGANIZER, ROLES.ADMIN), validate(activityBodySchema, "body"), createActivity);
router.patch("/:id", authMiddleware, requireRole(ROLES.ORGANIZER, ROLES.ADMIN), validate(activityUpdateSchema, "body"), updateActivity);
router.delete("/:id", authMiddleware, requireRole(ROLES.ORGANIZER, ROLES.ADMIN), deleteActivity);

export default router;