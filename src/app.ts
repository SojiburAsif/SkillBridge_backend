import express from 'express';

import { toNodeHandler } from "better-auth/node";
import { auth } from './app/lib/auth';
import cors from 'cors';
import router from './app/routes';
import { errorHandler } from './app/middleware/error';
import { notFound } from './app/middleware/notFound';

import swaggerUi from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";

const app = express();

const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "MentorFlow API",
            version: "1.0.0",
            description: "API Documentation for MentorFlow Back-end",
        },
        servers: [
            {
                url: "https://skillbridgebackend.vercel.app/api",
            },
        ],
    },
    apis: ["./src/app/Module/**/*.ts"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.set("trust proxy", true)

const allowedOrigins = ["https://mentor-flow-fontend.vercel.app", 'http://localhost:3000', "https://next-blog-client.vercel.app", "https://next-blog-client-git-main-rahul-rajput.vercel.app"];

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || origin === "null") return callback(null, true);

            const isAllowed =
                allowedOrigins.includes(origin) ||
                /^https:\/\/next-blog-client.*\.vercel\.app$/.test(origin) ||
                /^https:\/\/.*\.vercel\.app$/.test(origin) ||
                origin.includes("sslcommerz.com"); 

            if (isAllowed) {
                callback(null, true);
            } else {
                callback(new Error(`Origin ${origin} not allowed by CORS`));
            }
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
        exposedHeaders: ["Set-Cookie"],
    })
);


// app.use(cors({
//     origin: [process.env.APP_URL as string , 'http://localhost:3000', "https://skill-bridge-fontend-five.vercel.app"],
//     credentials: true
// }))

app.use(express.json());

app.use("/api", router);

app.get('/', (req, res) => {
    res.send('SkillBridge server is up and running');
});

app.use(notFound);
app.use(errorHandler);

export default app;