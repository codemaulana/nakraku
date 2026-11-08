import { z } from "zod";

export const AppErrorTypeSchema = z.enum([
  "Db",
  "Os",
  "Core",
  "License",
  "Ws",
  "Validation",
  "Internal",
]);

export type AppErrorType = z.infer<typeof AppErrorTypeSchema>;

export const AppErrorPayloadSchema = z.object({
  type: AppErrorTypeSchema,
  details: z.string(),
});

export type AppErrorPayload = z.infer<typeof AppErrorPayloadSchema>;

export class AppError extends Error {
  public readonly errorType: AppErrorType;
  public readonly details: string;

  constructor(errorType: AppErrorType, details: string) {
    super(`[${errorType}] ${details}`);
    this.name = "AppError";
    this.errorType = errorType;
    this.details = details;
  }

  public static fromUnknown(err: unknown): AppError {
    if (err instanceof AppError) {
      return err;
    }

    if (typeof err === "object" && err !== null && "type" in err && "details" in err) {
      const parsed = AppErrorPayloadSchema.safeParse(err);
      if (parsed.success) {
        return new AppError(parsed.data.type, parsed.data.details);
      }
    }

    if (err instanceof Error) {
      return new AppError("Internal", err.message);
    }

    if (typeof err === "string") {
      try {
        const obj = JSON.parse(err);
        const parsed = AppErrorPayloadSchema.safeParse(obj);
        if (parsed.success) {
          return new AppError(parsed.data.type, parsed.data.details);
        }
      } catch {
        // Plain string message
      }
      return new AppError("Internal", err);
    }

    return new AppError("Internal", "An unknown error occurred");
  }

  public static isAppError(err: unknown): err is AppError {
    return err instanceof AppError;
  }
}
