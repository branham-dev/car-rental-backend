import type { Context } from "hono";
import * as AuthService from "authentication/auth.service.js"
import { generateResponse } from "@/utilities/functions.js";
import type { StatusState } from "@/utilities/types.js";
import { AppError } from "@/utilities/App.Error.js";

type UploadedFile = {
  path: string;
  originalname: string;
  mimetype?: string;
  size?: number;
};


export const registerUser = async (c: Context): Promise<Response> => {
  // * Derive database error such as violation of unique key
  try {
    const newUser = await c.req.json();
    console.log("New user:", newUser)
    const response = await AuthService.registerUser(newUser);
    return c.json(generateResponse<null>(true, "Registration Successful!", null), 201)
  } catch (error) {
    console.log(error)
    if (error instanceof AppError) {
      return c.json(generateResponse<null>(false, error.message, null), error.statusCode)
    }
    return c.json(generateResponse<undefined>(false, "An error occurred. Try again later", undefined), 500)
  }

}

export const loginUser = async (c: Context) => {
  try {
    const loginUser = await c.req.json();
    const response = await AuthService.loginUser(loginUser);

    return c.json(generateResponse(true, "Login Successful!", response), 200)

  } catch (error) {
    if (error instanceof AppError) {
      return c.json(generateResponse<null>(false, error.message, null), error.statusCode)
    }
    return c.json(generateResponse<undefined>(false, "An error occurred. Try again later", undefined), 500)
  }
}

export const uploadProfileImage = async (c: Context) => {
  try {
    const auth = (c as any).env.auth;
    if (!auth) throw new Error("Unauthorized");

    const file = (c.req as any).files?.profileImage;
    if (!file) throw new Error("No file uploaded");

    const url = await AuthService.uploadProfileImage(auth.userId, file);

    return c.json(generateResponse(true, "Upload successful", { url }));
  } catch (err: any) {
    console.error(err);
    return c.json(generateResponse(false, err.message || "Upload failed", null), err.statusCode || 500);
  }
};


// export const uploadProfileImage = async (c: Context) => {
//   const file = (c.req as any).files?.profileImage;
//   if (!file) return c.json({ error: 'No file uploaded' }, 400);

//   return c.json({
//     message: 'Upload successful',
//     filename: file.newFilename, // or file.originalFilename
//     path: file.filepath
//   });
// };