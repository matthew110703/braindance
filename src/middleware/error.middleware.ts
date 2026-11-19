import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { ApiError } from "../utils/apiError.js";
import { env } from "../config/env.config.js";
import { logger } from "../config/logger.config.js";

interface MongoDuplicateKeyError {
  code: 11000;
  keyValue: Record<string, unknown>;
}

interface MongooseValidationError {
  name: "ValidationError";
  errors: Record<string, { message: string }>;
}

interface MongooseCastError {
  name: "CastError";
  value: unknown;
}

const isMongoDuplicateKeyError = (err: unknown): err is MongoDuplicateKeyError => {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: unknown }).code === 11000 &&
    "keyValue" in err
  );
};

const isMongooseValidationError = (err: unknown): err is MongooseValidationError => {
  return (
    typeof err === "object" &&
    err !== null &&
    "name" in err &&
    (err as { name: unknown }).name === "ValidationError" &&
    "errors" in err
  );
};

const isMongooseCastError = (err: unknown): err is MongooseCastError => {
  return (
    typeof err === "object" &&
    err !== null &&
    "name" in err &&
    (err as { name: unknown }).name === "CastError"
  );
};

export const errorHandlerMiddleware: ErrorRequestHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let error: ApiError;

  // Handle Zod validation errors with field-level path keys
  if (err instanceof ZodError) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of err.issues) {
      const key = issue.path.length > 0 ? issue.path.join(".") : "request";
      if (!fieldErrors[key]) {
        fieldErrors[key] = [];
      }
      fieldErrors[key].push(issue.message);
    }
    res.status(400).json({
      success: false,
      statusCode: 400,
      message: "Validation error",
      errors: fieldErrors,
    });
    return;
  }

  // Handle custom ApiError instances directly
  if (err instanceof ApiError) {
    error = err;
  } else if (isMongoDuplicateKeyError(err)) {
    const keys = Object.keys(err.keyValue);
    const message = `Duplicate value entered for ${keys.join(", ")} field(s)`;
    error = new ApiError(409, message);
  } else if (isMongooseCastError(err)) {
    const message = `Invalid resource identifier: ${String(err.value)}`;
    error = new ApiError(400, message);
  } else if (isMongooseValidationError(err)) {
    const messages = Object.values(err.errors).map((el) => el.message);
    error = new ApiError(400, "Validation Error", messages);
  } else if (err instanceof Error) {
    const customStatus =
      "statusCode" in err && typeof err.statusCode === "number"
        ? err.statusCode
        : "status" in err && typeof err.status === "number"
        ? err.status
        : 500;
    error = new ApiError(customStatus, err.message, [], err.stack);
  } else {
    error = new ApiError(500, typeof err === "string" ? err : "An unexpected error occurred");
  }

  // Log server errors (500s)
  if (error.statusCode >= 500) {
    logger.error(
      {
        err: error,
        url: req.originalUrl,
        method: req.method,
      },
      `💥 Server Error: ${error.message}`
    );
  }

  const publicMessage =
    error.statusCode >= 500 && env.NODE_ENV === "production"
      ? "Internal server error"
      : error.message;

  res.status(error.statusCode).json({
    success: false,
    statusCode: error.statusCode,
    message: publicMessage,
    errors: error.errors,
    ...(env.NODE_ENV === "development" ? { stack: error.stack } : {}),
  });
};
