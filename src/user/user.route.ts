import { requireAuth, requireRole } from "@/middleware/auth.js";
import { Hono } from "hono";
import * as UserController from "user/user.controller.js"

enum UserRole {
  Admin = "admin",
  Client = "client",
  Support = "support"
}



const userRoute = new Hono()

userRoute.get("/users", requireAuth, requireRole(UserRole.Admin), UserController.listUsers);
userRoute.get("/user/:id", requireAuth, requireRole(UserRole.Admin), UserController.findUser);
userRoute.post("/user", requireAuth, requireRole(UserRole.Admin), UserController.createUser);
userRoute.put("/user/:id", requireAuth, requireRole(UserRole.Admin), UserController.updateUser);
userRoute.delete("/user/:id", requireAuth, requireRole(UserRole.Admin), UserController.deleteUser);

export default userRoute;
