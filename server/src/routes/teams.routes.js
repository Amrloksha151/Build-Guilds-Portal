import express from "express";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { organizersMiddleware } from "../middleware/organizers.middleware.js"
import teamsController from "../controllers/teams.controller.js"
import { validate } from "../middleware/validate.middleware.js";

const router = express.Router();

const creationSchema = z
.object({
    name: z.string().min(1).max(50)
}).strict();

const updatingSchema = z
.object({
    score: z.bigint()
}).strict();

router.get("/", authMiddleware, teamsController.listTeams)
router.get("/my-team", authMiddleware, teamsController.userTeam)
router.put("/update/:teamId", authMiddleware, organizersMiddleware, validate(updatingSchema), teamsController.updateTeam)
router.post("/create", authMiddleware, validate(creationSchema), teamsController.createTeam)

export default router;