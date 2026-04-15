import { NextFunction, Request, Response } from "express";
import { Prisma } from "../../../generated/prisma/client";
import { ZodError } from "zod";
import { StatusCodes } from "http-status-codes";
import { AppError } from "../errors/AppError";

export const errorHandler = (
    err: any,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    let statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    let message = err.message || "Something went wrong! Please try again later.";
    let errorSources = [
        {
            path: "",
            message: err.message,
        },
    ];

    if (err instanceof ZodError) {
        statusCode = StatusCodes.BAD_REQUEST;
        message = "Validation Error";
        errorSources = err.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
        }));
    } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2002") {
            statusCode = StatusCodes.CONFLICT;
            message = "Duplicate Entry Error";
            errorSources = [{ path: "", message: `${err.meta?.target} must be unique` }];
        } else if (err.code === "P2025") {
            statusCode = StatusCodes.NOT_FOUND;
            message = "Record not found.";
            errorSources = [{ path: "", message: "Record does not exist." }];
        }
    } else if (err instanceof Prisma.PrismaClientValidationError) {
        statusCode = StatusCodes.BAD_REQUEST;
        message = "Database Validation Error";
        errorSources = [{ path: "", message: err.message }];
    } else if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
        errorSources = [{ path: "", message: err.message }];
    } else if (
        err instanceof SyntaxError &&
        typeof err.message === "string" &&
        (err.message.includes("JSON") || err.message.includes("control character"))
    ) {
        statusCode = StatusCodes.BAD_REQUEST;
        message = "Invalid JSON body. Escape special characters in strings.";
        errorSources = [{ path: "", message: err.message }];
    }

    res.status(statusCode).json({
        success: false,
        message,
        // Backward-compatible single error field (some clients expect this)
        error: message,
        errorSources,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
};
