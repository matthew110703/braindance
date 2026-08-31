import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { ApiError } from "../utils/apiError.js";
import { env } from "../config/env.config.js";
import { logger } from "../config/logger.config.js";

export const errorHandlerMiddleware: ErrorRequestHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let error = err;

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const flattened = error.flatten();
    res.status(400).json({
      success: false,
      statusCode: 400,
      message: "Validation error",
      errors: flattened.fieldErrors,
    });
    return;
  }

  // Handle Mongoose duplicate key error
  if (error?.code === 11000) {
    const keys = Object.keys(error.keyValue || {});
    const message = `Duplicate value entered for ${keys.join(", ")} field(s)`;
    error = new ApiError(409, message);
  }

  // Handle Mongoose CastError (e.g. invalid ObjectId)
  if (error?.name === "CastError") {
    const message = `Invalid resource identifier: ${error.value}`;
    error = new ApiError(400, message);
  }

  // Handle Mongoose ValidationError
  if (error?.name === "ValidationError" && error.errors) {
    const messages = Object.values(error.errors).map((el: any) => el.message);
    error = new ApiError(400, "Validation Error", messages);
  }

  // Handle default or unknown errors
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || error.status || 500;
    const message = error.message || "Internal Server Error";
    error = new ApiError(statusCode, message, error?.errors || [], error.stack);
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

  res.status(error.statusCode).json({
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    errors: error.errors,
    ...(env.NODE_ENV === "development" ? { stack: error.stack } : {}),
  });
};
