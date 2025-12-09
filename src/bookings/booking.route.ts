import { Hono } from "hono";
import { requireAuth, requireRole } from "@/middleware/auth.js";
import * as BookingController from "./booking.controller.js";

enum UserRole {
  Admin = "admin",
  Client = "client"
}

const bookingRoute = new Hono();

// Admin routes
bookingRoute.get("/admin/bookings", requireAuth, requireRole(UserRole.Admin), BookingController.getBookings);
bookingRoute.get("/admin/booking/:id", requireAuth, requireRole(UserRole.Admin), BookingController.getBookings);
bookingRoute.post("/admin/booking", requireAuth, requireRole(UserRole.Admin), BookingController.createBooking);
bookingRoute.put("/admin/booking/:id", requireAuth, requireRole(UserRole.Admin), BookingController.updateBooking);
bookingRoute.delete("/admin/booking/:id", requireAuth, requireRole(UserRole.Admin), BookingController.cancelBooking);

// Client routes
bookingRoute.get("/bookings", requireAuth, requireRole(UserRole.Client), BookingController.getBookings); // only own bookings
bookingRoute.post("/booking", requireAuth, requireRole(UserRole.Client), BookingController.createBooking);

export default bookingRoute;
