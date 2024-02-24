import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";
import mongoose from "mongoose";
import {
  InvalidTokenError,
  UnauthorizedError,
} from "express-oauth2-jwt-bearer";

const handleCastErrorDB = (err: mongoose.Error.CastError) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400, "fail");
};
const handleDuplicateFieldsDB = (err: any) => {
  const value = err.keyValue.name;
  const message = `Duplicate field value ${value}. Please use another value`;
  return new AppError(message, 400, "fail");
};
const handleValidationErrorDB = (err: mongoose.Error.ValidationError) => {
  const errors = Object.values(err.errors).map((field) => field.message);
  return new AppError(`${errors}`, 400, "fail");
};

const handleUnauthorizedError = (err: UnauthorizedError) => {
  return new AppError(
    "Unauthorized user!, Please log in again",
    err.status,
    "fail"
  );
};
const handleInvalidTokenError = (err: InvalidTokenError) => {
  return new AppError(
    "Invalid token! Please log in again.",
    err.statusCode,
    "fail"
  );
};
const sendProdErr = (err: AppError, res: Response) => {
  //Operation error,trust error:send to client
  if (err.isOperational) {
    const { statusCode, status, message } = err;
    return res.status(statusCode).json({
      status,
      message,
    });
    // Programing errror,unknown error
  } else {
    console.error("ERROR 💥", err);
    return res.status(500).json({
      status: "error",
      message: "something went wrong",
    });
  }
};
const sendDevErr = (err: Error, res: Response) => {
  const { message, stack, name } = err;
  return res.status(500).json({
    err,
    name,
    stack,
    message,
  });
};

function globalErrorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (process.env.NODE_ENV === "production") {
    let error: Error = Object.assign(err);
    // handle Mongoose,Mongo DB error
    if (error instanceof mongoose.Error.CastError)
      error = handleCastErrorDB(error);
    if (error instanceof mongoose.Error.ValidationError)
      error = handleValidationErrorDB(error);
    if (error.name === "MongoServerError")
      error = handleDuplicateFieldsDB(error);
    //new
    if (error instanceof UnauthorizedError)
      error = handleUnauthorizedError(error);
    if (error instanceof InvalidTokenError)
      error = handleInvalidTokenError(error);

    if (error instanceof AppError) {
      return sendProdErr(error, res);
    }
  }
  sendDevErr(err, res);
}

export default globalErrorHandler;