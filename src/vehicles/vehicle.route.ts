import { Hono } from "hono";
import { requireAuth, requireRole } from "@/middleware/auth.js";
import * as VehicleController from "./vehicle.controller.js";

enum UserRole {
  Admin = "admin",
  Client = "client",
  Support = "support"
}

const vehicleRoute = new Hono();

// ==================
// Admin Routes
// ==================
vehicleRoute.get("/admin/vehicles", requireAuth, requireRole(UserRole.Admin), VehicleController.listVehicles);
vehicleRoute.get("/admin/vehicle/:id", requireAuth, requireRole(UserRole.Admin), VehicleController.findVehicle);
// vehicleRoute.post("/admin/vehicle", requireAuth, requireRole(UserRole.Admin), VehicleController.createVehicle);
vehicleRoute.put("/admin/vehicle/:id", requireAuth, requireRole(UserRole.Admin), VehicleController.updateVehicle);
vehicleRoute.delete("/admin/vehicle/:id", requireAuth, requireRole(UserRole.Admin), VehicleController.deleteVehicle);

// ==================
// Client / User Routes
// ==================
vehicleRoute.get("/vehicles", VehicleController.listVehicles);
vehicleRoute.get("/vehicle/:id", requireAuth, VehicleController.findVehicle);

export default vehicleRoute;
