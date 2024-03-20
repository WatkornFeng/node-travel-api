import { NextFunction, Request, Response } from "express";
import { auth } from "express-oauth2-jwt-bearer";
import { jwtDecode } from "jwt-decode";
import User from "../models/userModel";
import { AppError } from "../utils/AppError";
import exp from "constants";
export const jwtCheck = auth({
  // change audience later
  audience: "http://localhost:3000/profile",
  issuerBaseURL: "https://dev-e06k0m3jmjbib84g.us.auth0.com/",
  tokenSigningAlg: "RS256",
});
// export const valifytoken = (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const token = req.headers.authorization!.split(" ")[1];
//   // const userData = jwtDecode(token);
//   next();
// };
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
    // console.log(req.headers);

    if (!email) {
      return next(new AppError("Please enter email", 400, "fail"));
    }

    // Check if the user already exists in DB return success
    const user = await User.findOne({ email });
    // console.log(user);
    if (user) {
      // console.log("User already exists");
      return res.status(200).json({
        status: "success",
      });
    }

    await User.create({
      name,
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
    // console.log(users);
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
    const users = await User.findById(req.params.userId)
      .select("-__v")
      .populate({
        path: "property",
        select: "-__v",
        populate: {
          path: "province propertyType amenities",
          select: "name",
        },
      });

    res.status(200).json({
      status: "success",
      users,
    });
  } catch (error) {
    next(error);
  }
};
