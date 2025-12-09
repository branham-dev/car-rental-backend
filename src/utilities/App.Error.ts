import type { ContentfulStatusCode } from "hono/utils/http-status";

export class AppError<Data> extends Error {
  public readonly statusCode: ContentfulStatusCode;
  public readonly code: string;
  public readonly operational: boolean;
  public readonly data?: Data;

  constructor(
    message: string,
    statusCode: ContentfulStatusCode = 500,
    code: string = "INTERNAL_ERROR",
    operational: boolean = true,
    data?: Data,
  ) {
    super(message);

    this.statusCode = statusCode;
    this.code = code;
    this.operational = operational;
    this.data = data;

    Object.setPrototypeOf(this, new.target.prototype);

    Error.captureStackTrace(this, this.constructor);
  }
}
