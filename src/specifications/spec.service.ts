import { AppError } from "@/utilities/App.Error.js";
import { createSpecSchema, updateSpecSchema } from "./spec.schema.js";
import * as SpecModel from "@/specifications/spec.model.js"
import { camelCaseKeys } from "@/utilities/functions.js";


export const listSpecs = async ({ page, limit }: { page: number; limit: number }) => {
  const offset = (page - 1) * limit;
  const rows = await SpecModel.listSpecs({ offset, limit });
  return camelCaseKeys(rows);
};

export const findSpec = async (specId: string) => {
  const spec = await SpecModel.findSpec(specId);
  if (!spec) throw new AppError("Spec not found", 404, "NOT_FOUND");
  return camelCaseKeys(spec);
};

export const createSpec = async (payload: any) => {
  // Validate input
  const parsed = createSpecSchema.parse(payload);

  // Check if exact spec already exists
  const existing = await SpecModel.findExactSpec(parsed);
  if (existing) {
    throw new AppError("Spec already exists", 409, "SPEC_EXISTS");
  }

  // Create spec
  const rowsAffected = await SpecModel.createSpec(parsed);
  if (rowsAffected !== 1) {
    throw new AppError("Failed to create spec", 500, "FAILED");
  }

  // Return the created spec
  const created = await SpecModel.findExactSpec(parsed);
  return camelCaseKeys(created);
};

export const updateSpec = async (specId: string, payload: any) => {
  const parsed = updateSpecSchema.parse(payload);


  const rowsAffected = await SpecModel.updateSpec(specId, parsed);
  if (rowsAffected === 0) throw new AppError("Spec not updated", 500, "FAILED");

  const updated = await SpecModel.findSpec(specId);
  return camelCaseKeys(updated);
};

/**
 * Delete a spec by specId
 */
export const deleteSpec = async (specId: string) => {
  try {
    const rowsAffected = await SpecModel.deleteSpec(specId);
    if (rowsAffected === 0) throw new AppError("Spec not deleted", 500, "FAILED");
  } catch (error: any) {
    if (error.number === 547) {
      console.log(error);
      throw new AppError(
        "Spec cannot be deleted: one or more vehicles are using it",
        400,
        "FK_CONSTRAINT"
      );
    }
    throw error;
  }
};