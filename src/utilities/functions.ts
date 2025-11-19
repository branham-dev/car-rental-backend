import type { StatusState } from "utilities/types.js";


export const generateResponse = <T>(
  success: boolean,
  message: string,
  data: T,
): StatusState<T> => ({ success, message, data });