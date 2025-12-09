import type { StatusState } from "utilities/types.js";


export const generateResponse = <T>(
  success: boolean,
  message: string,
  data: T,
  code?: string,
): StatusState<T> => ({ success, message, code, data });



// const toCamel = (str: string) => str.replace(/_([a-z])/g, (_, x) => x.toUpperCase());

export const camelCaseKey = (obj: Record<string, any>) => {
  const entries = Object.entries(obj).map(([key, value]) => {
    return [toCamel(key), value];
  });
  return Object.fromEntries(entries);
};

const toCamel = (str: string) => str.replace(/_([a-z])/g, (_, x) => x.toUpperCase());

export const camelCaseObject = (obj: Record<string, any>) =>
  Object.fromEntries(Object.entries(obj).map(([k, v]) => [toCamel(k), v]));

export const camelCaseKeys = (rows: Record<string, any> | Record<string, any>[]) => {
  if (Array.isArray(rows)) {
    return rows.map(r => camelCaseObject(r));
  }
  return camelCaseObject(rows);
};


export const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

// export const omitPassword = <T extends { password?: string }>(obj: T) => {
//   // destructure and return rest so password is not present
//   // this constructs a new object that will never contain password
//   const { password, ...rest } = obj as any;
//   return rest as Omit<T, "password">;
// };

export const omitPassword = <T extends { password?: string }>(obj: T): Omit<T, "password"> => {
  const { password, ...rest } = obj;
  return rest;
};


export const toBit = (value: boolean | undefined): 0 | 1 => {
  return value ? 1 : 0;
}