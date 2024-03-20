import express from "express";
import {
  signup,
  jwtCheck,
  getAllUsers,
  getUser,
  // valifytoken,
} from "../controllers/userController";
const userRouter = express.Router();

userRouter.route("/signup").post(jwtCheck, signup);
userRouter.route("/").get(getAllUsers);
userRouter.route("/:userId").get(getUser);

export default userRouter;
