import { z } from "zod";

const updateTutorProfileSchema = z.object({
  body: z.object({
    bio: z.string().optional(),
    price: z.number().positive("Price must be a positive number").optional(),
    experience: z.string().optional(),
    gender: z.string().optional(),
    institution: z.string().optional(),
    categoryName: z.string().optional(),
    categoryId: z.string().optional(), // Added for flexibility
    name: z.string().optional(),
    phone: z.string().regex(/^\+8801[3-9]\d{8}$/, "Must be a valid Bangladeshi phone number").optional(),
    image: z.string().url("Image must be a valid URL").optional(),
    slots: z.array(z.object({
      date: z.string(),
      startTime: z.string(),
      endTime: z.string()
    })).optional()
  })
});

export const TutorValidation = {
  updateTutorProfileSchema
};