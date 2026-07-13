import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthedRequest } from "../../middleware/auth";
import { AppError } from "../../middleware/errorHandler";
import { exportService } from "./export.service";

const prisma = new PrismaClient();

export const exportController = {
  async export(req: AuthedRequest, res: Response) {
    const format = req.query.format;
    if (format !== "pdf" && format !== "markdown" && format !== "json") {
      throw new AppError(400, "format must be one of: pdf, markdown, json.", "VALIDATION_ERROR");
    }

    const exportRecord = await prisma.export.create({
      data: { reportId: req.params.id, format, status: "processing" },
    });

    try {
      if (format === "markdown") {
        const markdown = await exportService.generateMarkdown(req.params.id, req.userId!);
        await prisma.export.update({ where: { id: exportRecord.id }, data: { status: "completed" } });
        res.setHeader("Content-Type", "text/markdown; charset=utf-8");
        res.setHeader("Content-Disposition", "attachment; filename=report.md");
        return res.send(markdown);
      }

      if (format === "json") {
        const json = await exportService.generateJson(req.params.id, req.userId!);
        await prisma.export.update({ where: { id: exportRecord.id }, data: { status: "completed" } });
        return res.json(json);
      }

      const pdf = await exportService.generatePdf(req.params.id, req.userId!);
      await prisma.export.update({ where: { id: exportRecord.id }, data: { status: "completed" } });
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=report.pdf");
      return res.send(pdf);
    } catch (error) {
      await prisma.export
        .update({ where: { id: exportRecord.id }, data: { status: "failed" } })
        .catch(() => undefined);
      throw error;
    }
  },
};
