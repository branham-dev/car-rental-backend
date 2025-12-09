import type { Context } from "hono";
import { AppError } from "@/utilities/App.Error.js";
import { generateResponse } from "@/utilities/functions.js";
import * as BookingService from "./booking.service.js";
import { UserRole } from "@/types/types.js";

export const getBookings = async (c: Context) => {
  try {

    const auth = (c as any).env?.auth;
    if (!auth) throw new AppError("Not authenticated", 401);

    const userId = auth.role === UserRole.Admin ? undefined : auth.userId;
    const q = c.req.query();
    const status = q.status;
    const vehicleId = q.vehicleId;

    const bookings = await BookingService.getBookings(userId, { status, vehicleId });
    return c.json(generateResponse(true, "Bookings fetched", bookings), 200);
  } catch (err) {
    if (err instanceof AppError) return c.json(generateResponse(false, err.message, null, err.code), err.statusCode);
    console.error(err);
    return c.json(generateResponse(false, "Internal server error", null), 500);
  }
};


export const createBooking = async (c: Context) => {
  try {
    const auth = (c as any).env?.auth;
    if (!auth) throw new AppError("Not authenticated", 401);

    const userId = auth.role === UserRole.Admin ? undefined : auth.userId;

    const body = await c.req.json();

    const newBody = { ...body, userId };

    const booking = await BookingService.createBooking(newBody, userId);
    return c.json(generateResponse(true, "Booking created", booking), 201);
  } catch (err) {
    if (err instanceof AppError) return c.json(generateResponse(false, err.message, null, err.code), err.statusCode);
    console.error(err);
    return c.json(generateResponse(false, "Internal server error", null), 500);
  }
};

export const updateBooking = async (c: Context) => {
  try {

    const updateBody = await c.req.json();
    const booking = await BookingService.updateBooking(updateBody);

    return c.json(generateResponse(true, "Booking updated", booking), 200);
  } catch (err) {
    console.log(err)
    if (err instanceof AppError) return c.json(generateResponse(false, err.message, null, err.code), err.statusCode);
    return c.json(generateResponse(false, "Internal server error", null), 500);
  }
};

export const cancelBooking = async (c: Context) => {
  try {
    const id = c.req.param("id");
    const booking = await BookingService.cancelBooking(id);
    return c.json(generateResponse(true, "Booking cancelled", booking), 200);
  } catch (err) {
    if (err instanceof AppError) return c.json(generateResponse(false, err.message, null, err.code), err.statusCode);
    console.error(err);
    return c.json(generateResponse(false, "Internal server error", null), 500);
  }
};

