import { betterAuth, string } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import nodemailler from "nodemailer";

// If your Prisma file is located elsewhere, you can change the path
// const nodemailer = require("nodemailer");

// const transporter = nodemailler.createTransport({
//     host: "smtp.gmail.com",
//     port: 587,
//     secure: false, // Use true for port 465, false for port 587
//     auth: {
//         user: process.env.APP_EMAIL,
//         pass: process.env.APP_PASS,
//     },
// });

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", 
    }),
    trustedOrigins: [process.env.APP_URL!],
    user: {
        additionalFields: {
            role: {
                type: "string",
                defaultValue: "STUDENT",
                required: false
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
    // emailVerification: {
    //     sendOnSignUp: true,
    //     autoSignInAfterVerification: true,
    //     sendVerificationEmail: async ({ user, url, token }, request) => {
    //         try {
    //             const verification_url = `${process.env.APP_URL}/verify-email?token=${token}`;
    //             const info = await transporter.sendMail({
    //                 from: '"Sojibur Asif" <maddison53@ethereal.email>',
    //                 to: user.email,
    //                 subject: "Verify Your Email ✔",
    //                 text: `Hi ${user.name || "User"}, please verify your email by clicking the link: ${verification_url}`,
    //                 html: `
    //     <div style="font-family: Arial, sans-serif; color: #333;">
    //         <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; background-color: #f9f9f9;">
    //             <h2 style="color: #4CAF50;">Welcome to Our Platform, ${user.name || "User"}!</h2>
    //             <p>Thank you for signing up. To get started, please verify your email address by clicking the button below:</p>
    //             <a href="${verification_url}" 
    //                style="display: inline-block; padding: 12px 24px; margin: 20px 0; font-size: 16px; color: #fff; background-color: #4CAF50; text-decoration: none; border-radius: 5px;">
    //                Verify Email
    //             </a>
    //             <p>If the button doesn’t work, copy and paste the following link into your browser:</p>
    //             <p style="word-break: break-all;"><a href="${verification_url}">${verification_url}</a></p>
    //             <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
    //             <p style="font-size: 12px; color: #888;">If you did not create an account, no further action is required.</p>
    //         </div>
    //     </div>
    //     `
    //             });
    //             console.log(info);
    //         } catch (err: any) {
    //             console.log(err);
    //         }
    //     }
    // },


    socialProviders: {
        google: {
            accessType: "offline",
            prompt: "select_account consent",
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
    },



});