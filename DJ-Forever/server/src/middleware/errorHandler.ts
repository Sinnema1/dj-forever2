import { Request, Response, NextFunction } from 'express';

interface CustomError extends Error {
  statusCode?: number;
  extensions?: {
    code?: string;
    [key: string]: any;
  };
}

/**
 * Centralized error handling middleware for Express.
 * Sends consistent, structured error responses.
 */
export const errorHandler = (
  err: CustomError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = err.statusCode || 500;

  // Log error details
  console.error(`Error (${statusCode}): ${err.message}`);

  // Basic structure for JSON responses
  const response = {
    success: false,
    message: err.message || 'Internal Server Error',
    extensions: err.extensions || {
      code: mapStatusCodeToCode(statusCode),
    },
    // Optionally include stack traces in development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  res.status(statusCode).json(response);
};

/**
 * Utility to create a standardized error with status code and GraphQL extension code.
 *
 * @param message - Error message.
 * @param statusCode - HTTP status code.
 * @param code - GraphQL extension code (optional).
 * @returns Custom error object with `statusCode` and `extensions`.
 */
export const createError = (
  message: string,
  statusCode = 500,
  code?: string
): CustomError => {
  const error = new Error(message) as CustomError;
  error.statusCode = statusCode;
  error.extensions = {
    code: code || mapStatusCodeToCode(statusCode),
  };
  return error;
};

/**
 * Maps HTTP status codes to logical GraphQL `extensions.code`.
 *
 * @param statusCode - HTTP status code.
 * @returns GraphQL error code.
 */
const mapStatusCodeToCode = (statusCode: number): string => {
  switch (statusCode) {
    case 400:
      return 'BAD_USER_INPUT';
    case 401:
      return 'UNAUTHENTICATED';
    case 403:
      return 'FORBIDDEN';
    case 404:
      return 'NOT_FOUND';
    case 409:
      return 'CONFLICT';
    case 500:
    default:
      return 'INTERNAL_SERVER_ERROR';
  }
};