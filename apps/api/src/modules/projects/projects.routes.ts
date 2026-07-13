import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { asyncHandler } from "../../utils/asyncHandler";
import { projectsController } from "./projects.controller";

export const projectsRouter = Router();

projectsRouter.use(requireAuth);
projectsRouter.post("/", asyncHandler(projectsController.create));
projectsRouter.get("/", asyncHandler(projectsController.list));
projectsRouter.get("/:id", asyncHandler(projectsController.getOne));
projectsRouter.get("/:id/analysis", asyncHandler(projectsController.getAnalysisSession));
projectsRouter.get("/:id/report", asyncHandler(projectsController.getReport));
projectsRouter.patch("/:id", asyncHandler(projectsController.update));
projectsRouter.delete("/:id", asyncHandler(projectsController.remove));
