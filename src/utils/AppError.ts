export class AppError extends Error {
  readonly statusCode: number;
  readonly status: string;
  readonly isOperational: boolean;

  constructor(message: string, statusCode: number, status: string) {
    super(message);
    this.statusCode = statusCode;
    this.status = status;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
