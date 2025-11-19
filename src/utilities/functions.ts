import type { StatusState } from "utilities/types.js";


export const generateResponse = <T>(
  success: boolean,
  message: string,
  data: T,
): StatusState<T> => ({ success, message, data });



const toCamel = (str: string) => str.replace(/_([a-z])/g, (_, x) => x.toUpperCase());

export const camelCaseKey = (obj: Record<string, any>) => {
  const entries = Object.entries(obj).map(([key, value]) => {
    return [toCamel(key), value];
  });
  return Object.fromEntries(entries);
};

export const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};