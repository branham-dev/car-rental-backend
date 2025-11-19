import type { ContentfulStatusCode } from "hono/utils/http-status";

export class AppError extends Error {
  public readonly statusCode: ContentfulStatusCode;
  public readonly code: string;
  public readonly operational: boolean;

  constructor(
    message: string,
    statusCode: ContentfulStatusCode = 500,
    code: string = "INTERNAL_ERROR",
    operational: boolean = true,
  ) {
    super(message);

    this.statusCode = statusCode;
    this.code = code;
    this.operational = operational;

    Object.setPrototypeOf(this, new.target.prototype);

    Error.captureStackTrace(this, this.constructor);
  }
}
