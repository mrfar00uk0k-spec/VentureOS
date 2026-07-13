import { NextFunction, Request, Response } from "express";
import { randomUUID } from "crypto";

export class AppError extends Error {
  constructor(public statusCode: number, message: string, public code = "APP_ERROR") {
    super(message);
  }
}

/**
 * Every error gets a unique ID and a friendly message. Internal details are
 * logged server-side only — the client never sees a stack trace.
 */
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  const errorId = randomUUID();
  const isAppError = err instanceof AppError;

  console.error(
    JSON.stringify({
      errorId,
      requestId: (req as Request & { requestId?: string }).requestId,
      path: req.path,
      message: err instanceof Error ? err.message : "Unknown error",
    })
  );

  res.status(isAppError ? err.statusCode : 500).json({
    error: {
      id: errorId,
      message: isAppError ? err.message : "Something went wrong. Our team has been notified.",
      code: isAppError ? err.code : "INTERNAL_ERROR",
    },
  });
}
