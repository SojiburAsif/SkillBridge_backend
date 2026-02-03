import { betterAuth, string } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";


export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    trustedOrigins: [process.env.APP_URL!, "https://skill-bridge-fontend-five.vercel.app"],
    user: {
        additionalFields: {
            role: {
                type: "string",
                defaultValue: "STUDENT",
            },
            phone: {
                type: "string",
                required: false
            },
            status: {
                type: "string",
                defaultValue: "ACTIVE",
                required: false
            }
        }
    },
    emailAndPassword: {
        enabled: true,
        autoSignIn: false,
        requireEmailVerification: false,
    },

    socialProviders: {
        google: {
            accessType: "offline",
            prompt: "select_account consent",
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
    },
    session: {
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60, // 5 minutes
        },
    },

    advanced: {
        crossSubDomainCookies: {
            enabled: false,
        },
        cookiePrefix: "better-auth",
        defaultCookieAttributes: {
            sameSite: "none",
            secure: true,
            httpOnly: true,

            //extra
            path: "/",
        },
        trustProxy: true,
        cookies: {
            state: {
                attributes: {
                    sameSite: "none",
                    secure: true,
                    // extra
                    path: "/",
                },
            },
        },
        disableCSRFCheck: true
    },



});