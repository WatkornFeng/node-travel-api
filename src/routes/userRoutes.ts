import express from "express";
import {
  signup,
  getAllUsers,
  getUser,
  getUserByEmail,
} from "../controllers/userController";
import hotelRouter from "./hotelRoutes";
import { jwtCheck } from "../controllers/hotelController";
const userRouter = express.Router();

userRouter.use("/:userId/hotels", hotelRouter);
userRouter.use("/:userId/stat", hotelRouter);

userRouter.route("/admin/:email").get(jwtCheck, getUserByEmail);
userRouter.route("/signup").post(jwtCheck, signup);
userRouter.route("/").get(getAllUsers);
userRouter.route("/:userId").get(getUser);

export default userRouter;
