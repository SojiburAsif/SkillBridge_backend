-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "slotId" TEXT;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "TutorSlot"("id") ON DELETE SET NULL ON UPDATE CASCADE;
