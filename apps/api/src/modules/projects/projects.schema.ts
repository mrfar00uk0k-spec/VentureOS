import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(2).max(120),
  idea: z.string().min(10).max(2000),
  industry: z.string().optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  description: z.string().max(2000).optional(),
  industry: z.string().optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
