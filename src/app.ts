import express from 'express';

import { toNodeHandler } from "better-auth/node";
import { auth } from './lib/auth';
import cors from 'cors';
import { tutorRouter } from './Module/Tutors/tutor.route';
import { StudentBookingRouter } from './Module/Booking/booking.route';
import { userRouter } from './Module/User/user.route';


const app = express();

app.use(cors({
    origin: process.env.APP_URL || 'http://localhost:4000',
    credentials: true
}))


app.all('/api/auth/*splat', toNodeHandler(auth));

app.use(express.json());

app.use("/api", tutorRouter);

app.use("/api", StudentBookingRouter)

app.use('/api', userRouter)

app.get('/', (req, res) => {
    res.send('SkillBridge server is up and running');
});

export default app