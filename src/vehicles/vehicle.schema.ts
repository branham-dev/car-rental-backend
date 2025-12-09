import { AppError } from "@/utilities/App.Error.js";

type Schema = typeof schema;
type Key = keyof Schema;

export const schema = {
  vehicleId: (val: unknown) => {
    return typeof val === "string" && /^VEH\d+$/.test(val);
  },
  isAvailable: (val: unknown) => {
    return val === true || val === false || val === "true" || val === "false";
  },
  rentalRate: (val: unknown) => {
    return typeof val === "number" && val >= 0 && val <= 10000;
  }
};

const schemaKeys = Object.keys(schema) as Key[];

export const validateVehicle = <T extends Record<Key, unknown>>(payload: T) => {
  // console.log(payload)
  // return;
  const fieldErrors: Partial<Record<Key, string>> = {};

  for (const key of schemaKeys) {
    const validator = schema[key];
    if (!validator(payload[key])) {
      fieldErrors[key] = `Invalid value for ${key}: ${payload[key]}`
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    throw new AppError("Validation failed", 400, "VEHICLE_UPDATE_SCHEMA", false, fieldErrors);
  }

  if (payload.isAvailable === "true") payload.isAvailable = true;
  if (payload.isAvailable === "false") payload.isAvailable = false;

  return payload as {
    vehicleId: string;
    isAvailable: boolean;
    rentalRate: number;
  };
}