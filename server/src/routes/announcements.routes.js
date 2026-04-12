import express from "express";
import { z } from "zod";
import { validate } from "../middleware/validate.middleware.js";
import announcementController from "../controllers/announcements.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import organizersMiddleware from "../middleware/organizers.middleware.js";

const router = express.Router();

const announcementSchema = z
.object({
    content: z.string().min(1, "Content is required").max(5000, "Content must not exceed 5000 characters"),
});

router.get("/", authMiddleware, announcementController.getAnnouncements);
router.post(
    "/create",
    authMiddleware,
    organizersMiddleware,
    validate(announcementSchema),
    announcementController.createAnnouncement
);

export default router;