import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { AppError } from "../../middleware/errorHandler";
import { generateOpaqueToken, generateRefreshToken, hashToken, signAccessToken } from "./tokens";
import type { LoginInput, RegisterInput } from "./auth.schema";

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;

interface RequestMeta {
  userAgent?: string;
  ipAddress?: string;
}

function toPublicUser(user: {
  id: string;
  email: string;
  name: string | null;
  role: string;
  emailVerified: boolean;
}) {
  return { id: user.id, email: user.email, name: user.name, role: user.role, emailVerified: user.emailVerified };
}

/**
 * Creates a new refresh-token session for a user. Exported (not just used
 * internally) so the OAuth callbacks in auth.controller.ts can issue a
 * session the same way password login does.
 */
export async function issueSession(userId: string, meta: RequestMeta) {
  const refresh = generateRefreshToken();
  await prisma.session.create({
    data: {
      userId,
      refreshTokenHash: refresh.hash,
      expiresAt: refresh.expiresAt,
      userAgent: meta.userAgent,
      ipAddress: meta.ipAddress,
    },
  });
  return refresh.token;
}

export const authService = {
  async register(input: RegisterInput) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw new AppError(409, "An account with this email already exists.", "EMAIL_TAKEN");
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
    const emailVerificationToken = generateOpaqueToken();

    const user = await prisma.user.create({
      data: { email: input.email, name: input.name, passwordHash, emailVerificationToken },
    });

    // NOTE: no email provider is configured in this scaffold — logging the
    // link stands in for actually sending it. Wire up a real provider
    // (Resend, Postmark, SES, ...) before shipping this.
    console.log(`[auth] Verification link for ${user.email}: /verify-email?token=${emailVerificationToken}`);

    return toPublicUser(user);
  },

  async login(input: LoginInput, meta: RequestMeta) {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user || !user.passwordHash) {
      throw new AppError(401, "Invalid email or password.", "INVALID_CREDENTIALS");
    }

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      throw new AppError(401, "Invalid email or password.", "INVALID_CREDENTIALS");
    }

    const accessToken = signAccessToken({ sub: user.id, role: user.role });
    const refreshToken = await issueSession(user.id, meta);

    return { user: toPublicUser(user), accessToken, refreshToken };
  },

  async refresh(refreshToken: string | undefined, meta: RequestMeta) {
    if (!refreshToken) {
      throw new AppError(401, "Missing refresh token.", "UNAUTHENTICATED");
    }

    const session = await prisma.session.findUnique({ where: { refreshTokenHash: hashToken(refreshToken) } });
    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      throw new AppError(401, "Refresh token is invalid or expired.", "UNAUTHENTICATED");
    }

    // Rotate on every use: revoke the token that was just presented and
    // issue a new one. A leaked refresh token can then only ever be
    // replayed once before both the thief's and the real user's copies
    // stop working — a strong signal something is wrong.
    await prisma.session.update({ where: { id: session.id }, data: { revokedAt: new Date() } });

    const user = await prisma.user.findUniqueOrThrow({ where: { id: session.userId } });
    const accessToken = signAccessToken({ sub: user.id, role: user.role });
    const newRefreshToken = await issueSession(user.id, meta);

    return { user: toPublicUser(user), accessToken, refreshToken: newRefreshToken };
  },

  async logout(refreshToken: string | undefined) {
    if (!refreshToken) return;
    await prisma.session
      .updateMany({
        where: { refreshTokenHash: hashToken(refreshToken), revokedAt: null },
        data: { revokedAt: new Date() },
      })
      .catch(() => undefined);
  },

  async requestPasswordReset(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    // Respond identically whether or not the account exists, so this
    // endpoint can never be used to enumerate registered emails.
    if (!user) return;

    const token = generateOpaqueToken();
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordResetToken: token, passwordResetExpiresAt: new Date(Date.now() + 60 * 60 * 1000) },
    });

    console.log(`[auth] Password reset link for ${email}: /reset-password?token=${token}`);
  },

  async resetPassword(token: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { passwordResetToken: token } });
    if (!user || !user.passwordResetExpiresAt || user.passwordResetExpiresAt < new Date()) {
      throw new AppError(400, "This reset link is invalid or has expired.", "INVALID_RESET_TOKEN");
    }

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, passwordResetToken: null, passwordResetExpiresAt: null },
    });

    // A password reset logs every other device out.
    await prisma.session.updateMany({ where: { userId: user.id, revokedAt: null }, data: { revokedAt: new Date() } });
  },

  async verifyEmail(token: string) {
    const user = await prisma.user.findUnique({ where: { emailVerificationToken: token } });
    if (!user) {
      throw new AppError(400, "This verification link is invalid.", "INVALID_VERIFICATION_TOKEN");
    }
    await prisma.user.update({ where: { id: user.id }, data: { emailVerified: true, emailVerificationToken: null } });
  },

  async findOrCreateFromOAuth(profile: { email: string; name?: string }) {
    let user = await prisma.user.findUnique({ where: { email: profile.email } });
    if (!user) {
      user = await prisma.user.create({
        data: { email: profile.email, name: profile.name, emailVerified: true },
      });
    }
    return user;
  },
};
