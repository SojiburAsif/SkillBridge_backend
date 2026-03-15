import { NextFunction, Request, Response } from "express";

export type AppError = Error & {
    statusCode?: number;
    code?: string;
};

type AsyncHandler = (
    req: Request,
    res: Response,
    next: NextFunction
) => Promise<unknown>;

export const asyncHandler = (handler: AsyncHandler) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(handler(req, res, next)).catch(next);
    };
};

export const errorHandler = (
    err: AppError,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    const isJsonParseError =
        err instanceof SyntaxError &&
        typeof err.message === "string" &&
        (err.message.includes("JSON") || err.message.includes("control character"));

    if (isJsonParseError) {
        return res.status(400).json({
            success: false,
            error: "BAD_REQUEST",
            message:
                "Invalid JSON body. Escape special characters in strings (example: use \\n or \\t).",
        });
    }

    const statusCode = err.statusCode ?? 500;
    const code = err.code ?? (statusCode >= 500 ? "INTERNAL_SERVER_ERROR" : "BAD_REQUEST");
    const message = err.message || "Something went wrong";

    res.status(statusCode).json({
        success: false,
        error: code,
        message
    });
};
