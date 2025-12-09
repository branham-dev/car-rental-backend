import { generateResponse } from "@/utilities/functions.js";
import * as SpecService from "@/specifications/spec.service.js";
import type { Context } from "hono";
import { AppError } from "@/utilities/App.Error.js";

export const listSpecs = async (c: Context) => {
  try {
    const q = c.req.query();
    const page = Number(q.page ?? 1);
    const limit = Number(q.limit ?? 20);

    const specs = await SpecService.listSpecs({ page, limit });
    return c.json(generateResponse(true, "Specs fetched", specs), 200);
  } catch (error) {
    if (error instanceof AppError) {
      return c.json(generateResponse(false, error.message, null, error.code), error.statusCode);
    }
    return c.json(generateResponse(false, "Internal error", null), 500);
  }
};

export const findSpec = async (c: Context) => {
  try {
    const specId = c.req.param("id");
    const spec = await SpecService.findSpec(specId);
    return c.json(generateResponse(true, "Spec fetched", spec), 200);
  } catch (error) {
    if (error instanceof AppError) {
      return c.json(generateResponse(false, error.message, null, error.code), error.statusCode);
    }
    return c.json(generateResponse(false, "Internal error", null), 500);
  }
};

export const createSpec = async (c: Context) => {
  try {
    const body = await c.req.json();
    console.log("Create specs controller:", body);
    const spec = await SpecService.createSpec(body);
    return c.json(generateResponse(true, "Spec created", spec), 201);
  } catch (error) {
    console.log("Create specs controller catch block:", error);
    if (error instanceof AppError) {
      return c.json(generateResponse(false, error.message, null, error.code), error.statusCode);
    }
    return c.json(generateResponse(false, "Internal error", null), 500);
  }
};

export const updateSpec = async (c: Context) => {
  try {
    const specId = c.req.param("id");
    const body = await c.req.json();
    const updated = await SpecService.updateSpec(specId, body);
    return c.json(generateResponse(true, "Spec updated", updated), 200);
  } catch (error) {
    console.log("Update specs controller catch block:", error);
    if (error instanceof AppError) {
      return c.json(generateResponse(false, error.message, null, error.code), error.statusCode);
    }
    return c.json(generateResponse(false, "Internal error", null), 500);
  }
};

export const deleteSpec = async (c: Context) => {
  try {
    const specId = c.req.param("id");
    await SpecService.deleteSpec(specId);
    return c.json(generateResponse(true, "Spec deleted", null), 200);
  } catch (error) {
    if (error instanceof AppError) {
      return c.json(generateResponse(false, error.message, null, error.code), error.statusCode);
    }
    return c.json(generateResponse(false, "Internal error", null), 500);
  }
};