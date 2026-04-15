import { z } from "zod";

const createReviewZodSchema = z.object({
  body: z.object({
    rating: z.number({ message: "Rating is required" })
             .min(1, { message: "Rating must be at least 1" })
             .max(5, { message: "Rating cannot proceed 5" }),
    comment: z.string({ message: "Comment is required" })
              .min(5, { message: "Comment must be at least 5 characters" }),
    bookingId: z.string({ message: "Booking ID is required" }),
    tutorId: z.string({ message: "Tutor ID is required" })
  })
});

export const ReviewValidation = {
  createReviewZodSchema
};
