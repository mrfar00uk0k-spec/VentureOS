import { Request, Response } from "express";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { AuthedRequest } from "../../middleware/auth";
import { AppError } from "../../middleware/errorHandler";
import { billingService } from "./billing.service";

const prisma = new PrismaClient();

const checkoutSchema = z.object({
  plan: z.enum(["starter", "pro"]),
});

export const billingController = {
  async createCheckout(req: AuthedRequest, res: Response) {
    const parsed = checkoutSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(400, parsed.error.message, "VALIDATION_ERROR");
    }

    const user = await prisma.user.findUniqueOrThrow({ where: { id: req.userId! } });
    const { url } = await billingService.createCheckoutSession(user.id, user.email, parsed.data.plan);
    res.json({ data: { url } });
  },

  async webhook(req: Request, res: Response) {
    const signature = req.headers["stripe-signature"];
    if (!signature || typeof signature !== "string") {
      throw new AppError(400, "Missing Stripe signature.", "INVALID_WEBHOOK");
    }
    // req.body is a raw Buffer here — see the express.raw() registration in app.ts.
    const result = await billingService.handleWebhookEvent(req.body as unknown as Buffer, signature);
    res.json(result);
  },
};
