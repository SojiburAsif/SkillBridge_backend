import { z } from "zod";

export const createCategoryValidationSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    title: z.string().optional(),
    icon: z.string().optional(),
  }),
});

export const updateCategoryValidationSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    title: z.string().optional(),
    icon: z.string().optional(),
  }),
});