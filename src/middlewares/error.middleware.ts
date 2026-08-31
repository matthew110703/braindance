import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { ApiError } from "../utils/apiError.js";

export const errorHandlerMiddleware: ErrorRequestHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    error = new ApiError(statusCode, message, error?.errors || [], error.stack);
  }

  const response = {
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    errors: error.errors,
    ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {}),
  };

  res.status(error.statusCode).json(response);
};
