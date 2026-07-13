import { Request, Response } from "express";
import { randomBytes } from "crypto";
import { AppError } from "../../middleware/errorHandler";
import { loginSchema, registerSchema, requestPasswordResetSchema, resetPasswordSchema } from "./auth.schema";
import { authService, issueSession } from "./auth.service";
import { googleOAuth, githubOAuth } from "./oauth.service";
import { signAccessToken } from "./tokens";

const REFRESH_COOKIE = "refresh_token";
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/api/v1/auth",
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

function requestMeta(req: Request) {
  return { userAgent: req.headers["user-agent"], ipAddress: req.ip };
}

function webAppUrl() {
  return process.env.WEB_APP_URL ?? "http://localhost:3000";
}

async function completeOAuthLogin(req: Request, res: Response, profile: { email: string; name?: string }) {
  const user = await authService.findOrCreateFromOAuth(profile);
  const accessToken = signAccessToken({ sub: user.id, role: user.role });
  const refreshToken = await issueSession(user.id, requestMeta(req));
  res.cookie(REFRESH_COOKIE, refreshToken, REFRESH_COOKIE_OPTIONS);
  res.redirect(`${webAppUrl()}/auth/callback?accessToken=${accessToken}`);
}

export const authController = {
  async register(req: Request, res: Response) {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(400, parsed.error.message, "VALIDATION_ERROR");
    const user = await authService.register(parsed.data);
    res.status(201).json({ data: user });
  },

  async login(req: Request, res: Response) {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(400, parsed.error.message, "VALIDATION_ERROR");
    const { user, accessToken, refreshToken } = await authService.login(parsed.data, requestMeta(req));
    res.cookie(REFRESH_COOKIE, refreshToken, REFRESH_COOKIE_OPTIONS);
    res.json({ data: { user, accessToken } });
  },

  async refresh(req: Request, res: Response) {
    const token = req.cookies?.[REFRESH_COOKIE];
    const { user, accessToken, refreshToken } = await authService.refresh(token, requestMeta(req));
    res.cookie(REFRESH_COOKIE, refreshToken, REFRESH_COOKIE_OPTIONS);
    res.json({ data: { user, accessToken } });
  },

  async logout(req: Request, res: Response) {
    const token = req.cookies?.[REFRESH_COOKIE];
    await authService.logout(token);
    res.clearCookie(REFRESH_COOKIE, { path: "/api/v1/auth" });
    res.status(204).send();
  },

  async requestPasswordReset(req: Request, res: Response) {
    const parsed = requestPasswordResetSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(400, parsed.error.message, "VALIDATION_ERROR");
    await authService.requestPasswordReset(parsed.data.email);
    res.json({ data: { message: "If that email exists, a reset link has been sent." } });
  },

  async resetPassword(req: Request, res: Response) {
    const parsed = resetPasswordSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(400, parsed.error.message, "VALIDATION_ERROR");
    await authService.resetPassword(parsed.data.token, parsed.data.newPassword);
    res.json({ data: { message: "Password updated. Please log in again." } });
  },

  async verifyEmail(req: Request, res: Response) {
    await authService.verifyEmail(req.params.token);
    res.json({ data: { message: "Email verified." } });
  },

  redirectToGoogle(_req: Request, res: Response) {
    const state = randomBytes(16).toString("hex");
    res.cookie("oauth_state", state, { httpOnly: true, sameSite: "lax", maxAge: 5 * 60 * 1000 });
    res.redirect(googleOAuth.getAuthUrl(state));
  },

  async googleCallback(req: Request, res: Response) {
    const { code, state } = req.query;
    if (!code || typeof code !== "string" || state !== req.cookies?.oauth_state) {
      throw new AppError(400, "Invalid OAuth callback.", "OAUTH_ERROR");
    }
    const profile = await googleOAuth.exchangeCode(code);
    await completeOAuthLogin(req, res, profile);
  },

  redirectToGithub(_req: Request, res: Response) {
    const state = randomBytes(16).toString("hex");
    res.cookie("oauth_state", state, { httpOnly: true, sameSite: "lax", maxAge: 5 * 60 * 1000 });
    res.redirect(githubOAuth.getAuthUrl(state));
  },

  async githubCallback(req: Request, res: Response) {
    const { code, state } = req.query;
    if (!code || typeof code !== "string" || state !== req.cookies?.oauth_state) {
      throw new AppError(400, "Invalid OAuth callback.", "OAUTH_ERROR");
    }
    const profile = await githubOAuth.exchangeCode(code);
    await completeOAuthLogin(req, res, profile);
  },
};
