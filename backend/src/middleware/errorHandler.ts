import { ErrorRequestHandler, Response } from "express";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "../constants/http";
import { z } from "zod";
import AppError from "../utils/appError";
import { clearAuthCookies, REFRESH_PATH } from "../utils/cookies";
import multer from "multer";

const handleZodError = (res: Response, error: z.ZodError): void => {
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

const handleAppError = (res: Response, error: AppError): void => {
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
    handleZodError(res, error);
    return;
  }

  if (error instanceof AppError) {
    handleAppError(res, error);
    return;
  }

  // Handle Multer (file upload) errors explicitly for clearer feedback
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      res.status(413).json({
        message: "File too large. Maximum allowed size is 25 MB per file.",
        errorCode: error.code,
      });
      return;
    }
    res.status(BAD_REQUEST).json({
      message: error.message || "Upload error",
      errorCode: error.code,
    });
    return;
  }

  // Common upload/type errors propagated as regular Error
  if (typeof error?.message === "string") {
    if (error.message.includes("Only image and PDF files are allowed")) {
      res.status(BAD_REQUEST).json({
        message: "Only image and PDF files are allowed.",
        errorCode: "INVALID_FILE_TYPE",
      });
      return;
    }
  }

  res.status(INTERNAL_SERVER_ERROR).json({
    message: error.message || "Internal Server Error",
    errorCode: "UNKNOWN_ERROR",
  });
};

export default errorHandler;
