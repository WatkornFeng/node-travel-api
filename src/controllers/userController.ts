import { NextFunction, Request, Response } from "express";
import { auth } from "express-oauth2-jwt-bearer";
import { jwtDecode } from "jwt-decode";
import User from "../models/userModel";
import { AppError } from "../utils/AppError";
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
    if (!email || !name) {
      return next(new AppError("Please enter email and name", 400, "fail"));
    }
    // console.log(userData);
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
