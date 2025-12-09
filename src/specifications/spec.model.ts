import { getConnectionPool } from "@/database/dbconfig.js";
import type { Specification } from "./spec.types.js";

export const listSpecs = async ({ offset, limit }: { offset: number; limit: number }) => {
  const database = getConnectionPool();
  const query = /*sql*/ `
    SELECT *
    FROM crs.vehicle_specifications
    ORDER BY created_at DESC
    OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
  `;
  const response = await database.request()
    .input("offset", offset)
    .input("limit", limit)
    .query(query);

  return response.recordset;
};

export const findSpec = async (specId: string) => {
  const database = getConnectionPool();
  const query = /*sql*/ `
    SELECT *
    FROM crs.vehicle_specifications
    WHERE spec_id = @specId
  `;
  const response = await database.request()
    .input("specId", specId)
    .query(query);

  return response.recordset[0];
};

export const findExactSpec = async (payload: Specification) => {
  const database = getConnectionPool();
  const query = /*sql*/ `
    SELECT *
    FROM crs.vehicle_specifications
    WHERE manufacturer = @manufacturer
      AND model = @model
      AND year = @year
      AND ISNULL(fuel_type,'') = ISNULL(@fuelType,'')
      AND ISNULL(engine_capacity,'') = ISNULL(@engineCapacity,'')
      AND ISNULL(transmission,'') = ISNULL(@transmission,'')
      AND ISNULL(seating_capacity,0) = ISNULL(@seatingCapacity,0)
      AND ISNULL(color,'') = ISNULL(@color,'')
      AND ISNULL(features,'') = ISNULL(@features,'')
  `;
  const request = database.request()
    .input("manufacturer", payload.manufacturer)
    .input("model", payload.model)
    .input("year", payload.year)
    .input("fuelType", payload.fuelType || null)
    .input("engineCapacity", payload.engineCapacity || null)
    .input("transmission", payload.transmission || null)
    .input("seatingCapacity", payload.seatingCapacity || 0)
    .input("color", payload.color || null)
    .input("features", payload.features || null);

  const response = await request.query(query);
  return response.recordset[0];
};


export const createSpec = async (payload: Specification): Promise<string | number> => {
  const database = getConnectionPool();
  const query = /*sql*/ `
    INSERT INTO crs.vehicle_specifications
      (manufacturer, model, year, fuel_type, engine_capacity, transmission, seating_capacity, color, features)
    VALUES
      (@manufacturer, @model, @year, @fuelType, @engineCapacity, @transmission, @seatingCapacity, @color, @features)
  `;
  const request = database.request()
    .input("manufacturer", payload.manufacturer)
    .input("model", payload.model)
    .input("year", payload.year)
    .input("fuelType", payload.fuelType || null)
    .input("engineCapacity", payload.engineCapacity || null)
    .input("transmission", payload.transmission || null)
    .input("seatingCapacity", payload.seatingCapacity || 0)
    .input("color", payload.color || null)
    .input("features", payload.features || null);

  const response = await request.query(query);
  return response.rowsAffected[0];
}

export const updateSpec = async (specId: string, payload: Partial<Specification>): Promise<number> => {
  const keys = Object.keys(payload);
  if (keys.length === 0) return 0;

  const setClauses: string[] = [];
  const database = getConnectionPool();
  const request = database.request();
  request.input("specId", specId);

  keys.forEach((k, idx) => {
    const dbCol = k.replace(/[A-Z]/g, m => `_${m.toLowerCase()}`);
    const param = `p${idx}`;
    setClauses.push(`${dbCol} = @${param}`);
    request.input(param, (payload as any)[k]);
  });

  const setSql = setClauses.join(", ");
  const query = /*sql*/ `
    UPDATE crs.vehicle_specifications
    SET ${setSql}, updated_at = GETDATE()
    WHERE spec_id = @specId
  `;

  const response = await request.query(query);
  return response.rowsAffected[0];
};

export const deleteSpec = async (specId: string): Promise<number> => {
  const database = getConnectionPool();
  const query = /*sql*/ `
    DELETE FROM crs.vehicle_specifications
    WHERE spec_id = @specId
  `;
  const response = await database.request()
    .input("specId", specId)
    .query(query);
  console.log(response)
  return response.rowsAffected[0];
};