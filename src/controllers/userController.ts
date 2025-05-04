import type { Request, Response, NextFunction } from "express";
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

    if (!email) {
      return next(new AppError("Please enter email", 400, "fail"));
    }

    // Check if the user already exists in DB return success
    const user = await User.findOne({ email });

    if (user) {
      return res.status(200).json({
        status: "success",
        message: "Login success",
      });
    }
    const onlyName = name ? name.split("@")[0] : undefined;
    await User.create({
      name: onlyName || "User",
      email,
      locale,
    });
    return res.status(200).json({
      status: "success",
      message: "Sign up success",
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
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({
        status: "fail",
        message: "Email parameter is required",
      });
    }
    const user = await User.findOne({ email }).select("_id name");
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
