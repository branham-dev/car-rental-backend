import { Hono } from "hono";
import * as AuthController from "authentication/auth.controller.js";
import { uploadSingle } from "@/middleware/upload.middleware.js";
import { requireAuth, requireRole } from "@/middleware/auth.js";




const authRoute = new Hono();

authRoute.post("/register", AuthController.registerUser);
authRoute.post("/login", AuthController.loginUser);
authRoute.post(
  "/upload-profile",
  requireAuth,              // populate env.auth first
  uploadSingle("profileImage"),
  AuthController.uploadProfileImage
);

export default authRoute;

