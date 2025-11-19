import type { Context } from "hono";
import * as AuthService from "authentication/auth.service.js"
import { generateResponse } from "@/utilities/functions.js";
import type { StatusState } from "@/utilities/types.js";
import { AppError } from "@/utilities/App.Error.js";


export const registerUser = async (c: Context): Promise<Response> => {
  // * Derive database error such as violation of unique key
  try {
    const newUser = await c.req.json();
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