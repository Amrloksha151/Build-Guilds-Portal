import { Router } from "express";

import {
  getLeaderboardById,
  listLeaderboard,
  recalculateLeaderboard,
} from "../controllers/leaderboard.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/rbac.middleware.js";
import { ROLES } from "../../../shared/constants.js";

const router = Router();

router.get("/", listLeaderboard);
router.get("/:id", getLeaderboardById);
router.post("/:id/recalculate", authMiddleware, requireRole(ROLES.ADMIN), recalculateLeaderboard);

export default router;