import { z } from "zod";
import { BookingStatus } from "../../../../generated/prisma/enums";

const createBookingZodSchema = z.object({
  body: z.object({
    tutorProfileId: z.string({ message: "Tutor Profile ID is required" }),
    slotId: z.string({ message: "Slot ID is required" }),
    couponCode: z.string().optional(),
  }),
});

const changeBookingStatusZodSchema = z.object({
  body: z.object({
    status: z.nativeEnum(BookingStatus, {
      message: "Booking Status is required",
    }),
  }),
});

const rescheduleBookingZodSchema = z.object({
  body: z.object({
    dateTime: z.string().min(1, "dateTime is required (ISO string)"),
  }),
});

export const BookingValidation = {
  createBookingZodSchema,
  changeBookingStatusZodSchema,
  rescheduleBookingZodSchema,
};
