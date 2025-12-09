import { getConnectionPool } from "@/database/dbconfig.js";
import { camelCaseKey, toBit } from "@/utilities/functions.js";
import type { VehicleUpdate } from "./vehicles.types.js";

export type Vehicle = {
  specId?: string;
  availability?: string;

  vehicleId: string;
  rentalRate: number;
  isAvailable: boolean;
}

export const listVehicles = async ({ offset = 0, limit = 20, onlyAvailable = false } = {}) => {
  const database = getConnectionPool();
  const query = /*sql*/ `
    SELECT 
      v.vehicle_id, v.spec_id, v.rental_rate, v.is_available, v.created_at, v.updated_at,
      s.manufacturer, s.model, s.year, s.transmission, s.color
    FROM crs.vehicles v
    JOIN crs.vehicle_specifications s ON v.spec_id = s.spec_id
    WHERE v.is_deleted = 0 AND s.is_deleted = 0
      ${onlyAvailable ? "AND v.is_available = TRUE" : ""}
    ORDER BY v.created_at DESC
    OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
  `;
  const response = await database.request()
    .input("offset", offset)
    .input("limit", limit)
    .query(query);

  return response.recordset;
}

export const findVehicle = async (vehicleId: string) => {
  const database = getConnectionPool();
  const query = /*sql*/ `
    SELECT 
      v.vehicle_id, v.spec_id, v.rental_rate, v.availability, v.created_at, v.updated_at,
      s.manufacturer, s.model, s.year, s.transmission, s.color
    FROM crs.vehicles v
    JOIN crs.vehicle_specifications s ON v.spec_id = s.spec_id
    WHERE v.vehicle_id = @vehicleId AND v.is_deleted = 0 AND s.is_deleted = 0
  `;
  const response = await database.request()
    .input("vehicleId", vehicleId)
    .query(query);

  return response.recordset[0];
}

// export const createVehicle1 = async (vehicle: Vehicle) => {
//   const database = getConnectionPool();
//   const query = /*sql*/ `
//     INSERT INTO crs.vehicles (spec_id, rental_rate, availability)
//     VALUES (@specId, @rentalRate, @availability)
//   `;
//   const response = await database.request()
//     .input("specId", vehicle.specId)
//     .input("rentalRate", vehicle.rentalRate)
//     .input("availability", vehicle.availability ?? "Available")
//     .query(query);

//   return response.rowsAffected[0];
// }

export const createVehicle = async (vehicle: Vehicle) => {
  const database = getConnectionPool();
  const query = /*sql*/ `
    INSERT INTO crs.vehicles (spec_id, rental_rate, availability)
    OUTPUT INSERTED.*
    VALUES (@specId, @rentalRate, @availability)
  `;
  const response = await database
    .request()
    .input("specId", vehicle.specId)
    .input("rentalRate", vehicle.rentalRate)
    .input("availability", vehicle.availability ?? "Available")
    .query(query);

  return response.recordset[0]; // Full inserted vehicle row
};

export const updateVehicle = async (id: string, payload: VehicleUpdate) => {
  try {
    const database = getConnectionPool();
    const query = /*sql*/ `
      UPDATE crs.Vehicles
      SET is_available = @isAvailable, rental_rate = @rentalRate
      OUTPUT inserted.*
      WHERE vehicle_id = @id
    `
    const rawData = await database
      .request()
      .input("id", id)
      .input("isAvailable", toBit(payload.isAvailable))
      .input("rentalRate", payload.rentalRate)
      .query(query);

    const response = camelCaseKey(rawData);
    console.log("Model - update vehicle:", response);
    

  } catch (error) {
    console.log(error)
  }
}

export const deleteVehicle = async (vehicleId: string) => {
  const database = getConnectionPool();
  const query = /*sql*/ `
    UPDATE crs.vehicles
    SET is_deleted = 1, updated_at = GETDATE()
    WHERE vehicle_id = @vehicleId
  `;
  const response = await database.request()
    .input("vehicleId", vehicleId)
    .query(query);

  return response.rowsAffected[0];
}

export const countBySpec = async (specId: string) => {
  const database = getConnectionPool();
  const query = /*sql*/ `
    SELECT COUNT(*) AS count
    FROM crs.vehicles
    WHERE spec_id = @specId AND is_deleted = 0
  `;
  const response = await database.request()
    .input("specId", specId)
    .query(query);

  return response.recordset[0].count;
}

export const findVehicleById = async (vehicleId: string) => {
  const database = getConnectionPool();
  const query = /*sql*/ `
    SELECT v.*, s.*
    FROM crs.vehicles v
    JOIN crs.vehicle_specifications s ON v.spec_id = s.spec_id
    WHERE v.vehicle_id = @vehicleId AND v.is_deleted = 0
  `;
  const response = await database.request().input("vehicleId", vehicleId).query(query);
  return response.recordset[0];
};