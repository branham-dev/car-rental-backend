import { AppError } from "@/utilities/App.Error.js";
import { generateResponse } from "@/utilities/functions.js";
import type { Context } from "hono";
import * as UserService from "user/user.service.js"

export const listUsers = async (c: Context) => {
  try {
    const q = c.req.query();
    const page = Number(q.page ?? 1);
    const limit = Number(q.limit ?? 20);
    const result = await UserService.listUsers({ page, limit, requester: (c as any).env.auth });

    return c.json(generateResponse(true, "Users fetched", result), 200);
  } catch (error) {
    if (error instanceof AppError) return c.json(generateResponse(false, error.message, null), error.statusCode);
    return c.json(generateResponse<null>(false, "Internal error", null), 500);
  }
}

export const findUser = async (c: Context) => {
  try {
    const id = c.req.param("id");
    const user = await UserService.findUser(id, (c as any).env.auth);
    return c.json(generateResponse(true, "User fetched", user), 200);
  } catch (error) {
    if (error instanceof AppError) return c.json(generateResponse(false, error.message, null), error.statusCode);
    return c.json(generateResponse(false, "Internal error", null), 500);
  }
}

export const createUser = async (c: Context) => {
  try {
    const body = await c.req.json();
    console.log("Controller, Create user:", body);
    const user = await UserService.createUser(body);
    return c.json(generateResponse(true, "User created", user), 201);
  } catch (error) {
    if (error instanceof AppError) return c.json(generateResponse(false, error.message, null), error.statusCode);
    return c.json(generateResponse(false, "Internal error", null), 500);
  }
}

export const updateUser = async (c: Context) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    console.log("Body", body)
    const updated = await UserService.updateUser(id, body, (c as any).env.auth);
    return c.json(generateResponse(true, "User updated", updated), 200);
  } catch (error) {
    if (error instanceof AppError) return c.json(generateResponse(false, error.message, null), error.statusCode);
    return c.json(generateResponse(false, "Internal error", null), 500);
  }
}

export const deleteUser = async (c: Context) => {
  try {
    const id = c.req.param("id");
    const response = await UserService.deleteUser(id, (c as any).env.auth);
    return c.json(generateResponse(true, "User deleted", null), 200);
  } catch (error) {
    if (error instanceof AppError) return c.json(generateResponse(false, error.message, null), error.statusCode);
    return c.json(generateResponse(false, "Internal error", null), 500);
  }
}