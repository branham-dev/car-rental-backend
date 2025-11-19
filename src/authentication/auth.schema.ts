import { z } from 'zod';

export const registerSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    // .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  phone: z.string().min(7, "Phone number is required"),
  address: z.string().min(3, "Address is required"),
  // role: z.enum(['client', 'admin']).optional(),
});


export const loginSchema = z.object({
  email: z
    .string()
    .email("Invalid email format"),

  password: z
    .string()
    .min(8, "Password must be at least 6 characters"),
});


// Todo: Get zod error messages to client.