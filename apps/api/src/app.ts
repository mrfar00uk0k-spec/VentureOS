import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { requestId } from "./middleware/requestId";
import { errorHandler } from "./middleware/errorHandler";
import { rateLimiter } from "./middleware/rateLimiter";
import { authRouter } from "./modules/auth/auth.routes";
import { projectsRouter } from "./modules/projects/projects.routes";
import { analysisRouter } from "./modules/analysis/analysis.routes";
import { billingRouter } from "./modules/billing/billing.routes";
import { billingController } from "./modules/billing/billing.controller";
import { exportRouter } from "./modules/export/export.routes";
import { adminRouter } from "./modules/admin/admin.routes";
import { asyncHandler } from "./utils/asyncHandler";

export function createApp() {
  const app = express();

  app.use(helmet());
  // `credentials: true` + an explicit origin (not "*") is required for the
  // browser to accept the httpOnly refresh-token cookie cross-origin.
  app.use(
    cors({
      origin: process.env.WEB_APP_URL ?? "http://localhost:3000",
      credentials: true,
    })
  );

  // Stripe's webhook signature check needs the EXACT raw request body, so
  // this route (handler included) is registered before express.json() runs
  // for anything else. Once this handler responds, the request never
  // reaches the JSON parser below — see billing.routes.ts for why the
  // /webhook path isn't defined there instead.
  app.post(
    "/api/v1/billing/webhook",
    express.raw({ type: "application/json" }),
    asyncHandler(billingController.webhook)
  );

  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());
  app.use(requestId);
  app.use(rateLimiter);

  app.get("/api/v1/health", (_req, res) => res.json({ status: "ok" }));
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/projects", projectsRouter);
  app.use("/api/v1/analysis", analysisRouter);
  app.use("/api/v1/billing", billingRouter); // /checkout — /webhook is above
  app.use("/api/v1/reports", exportRouter);
  app.use("/api/v1/admin", adminRouter);

  // Must be registered last — Express only treats a 4-arg middleware as an
  // error handler if it comes after every other app.use()/route.
  app.use(errorHandler);

  return app;
}
