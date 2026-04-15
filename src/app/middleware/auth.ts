import { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken";
import { envConfig } from "../config/env";
import { prisma } from "../lib/prisma";


declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string,
                name: string,
                role: string,
                emailVerified: boolean;
            }
        }
    }
}

export enum UserRole {
    STUDENT = "STUDENT",
    TUTOR = "TUTOR",
    ADMIN = "ADMIN"
}

export const auth = (...roles: UserRole[]) => {
    return async (req: Request, Res: Response, next: NextFunction) => {
        try {
            const token = req.headers.authorization?.split(" ")[1];

            if (!token) {
                return Res.status(401).json({
                    message: "You are not authorized to access this resource"
                });
            }

            const decoded = jwt.verify(token, envConfig.jwt_access_secret) as any;

            if (!decoded || !decoded.userId) {
                return Res.status(401).json({
                    message: "Invalid or expired token"
                });
            }

            const dbUser = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: { id: true, email: true, name: true, role: true, emailVerified: true }
            });

            if (!dbUser) {
                return Res.status(401).json({
                    message: "User not found"
                });
            }

            req.user = {
                id: dbUser.id,
                email: dbUser.email,
                name: dbUser.name,
                role: dbUser.role ?? UserRole.STUDENT,
                emailVerified: dbUser.emailVerified
            }

            const normalizedAllowedRoles = roles.map((role) => role.toUpperCase());

            if (
                normalizedAllowedRoles.length &&
                !normalizedAllowedRoles.includes((req.user?.role ?? "").toUpperCase())
            ) {
                return Res.status(403).json({
                    success: false,
                    error: "FORBIDDEN",
                    message: "You do not have permission to access this resource"
                });
            }

            next();

        } catch (err) {
            Res.status(401).json({ message: "Unauthorized" });
        }
    }
}