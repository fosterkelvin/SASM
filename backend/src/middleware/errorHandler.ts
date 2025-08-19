import { ErrorRequestHandler, Response } from "express";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "../constants/http";
import { z } from "zod";
import AppError from "../utils/appError";
import { clearAuthCookies, REFRESH_PATH } from "../utils/cookies";

const handleZodError = (res: Response, error: z.ZodError) => {
  // Convert Zod errors to { field: message } format for frontend
  const fieldErrors: Record<string, string> = {};
  error.issues.forEach((err) => {
    if (err.path && err.path.length > 0) {
      fieldErrors[err.path[0]] = err.message;
    }
  });
  res.status(BAD_REQUEST).json({
    message: error.message,
    errors: fieldErrors,
  });
};

const handleAppError = (res: Response, error: AppError) => {
  res.status(error.statusCode).json({
    message: error.message,
    errorCode: error.errorCode,
  });
};

const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  console.log(`PATH: ${req.path}`, error);

  if (req.path === REFRESH_PATH) {
    clearAuthCookies(res);
  }

  if (error instanceof z.ZodError) {
    return handleZodError(res, error);
  }

  if (error instanceof AppError) {
    return handleAppError(res, error);
  }

  res.status(INTERNAL_SERVER_ERROR).json({
    message: error.message || "Internal Server Error",
    errorCode: "UNKNOWN_ERROR",
  });
};

export default errorHandler;
