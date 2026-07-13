import { Response } from "express";
import { AuthedRequest } from "../../middleware/auth";
import { AppError } from "../../middleware/errorHandler";
import { createProjectSchema, updateProjectSchema } from "./projects.schema";
import { projectsService } from "./projects.service";

export const projectsController = {
  async create(req: AuthedRequest, res: Response) {
    const parsed = createProjectSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(400, parsed.error.message, "VALIDATION_ERROR");
    }
    const project = await projectsService.create(req.userId!, parsed.data);
    res.status(201).json({ data: project });
  },

  async list(req: AuthedRequest, res: Response) {
    const projects = await projectsService.listForUser(req.userId!);
    res.json({ data: projects });
  },

  async getOne(req: AuthedRequest, res: Response) {
    const project = await projectsService.getById(req.params.id, req.userId!);
    if (!project) {
      throw new AppError(404, "Project not found.", "NOT_FOUND");
    }
    res.json({ data: project });
  },

  async getAnalysisSession(req: AuthedRequest, res: Response) {
    const session = await projectsService.getLatestAnalysisSession(req.params.id, req.userId!);
    if (!session) {
      throw new AppError(404, "No analysis session found for this project yet.", "NOT_FOUND");
    }
    res.json({ data: session });
  },

  async getReport(req: AuthedRequest, res: Response) {
    const report = await projectsService.getLatestReport(req.params.id, req.userId!);
    if (!report) {
      throw new AppError(404, "No report found for this project yet.", "NOT_FOUND");
    }
    res.json({ data: report });
  },

  async update(req: AuthedRequest, res: Response) {
    const parsed = updateProjectSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(400, parsed.error.message, "VALIDATION_ERROR");
    }
    const project = await projectsService.update(req.params.id, req.userId!, parsed.data);
    if (!project) {
      throw new AppError(404, "Project not found.", "NOT_FOUND");
    }
    res.json({ data: project });
  },

  async remove(req: AuthedRequest, res: Response) {
    const deleted = await projectsService.remove(req.params.id, req.userId!);
    if (!deleted) {
      throw new AppError(404, "Project not found.", "NOT_FOUND");
    }
    res.status(204).send();
  },
};
