import bcrypt from "bcryptjs";
import { loginSchema, registerSchema } from "authentication/auth.schema.js";
import * as AuthModel from "authentication/auth.model.js"
import { AppError } from "@/utilities/App.Error.js";
import { camelCaseKey, isObject } from "@/utilities/functions.js";
import jwtAuth from "jsonwebtoken";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

dotenv.config();

const SECRET: string | undefined = process.env.JWT_SECRET;
const EXPIRY = "1h";

if (SECRET === undefined) {
  throw new Error("JWT_SECRET environment variable is not set");
}

type NewUser = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  address: string;
}

type LoginUser = {
  email: string;
  password: string;
}

type Token = {
  id: string;
  firstN: string;
  lastN: string;
  email: string;
  role: string;
}

type LoginResponse = {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  profileImage: string;
}

type AuthResponse = {
  token: string;
  details: {
    name: string;
    email: string;
    role: string;
    profileImage: string;
  }
}

export const registerUser = async (newUser: NewUser): Promise<boolean> => {
  // Todo: Add email checking functionality.
  try {
    const parsedUser = registerSchema.parse(newUser);
    const passwordHash = await bcrypt.hash(parsedUser.password, 12);

    const userData = { ...parsedUser, password: passwordHash }


    const response = await AuthModel.registerUser(userData);
    if (response === 1) {
      return true
    }
    throw new AppError("Registration failed", 500, "FAILED_REGISTRATION", true);
  } catch (error) {
    console.log(error)
    throw error
  }


}
export const loginUser = async (loginUser: LoginUser) => {
  try {
    const parsedUser = loginSchema.parse(loginUser);
    const response = await AuthModel.loginUser(loginUser);
    if (response === undefined) {
      throw new AppError("Invalid credentials", 401, "EMAIL_DOESN'T_EXIST", false);
    }
    if (!isObject(response)) {
      throw new Error('None object');
    }
    const userData: LoginResponse = camelCaseKey(response);
    const passwordMatch = await bcrypt.compare(loginUser.password, userData.password);

    if (!passwordMatch) {
      throw new AppError("Invalid credentials", 401, "INCORRECT_PASSWORD", false);
    }
    const { password, ...cleanUser } = userData;

    const { userId, firstName, lastName, email, role, profileImage } = cleanUser

    const userSign: Token = {
      id: userId,
      firstN: firstName,
      lastN: lastName,
      email: email,
      role: role,
    }
    const authToken = jwtAuth.sign(userSign, SECRET, { expiresIn: EXPIRY });

    const authResponse: AuthResponse = {
      token: authToken,
      details: {
        name: `${firstName} ${lastName}`,
        email: email,
        role: role,
        profileImage: profileImage,
      }
    }

    return authResponse;

  } catch (error) {
    console.log(error)
    throw error
  }

}

export const uploadProfileImage = async (userId: string, file: any) => {
  if (!file) throw new Error("No file provided");

  // Use the existing file saved by middleware
  const filename = Date.now() + path.extname(file.originalFilename);
  const uploadFolder = path.join(process.cwd(), "uploads");
  const filePath = path.join(uploadFolder, filename);

  // Rename to new filename (optional)
  fs.renameSync(file.filepath, filePath);

  // Create public URL
  const url = `http://localhost:3100/uploads/${filename}`;

  // Save to database
  await AuthModel.updateProfileImage(userId, url);

  return url;
};
