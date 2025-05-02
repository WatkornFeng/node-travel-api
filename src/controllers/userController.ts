import { NextFunction, Request, Response } from "express";
import User from "../models/userModel";
import { AppError } from "../utils/AppError";

interface userData {
  email: string | undefined;
  name: string | undefined;
  locale: string | undefined;
}
export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, name, locale } = req.body as userData;

    let onlyName;
    if (name) {
      onlyName = name.split("@")[0];
    }

    if (!email) {
      return next(new AppError("Please enter email", 400, "fail"));
    }

    // Check if the user already exists in DB return success
    const user = await User.findOne({ email });

    if (user) {
      return res.status(200).json({
        status: "success",
      });
    }

    await User.create({
      name: onlyName,
      email,
      locale,
    });
    return res.status(200).json({
      status: "success",
    });
  } catch (err) {
    next(err);
  }
};

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await User.find();

    res.status(200).json({
      status: "success",
      users,
    });
  } catch (error) {
    next(error);
  }
};

export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await User.findById(req.params.userId).select("-__v");

    res.status(200).json({
      status: "success",
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserByEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findOne({ email: req.params.email }).select(
      "_id name"
    );

    res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
