import express from "express";
import {
  signup,
  jwtCheck,
  getAllUsers,
  // valifytoken,
} from "../controllers/userController";
const userRouter = express.Router();

userRouter.route("/signup").post(jwtCheck, signup);
userRouter.route("/").get(getAllUsers);

export default userRouter;
