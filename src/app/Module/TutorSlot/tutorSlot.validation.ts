import { z } from "zod";

const slotSchema = z.object({
  date: z.string().min(1, "Date is required (YYYY-MM-DD)"),
  startTime: z.string().min(1, "Start time is required (HH:mm)"),
  endTime: z.string().min(1, "End time is required (HH:mm)")
});

const createSlotsSchema = z.object({
  body: z.object({
    slots: z.array(slotSchema).min(1, "At least one slot is required")
  })
});

const updateSlotSchema = z.object({
  body: z.object({
    date: z.string().optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    isBooked: z.boolean().optional()
  })
});

export const TutorSlotValidation = {
  createSlotsSchema,
  updateSlotSchema
};