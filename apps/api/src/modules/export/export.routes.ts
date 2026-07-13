import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { asyncHandler } from "../../utils/asyncHandler";
import { exportController } from "./export.controller";

export const exportRouter = Router();

exportRouter.use(requireAuth);
// GET /api/v1/reports/:id?format=pdf|markdown|json
exportRouter.get("/:id", asyncHandler(exportController.export));
