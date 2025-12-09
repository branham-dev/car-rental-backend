import { AppError } from "@/utilities/App.Error.js";
import { camelCaseKeys } from "@/utilities/functions.js";
import * as VehicleModel from "./vehicle.model.js";
import * as SpecModel from "@/specifications/spec.model.js";
import type { VehicleUpdate } from "./vehicles.types.js";
import { validateVehicle } from "./vehicle.schema.js";

type VehiclePayload = {
  specId?: string; // existing spec
  newSpec?: {      // optional inline new spec creation
    manufacturer: string;
    model: string;
    year: number;
    fuelType?: string;
    engineCapacity?: string;
    transmission?: string;
    seatingCapacity?: number;
    color?: string;
    features?: string;
  };
  rentalRate: number;
  isAvailable?: boolean;
};

type ListOpts = {
  page?: number;
  limit?: number;
  onlyAvailable?: boolean;
};

export const listVehicles = async ({ page = 1, limit = 20, onlyAvailable = false }: ListOpts) => {
  const offset = (page - 1) * limit;
  const rows = await VehicleModel.listVehicles({ offset, limit, onlyAvailable });
  return camelCaseKeys(rows);
};

export const findVehicle = async (vehicleId: string) => {
  const row = await VehicleModel.findVehicle(vehicleId);
  if (!row) throw new AppError("Vehicle not found", 404, "NOT_FOUND");
  return camelCaseKeys(row);
};

// export const createVehicle1 = async (payload: VehiclePayload) => {
//   let specId = payload.specId;

//   // Inline new spec creation if no specId provided
//   if (!specId && payload.newSpec) {
//     // Check if same spec already exists
//     const existing = await SpecModel.findExactSpec(payload.newSpec);
//     if (existing) {
//       specId = existing.specId;
//     } else {
//       const created = await SpecModel.createSpec(payload.newSpec);
//       // ! USE OF ANY!
//       specId = created as string // createSpec returns specId
//       // ! ---
//     }
//   }

//   if (!specId) throw new AppError("Spec is required", 400, "SPEC_REQUIRED");

//   // Check if spec exists and is not soft-deleted
//   const specExists = await SpecModel.findSpec(specId);
//   if (!specExists) throw new AppError("Spec does not exist", 400, "SPEC_NOT_FOUND");

//   // Validate rental rate
//   if (payload.rentalRate <= 0) throw new AppError("Rental rate must be positive", 400);

//   const rowsAffected = await VehicleModel.createVehicle({
//     specId,
//     rentalRate: payload.rentalRate,
//     availability: payload.isAvailable
//   });

//   if (rowsAffected !== 1) throw new AppError("Vehicle creation failed", 500);

//   // Return the newly created vehicle
//   const newVehicle = await VehicleModel.listVehicles({ offset: 0, limit: 1, onlyAvailable: false });
//   return camelCaseKeys(newVehicle[0]);
// };

// export const createVehicle = async (payload: VehiclePayload) => {
//   let specId = payload.specId;

//   // 1. Check/create spec if not provided
//   if (!specId && payload.newSpec) {
//     const existingSpec = await SpecModel.findExactSpec(payload.newSpec);
//     if (existingSpec) {
//       specId = existingSpec.spec_id;
//     } else {
//       const createdSpec = await SpecModel.createSpec(payload.newSpec);
//       specId = createdSpec as string; // assume createSpec returns spec_id
//     }
//   }

//   if (!specId) {
//     throw new AppError("Spec ID is required", 400);
//   }

//   // 2. Insert vehicle
//   const vehicleRow = await VehicleModel.createVehicle({
//     specId,
//     rentalRate: payload.rentalRate,
//     availability: payload.isAvailable,
//   });

//   if (!vehicleRow) throw new AppError("Vehicle could not be created", 500);

//   // 3. Fetch full vehicle with spec details
//   const fullVehicle = await VehicleModel.findVehicleById(vehicleRow.vehicle_id);
//   return camelCaseKeys(fullVehicle);
// };

export const updateVehicle = async (payload: VehicleUpdate) => {
  try {
    const validPayload = validateVehicle(payload);
    const response = VehicleModel.updateVehicle(payload.vehicleId, validPayload);
      
    console.log("Update response:", response);
  } catch (error) {
    console.log(error);
  }
};

export const deleteVehicle = async (vehicleId: string) => {
  const rows = await VehicleModel.deleteVehicle(vehicleId);
  if (rows === 0) throw new AppError("Vehicle not deleted", 500);
  return;
};
