import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { authRateLimiter } from "../../middleware/rateLimiter";
import { authController } from "./auth.controller";

export const authRouter = Router();

authRouter.post("/register", authRateLimiter, asyncHandler(authController.register));
authRouter.post("/login", authRateLimiter, asyncHandler(authController.login));
authRouter.post("/refresh", asyncHandler(authController.refresh));
authRouter.post("/logout", asyncHandler(authController.logout));
authRouter.post("/password-reset/request", authRateLimiter, asyncHandler(authController.requestPasswordReset));
authRouter.post("/password-reset/confirm", authRateLimiter, asyncHandler(authController.resetPassword));
authRouter.get("/verify-email/:token", asyncHandler(authController.verifyEmail));

authRouter.get("/google", authController.redirectToGoogle);
authRouter.get("/google/callback", asyncHandler(authController.googleCallback));
authRouter.get("/github", authController.redirectToGithub);
authRouter.get("/github/callback", asyncHandler(authController.githubCallback));
