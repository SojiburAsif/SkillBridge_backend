import { z } from "zod";
import { UserRole } from "../../middleware/auth";

export const LoginValidationSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
  }),
});

export const RegisterValidationSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters long"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    role: z.nativeEnum(UserRole).optional(),
    phone: z.string()
      .regex(/^(?:\+88)?01\d{9}$/, "Phone number must be a valid Bangladeshi number starting with 01")
      .transform((val) => (val.startsWith("+88") ? val : `+88${val}`))
      .optional(),
    imgUrl: z.string().url("Invalid image URL").optional().or(z.literal("")),
    
    // Student-specific
    grade: z.string().optional(),
    institution: z.string().optional(),
    gender: z.string().optional(),
    interests: z.string().optional(),
    
    // Tutor-specific
    bio: z.string().optional(),
    price: z.number().min(0, "Price must be a positive number").optional(),
    experience: z.string().optional(),
    categoryId: z.string().uuid("Invalid category ID").optional().or(z.literal("")),
  }),
});

export const ChangePasswordValidationSchema = z.object({
  body: z.object({
    oldPassword: z.string().min(6, "Old password must be at least 6 characters long"),
    newPassword: z.string().min(6, "New password must be at least 6 characters long"),
    // Default false so user doesn't get logged out
    revokeOtherSessions: z.boolean().optional().default(false),
  }),
});