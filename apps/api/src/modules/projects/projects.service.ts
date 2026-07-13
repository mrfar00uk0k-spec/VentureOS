import { PrismaClient } from "@prisma/client";
import { CreateProjectInput, UpdateProjectInput } from "./projects.schema";

const prisma = new PrismaClient();

export const projectsService = {
  async create(ownerId: string, input: CreateProjectInput) {
    return prisma.project.create({
      data: {
        ownerId,
        name: input.name,
        idea: input.idea,
        industry: input.industry,
      },
    });
  },

  async listForUser(ownerId: string) {
    return prisma.project.findMany({
      where: { ownerId },
      orderBy: { createdAt: "desc" },
    });
  },

  async getById(id: string, ownerId: string) {
    return prisma.project.findFirst({ where: { id, ownerId } });
  },

  async getLatestAnalysisSession(projectId: string, ownerId: string) {
    const project = await prisma.project.findFirst({ where: { id: projectId, ownerId } });
    if (!project) return null;
    return prisma.analysisSession.findFirst({ where: { projectId }, orderBy: { startedAt: "desc" } });
  },

  async getLatestReport(projectId: string, ownerId: string) {
    const project = await prisma.project.findFirst({ where: { id: projectId, ownerId } });
    if (!project) return null;
    return prisma.report.findFirst({ where: { projectId }, orderBy: { createdAt: "desc" } });
  },

  async update(id: string, ownerId: string, input: UpdateProjectInput) {
    const project = await prisma.project.findFirst({ where: { id, ownerId } });
    if (!project) return null;
    return prisma.project.update({ where: { id }, data: input });
  },

  async remove(id: string, ownerId: string) {
    const project = await prisma.project.findFirst({ where: { id, ownerId } });
    if (!project) return false;
    // Deletes the project's dependent rows first — Postgres would otherwise
    // reject the delete on the foreign key constraints.
    await prisma.$transaction([
      prisma.report.deleteMany({ where: { projectId: id } }),
      prisma.gapDetection.deleteMany({ where: { projectId: id } }),
      prisma.marketAnalysis.deleteMany({ where: { projectId: id } }),
      prisma.redditInsight.deleteMany({ where: { projectId: id } }),
      prisma.review.deleteMany({ where: { projectId: id } }),
      prisma.keyword.deleteMany({ where: { projectId: id } }),
      prisma.competitor.deleteMany({ where: { projectId: id } }),
      prisma.analysisSession.deleteMany({ where: { projectId: id } }),
      prisma.project.delete({ where: { id } }),
    ]);
    return true;
  },
};
