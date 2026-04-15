import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { envConfig } from "../config/env";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    trustedOrigins: [envConfig.app_url, "https://skill-bridge-fontend-five.vercel.app"],
    
    // databaseHooks: {
    //     user: {
    //         create: {
    //             after: async (user) => {
    //                 // Profile creation moved to auth.controller.ts directly 
    //                 // to handle custom fields via request body dynamically and rollbacks.
    //             }
    //         }
    //     }
    // },
    
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
            clientId: envConfig.google_client_id,
            clientSecret: envConfig.google_client_secret,
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