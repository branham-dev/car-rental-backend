import { z } from "zod";

export const createUserSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
  role: z.enum(["client", "admin"]).default("client"),
});

export const updateUserSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  // role: z.enum(["client", "admin"]).optional(),
});