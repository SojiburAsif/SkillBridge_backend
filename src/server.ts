import app from "./app";
import { prisma } from "./app/lib/prisma";
import { startBookingCleanupJob } from "./app/Module/Booking/booking.cron";

const PORT = process.env.PORT || 3000;

async function main() {
    try {
        await prisma.$connect();
        console.log("Connected to the database successfully.");

        // Start CRON background jobs
        startBookingCleanupJob();

        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error("An error occurred:", error);
        await prisma.$disconnect();
        process.exit(1);
    }
}

main();