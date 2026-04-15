import { z } from "zod";

export const ProfileUpdateValidationSchema = z.object({
  body: z.object({
    // User fields
    name: z.string().min(2, "Name must be at least 2 characters").optional(),
    phone: z.string()
      .regex(/^(?:\+88)?01\d{9}$/, "Phone number must be a valid Bangladeshi number starting with 01")
      .transform((val) => (val.startsWith("+88") ? val : `+88${val}`))
      .optional(),
    image: z.string().url("Invalid image URL").optional().or(z.literal("")),

    // Student fields
    grade: z.string().optional(),
    interests: z.string().optional(),

    // Tutor fields
    bio: z.string().optional(),
    price: z.number().min(0, "Price must be a positive number").optional(),
    experience: z.string().optional(),
    categoryId: z.string().uuid("Invalid category ID").optional().or(z.literal("")),
    categoryIds: z.array(z.string().uuid("Invalid category ID")).max(4, "You can select up to 4 categories").optional(),
    tutorStatus: z.enum(["ACTIVE", "INACTIVE", "PENDING", "BANNED"]).optional(),

    // Shared generic fields (both Tutor & Student)
    gender: z.string().optional(),
    institution: z.string().optional(),
  }).strict(),
});
