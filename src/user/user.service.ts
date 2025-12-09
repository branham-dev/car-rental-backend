import { AppError } from "@/utilities/App.Error.js";
import { camelCaseKeys, camelCaseObject, omitPassword } from "@/utilities/functions.js";
import * as UserModel from "user/user.model.js"
import { createUserSchema, updateUserSchema } from "./user.schema.js";
import bcrypt from "bcryptjs";

type PageOpts = { page: number; limit: number; requester?: any };

export const listUsers = async ({ page, limit, requester }: PageOpts) => {
  // if (!requester || requester.role !== "admin") {
  //   throw new AppError("Not authorized to list users", 403, "NOT_ALLOWED_LIST_USERS", false);
  // }
  const offset = (page - 1) * limit;
  const rows = await UserModel.listUsers({ offset, limit });
  const camel = camelCaseKeys(rows) as any[];
  const cleanData = camel.map(u => omitPassword(u));
  // console.log("Clean data:", cleanData)
  return cleanData
}

export const findUser = async (id: string, requester: any) => {
  const row = await UserModel.findUser(id);
  if (!row || row.is_deleted) throw new AppError("User not found", 404, "NOT_FOUND", false);
  // if (requester.role !== "admin" && requester.userId !== id) {
  //   throw new AppError("Not authorized", 403);
  // }
  const camel = camelCaseKeys(row);

  const cleanData = Array.isArray(camel)
    ? camel.map(u => omitPassword(u))
    : omitPassword(camel);
  return cleanData;
}

export const createUser = async (payload: any) => {
  try {
    const parsed = createUserSchema.parse(payload);
    const user = await UserModel.findEmail(parsed.email);
    if (user) {
      throw new AppError("Email already exists", 409, "EMAIL_EXISTS");
    }
    const passwordHash = await bcrypt.hash(parsed.password, 12);
    const userData = { ...parsed, password: passwordHash }
    // console.log("User data:", userData)
    console.log("Service, Create user:", userData);

    const rows = await UserModel.createUser(userData);

    if (rows !== 1) throw new AppError("Registration failed", 500, "FAILED", false);
    // retrieve created user (without password)
    const created = await UserModel.findEmail(parsed.email);
    const camel = camelCaseKeys(created);
    const cleanData = Array.isArray(camel)
      ? camel.map(u => omitPassword(u))
      : omitPassword(camel);
    return cleanData;
  } catch (error) {
    console.log(error)
  }
}



export const updateUser = async (id: string, payload: any, requester: any) => {
  // Validate payload partially
  const parsed = updateUserSchema.parse(payload);

  // Authorization
  // if (requester.role !== "admin" && requester.userId !== id) {
  //   throw new AppError("Not authorized", 403);
  // }

  // If email updated -> pre-check except if same as current
  if (parsed.email) {
    const exists = await UserModel.findEmail(parsed.email);
    if (exists && exists.user_id !== id) {
      throw new AppError("Email already exists", 409);
    }
  }
  // If password updated -> hash it
  if (parsed.password) {
    parsed.password = await bcrypt.hash(parsed.password, 12);
  }

  const rows = await UserModel.updateUser(id, parsed);
  if (rows === 0) throw new AppError("User not updated", 500);


}


export const deleteUser = async (id: string, requester: any) => {
  // Authorization
  // if (requester.role !== "admin" && requester.userId !== id) {
  //   throw new AppError("Not authorized", 403);
  // }
  // Soft delete
  console.log("Soft delete")
  const rows = await UserModel.deleteUser(id);
  if (rows === 0) throw new AppError("User not deleted", 500);
  return;
}