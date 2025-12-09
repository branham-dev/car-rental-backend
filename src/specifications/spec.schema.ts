import { z } from "zod";

export const createSpecSchema = z.object({
  manufacturer: z.string().min(1),
  model: z.string().min(1),
  year: z.number().int().min(1900), // arbitrary sensible range
  fuelType: z.string().optional(),
  engineCapacity: z.string().optional(),
  transmission: z.string().optional(),
  seatingCapacity: z.number().int().optional(),
  color: z.string().optional(),
  features: z.string().optional(),
});

export const updateSpecSchema = z.object({
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  year: z.number().int().optional(),
  fuelType: z.string().optional(),
  engineCapacity: z.string().optional(),
  transmission: z.string().optional(),
  seatingCapacity: z.number().int().optional(),
  color: z.string().optional(),
  features: z.string().optional(),
});