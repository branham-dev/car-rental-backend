import { AppError } from "@/utilities/App.Error.js";
import { generateResponse } from "@/utilities/functions.js";
import type { Context } from "hono";
import * as VehicleService from "./vehicle.service.js";

export const listVehicles = async (c: Context) => {
  try {
    const q = c.req.query();
    const page = Number(q.page ?? 1);
    const limit = Number(q.limit ?? 20);
    const onlyAvailable = q.onlyAvailable === "true";

    const vehicles = await VehicleService.listVehicles({ page, limit, onlyAvailable });
    return c.json(generateResponse(true, "Vehicles fetched", vehicles), 200);
  } catch (error) {
    console.log(error)
    if (error instanceof AppError) return c.json(generateResponse(false, error.message, null, error.code), error.statusCode);
    return c.json(generateResponse(false, "Internal server error", null), 500);
  }
};

export const findVehicle = async (c: Context) => {
  try {
    const id = c.req.param("id");
    const vehicle = await VehicleService.findVehicle(id);
    return c.json(generateResponse(true, "Vehicle fetched", vehicle), 200);
  } catch (error) {
    if (error instanceof AppError) return c.json(generateResponse(false, error.message, null, error.code), error.statusCode);
    return c.json(generateResponse(false, "Internal server error", null), 500);
  }
};

// export const createVehicle1 = async (c: Context) => {
//   try {
//     const body = await c.req.json();
//     const vehicle = await VehicleService.createVehicle(body);
//     return c.json(generateResponse(true, "Vehicle created", vehicle), 201);
//   } catch (error) {
//     console.log(error);
//     if (error instanceof AppError) return c.json(generateResponse(false, error.message, null, error.code), error.statusCode);
//     return c.json(generateResponse(false, "Internal server error", null), 500);
//   }
// };

// export const createVehicle = async (c: Context) => {
//   try {
//     const body = await c.req.json();
//     const vehicle = await VehicleService.createVehicle(body);
//     return c.json(generateResponse(true, "Vehicle created", vehicle), 201);
//   } catch (error) {
//     console.log(error);
//     if (error instanceof AppError)
//       return c.json(generateResponse(false, error.message, null, error.code), error.statusCode);
//     return c.json(generateResponse(false, "Internal server error", null), 500);
//   }
// };

export const updateVehicle = async (c: Context) => {
  try {
    const payload = await c.req.json();
    await VehicleService.updateVehicle(payload);

    return c.json(generateResponse<null>(true, "Updated successfully", null), 201);
  } catch (error) {
    
  }
};

export const deleteVehicle = async (c: Context) => {
  try {
    const id = c.req.param("id");
    await VehicleService.deleteVehicle(id);
    return c.json(generateResponse(true, "Vehicle deleted", null), 200);
  } catch (error) {
    if (error instanceof AppError) return c.json(generateResponse(false, error.message, null, error.code), error.statusCode);
    return c.json(generateResponse(false, "Internal server error", null), 500);
  }
};
