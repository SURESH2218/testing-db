import { ErrorResponse, ErrorCode, HttpStatus } from "../types/response.types";
import { AppError } from "../utils/errors.util";
import { env } from "../config/env.config";

/**
 * Global error handler for Elysia
 * Converts all errors to standardized error response format
 */
export const globalErrorHandler = ({ code, error, set, path }: any): ErrorResponse => {
  console.error("Error occurred:", error);

  // Handle custom AppError instances
  if (error instanceof AppError) {
    set.status = error.statusCode;
    return {
      success: false,
      error: {
        code: error.errorCode,
        message: error.message,
        details: error.details,
        ...(env.isDevelopment() && { stack: error.stack }),
      },
      timestamp: new Date().toISOString(),
      path,
    };
  }

  // Handle validation errors from Elysia/Zod
  if (code === "VALIDATION" || error.name === "ValidationError") {
    set.status = HttpStatus.BAD_REQUEST;
    return {
      success: false,
      error: {
        code: ErrorCode.VALIDATION_ERROR,
        message: "Validation failed",
        details: error.all || error.errors || error.message,
        ...(env.isDevelopment() && { stack: error.stack }),
      },
      timestamp: new Date().toISOString(),
      path,
    };
  }

  // Handle NOT_FOUND errors
  if (code === "NOT_FOUND") {
    set.status = HttpStatus.NOT_FOUND;
    return {
      success: false,
      error: {
        code: ErrorCode.NOT_FOUND,
        message: "Route not found",
        details: `The requested route ${path} does not exist`,
      },
      timestamp: new Date().toISOString(),
      path,
    };
  }

  // Handle parse errors
  if (code === "PARSE") {
    set.status = HttpStatus.BAD_REQUEST;
    return {
      success: false,
      error: {
        code: ErrorCode.BAD_REQUEST,
        message: "Invalid request body",
        details: error.message,
      },
      timestamp: new Date().toISOString(),
      path,
    };
  }

  // Handle unknown errors
  set.status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
  return {
    success: false,
    error: {
      code: error.code || ErrorCode.INTERNAL_ERROR,
      message: error.message || "An unexpected error occurred",
      ...(env.isDevelopment() && {
        stack: error.stack,
        details: error,
      }),
    },
    timestamp: new Date().toISOString(),
    path,
  };
};
