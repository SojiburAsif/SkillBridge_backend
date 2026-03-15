import { NextFunction, Request, Response } from "express"
import { auth as BetterAuth } from "../lib/auth";
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
            const session = await BetterAuth.api.getSession({
                headers: req.headers as any
            });

            if (!session) {
                return Res.status(401).json({
                    message: "You are not authorized to access this resource"
                });
            }
            // if (!session.user.emailVerified) {
            //     return Res.status(401).json({
            //         message: "Please verify your email to access this resource"
            //     });
            // }


            let resolvedRole = ((session.user as any).role as string | undefined)?.trim().toUpperCase();

            if (!resolvedRole) {
                const dbUser = await prisma.user.findUnique({
                    where: { id: session.user.id },
                    select: { role: true }
                });
                resolvedRole = dbUser?.role;
            }

            req.user = {
                id: session.user.id,
                email: session.user.email,
                name: session.user.name,
                role: resolvedRole ?? UserRole.STUDENT,
                emailVerified: session.user.emailVerified
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