import express from "express";
import {
  createAssessment,
  getAssessment,
  getHistory
} from "../controllers/assessment.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protect, createAssessment);
router.get("/history", protect, getHistory);
router.get("/:id", protect, getAssessment);

export default router;