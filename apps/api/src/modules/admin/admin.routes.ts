import { Router } from "express";
import { requireAuth, requireAdmin } from "../../middleware/auth";
import { asyncHandler } from "../../utils/asyncHandler";
import { adminController } from "./admin.controller";

export const adminRouter = Router();

adminRouter.use(requireAuth, requireAdmin);
adminRouter.get("/users", asyncHandler(adminController.users));
adminRouter.get("/projects", asyncHandler(adminController.projects));
adminRouter.get("/stats", asyncHandler(adminController.stats));
