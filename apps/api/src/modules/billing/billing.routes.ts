import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { asyncHandler } from "../../utils/asyncHandler";
import { billingController } from "./billing.controller";

export const billingRouter = Router();

billingRouter.post("/checkout", requireAuth, asyncHandler(billingController.createCheckout));

// NOTE: the /webhook route is intentionally NOT here. Stripe's signature
// verification needs the exact raw request body, and by the time a
// request reaches a router mounted after express.json(), that raw body
// has already been parsed away. See app.ts for where it's actually
// registered (before the global JSON parser).
