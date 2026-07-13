import { Response } from "express";
import { z } from "zod";
import { AuthedRequest } from "../../middleware/auth";
import { AppError } from "../../middleware/errorHandler";
import { analysisService } from "./analysis.service";

const startAnalysisSchema = z.object({
  projectId: z.string().uuid(),
  idea: z.string().min(10).max(2000),
});

export const analysisController = {
  async start(req: AuthedRequest, res: Response) {
    const parsed = startAnalysisSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(400, parsed.error.message, "VALIDATION_ERROR");
    }
    // Returns immediately — the pipeline runs in the background via the job queue.
    const session = await analysisService.start(parsed.data.projectId, parsed.data.idea);
    res.status(202).json({ data: session });
  },

  async getStatus(req: AuthedRequest, res: Response) {
    const session = await analysisService.getStatus(req.params.id);
    if (!session) {
      throw new AppError(404, "Analysis session not found.", "NOT_FOUND");
    }
    res.json({ data: session });
  },
};
