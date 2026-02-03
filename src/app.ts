import express from 'express';

import { toNodeHandler } from "better-auth/node";
import { auth } from './lib/auth';
import cors from 'cors';
import { tutorRouter } from './Module/Tutors/tutor.route';
import { StudentBookingRouter } from './Module/Booking/booking.route';
import { userRouter } from './Module/User/user.route';
import { reviewRouter } from './Module/Review/Review.route';
import { TutorSlot } from './Module/TutorSlot/tutorSlot.route';


const app = express();

const allowedOrigins = ["https://skill-bridge-fontend-five.vercel.app"]

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (mobile apps, Postman, etc.)
            if (!origin) return callback(null, true);

            // Check if origin is in allowedOrigins or matches Vercel preview pattern
            const isAllowed =
                allowedOrigins.includes(origin) ||
                /^https:\/\/next-blog-client.*\.vercel\.app$/.test(origin) ||
                /^https:\/\/.*\.vercel\.app$/.test(origin); // Any Vercel deployment

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
    }),
);


// app.use(cors({
//     origin: [process.env.APP_URL as string , 'http://localhost:3000', "https://skill-bridge-fontend-five.vercel.app"],
//     credentials: true
// }))

app.all('/api/auth/*splat', toNodeHandler(auth));

app.use(express.json());

app.use("/api", tutorRouter);

app.use("/api", StudentBookingRouter)

app.use('/api', userRouter)

app.use('/api', reviewRouter)

app.use('/api', TutorSlot)

app.get('/', (req, res) => {
    res.send('SkillBridge server is up and running');
});

export default app;