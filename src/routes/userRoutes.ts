import express from "express";
import {
  signup,
  jwtCheck,
  // valifytoken,
} from "../controllers/userController";
const userRouter = express.Router();

userRouter.route("/signup").post(jwtCheck, signup);

export default userRouter;
