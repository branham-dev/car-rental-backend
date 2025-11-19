import { Hono } from "hono";
import * as AuthController from "authentication/auth.controller.js"


const authRoute = new Hono();

authRoute.post("/register", AuthController.registerUser);
authRoute.post("/login", AuthController.loginUser);

export default authRoute;