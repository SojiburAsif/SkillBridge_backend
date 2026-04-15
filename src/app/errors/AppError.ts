import { StatusCodes } from "http-status-codes";

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR, message: string, stack = "") {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}