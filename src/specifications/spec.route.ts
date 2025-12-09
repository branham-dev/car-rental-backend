import { Hono } from "hono";
import { requireAuth, requireRole } from "@/middleware/auth.js";
import * as SpecController from "@/specifications/spec.controller.js";

enum UserRole {
  Admin = "admin",
  Client = "client",
  Support = "support"
}

const specRoute = new Hono();

// All routes protected for admin only
specRoute.get("/vehicle-specs", SpecController.listSpecs);
// specRoute.get("/vehicle-specs/:id", requireAuth, requireRole(UserRole.Admin), SpecController.findSpec);
specRoute.post("/vehicle-specs", SpecController.createSpec);
specRoute.put("/vehicle-specs/:id", SpecController.updateSpec);
specRoute.delete("/vehicle-specs/:id", requireAuth, requireRole(UserRole.Admin), SpecController.deleteSpec);

export default specRoute;
