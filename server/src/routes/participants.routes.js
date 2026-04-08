import { Router } from "express";
import { z } from "zod";

import {
  getParticipantById,
  listParticipants,
  updateParticipant,
} from "../controllers/participants.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { requireRole, requireSelfOrRole } from "../middleware/rbac.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { ROLES } from "../../../shared/constants.js";

const router = Router();

const participantUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.enum(Object.values(ROLES)).optional(),
}).partial();

router.get("/", authMiddleware, requireRole(ROLES.ORGANIZER, ROLES.ADMIN), listParticipants);
router.get("/:id", authMiddleware, requireSelfOrRole("id", ROLES.ORGANIZER, ROLES.ADMIN), getParticipantById);
router.patch("/:id", authMiddleware, requireSelfOrRole("id", ROLES.ORGANIZER, ROLES.ADMIN), validate(participantUpdateSchema, "body"), updateParticipant);

export default router;