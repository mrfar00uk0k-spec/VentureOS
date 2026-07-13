import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { asyncHandler } from "../../utils/asyncHandler";
import { analysisController } from "./analysis.controller";

export const analysisRouter = Router();

analysisRouter.use(requireAuth);
analysisRouter.post("/start", asyncHandler(analysisController.start));
analysisRouter.get("/:id", asyncHandler(analysisController.getStatus));
