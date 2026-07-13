import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const adminService = {
  async listUsers() {
    return prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, credits: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
  },

  async listProjects() {
    return prisma.project.findMany({
      include: { owner: { select: { email: true } } },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
  },

  async stats() {
    const [userCount, projectCount, completedCount, avgScoreAgg] = await Promise.all([
      prisma.user.count(),
      prisma.project.count(),
      prisma.project.count({ where: { status: "COMPLETED" } }),
      prisma.project.aggregate({ _avg: { currentAiScore: true }, where: { status: "COMPLETED" } }),
    ]);

    return {
      userCount,
      projectCount,
      completedCount,
      averageScore: avgScoreAgg._avg.currentAiScore ? Math.round(avgScoreAgg._avg.currentAiScore) : null,
    };
  },
};
