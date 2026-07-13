import PDFDocument from "pdfkit";
import { PrismaClient } from "@prisma/client";
import { AppError } from "../../middleware/errorHandler";

const prisma = new PrismaClient();

interface ReportPayload {
  verdict: string | null;
  biggestOpportunity: string | null;
  biggestRisk: string | null;
  competitors: Array<{ name: string; description: string }>;
  gaps: Array<{ title: string; businessOpportunity: string; impact: string }>;
}

async function getOwnedReport(reportId: string, ownerId: string) {
  const report = await prisma.report.findFirst({
    where: { id: reportId, project: { ownerId } },
  });
  if (!report) {
    throw new AppError(404, "Report not found.", "NOT_FOUND");
  }
  return report;
}

export const exportService = {
  async generateMarkdown(reportId: string, ownerId: string): Promise<string> {
    const report = await getOwnedReport(reportId, ownerId);
    const data = report.data as unknown as ReportPayload;

    return [
      `# Validation Report`,
      ``,
      `**Overall score:** ${report.overallScore}/100`,
      data.verdict ? `**Verdict:** ${data.verdict}` : null,
      ``,
      `## Summary`,
      report.summary,
      ``,
      `## Biggest opportunity`,
      data.biggestOpportunity ?? "Insufficient public evidence.",
      ``,
      `## Biggest risk`,
      data.biggestRisk ?? "Insufficient public evidence.",
      ``,
      `## Competitors`,
      ...(data.competitors ?? []).map((c) => `- **${c.name}** — ${c.description}`),
      ``,
      `## Gap detection`,
      ...(data.gaps ?? []).map((g) => `- **${g.title}** (${g.impact} impact) — ${g.businessOpportunity}`),
    ]
      .filter((line): line is string => line !== null)
      .join("\n");
  },

  async generateJson(reportId: string, ownerId: string) {
    return getOwnedReport(reportId, ownerId);
  },

  async generatePdf(reportId: string, ownerId: string): Promise<Buffer> {
    const report = await getOwnedReport(reportId, ownerId);
    const data = report.data as unknown as ReportPayload;

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];
      doc.on("data", (chunk) => chunks.push(chunk as Buffer));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      doc.fontSize(22).fillColor("#111318").text("Validation Report");
      doc.moveDown(0.5);
      doc.fontSize(14).fillColor("#3d6bff").text(`Overall score: ${report.overallScore}/100`);
      doc.fillColor("black");
      if (data.verdict) doc.fontSize(12).text(`Verdict: ${data.verdict}`);
      doc.moveDown();

      doc.fontSize(14).text("Summary");
      doc.fontSize(11).text(report.summary);
      doc.moveDown();

      doc.fontSize(14).text("Biggest opportunity");
      doc.fontSize(11).text(data.biggestOpportunity ?? "Insufficient public evidence.");
      doc.moveDown();

      doc.fontSize(14).text("Biggest risk");
      doc.fontSize(11).text(data.biggestRisk ?? "Insufficient public evidence.");
      doc.moveDown();

      doc.fontSize(14).text("Competitors");
      (data.competitors ?? []).forEach((c) => doc.fontSize(11).text(`\u2022 ${c.name} \u2014 ${c.description}`));
      doc.moveDown();

      doc.fontSize(14).text("Gap Detection");
      (data.gaps ?? []).forEach((g) =>
        doc.fontSize(11).text(`\u2022 ${g.title} (${g.impact} impact) \u2014 ${g.businessOpportunity}`)
      );

      doc.end();
    });
  },
};
