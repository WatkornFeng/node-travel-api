import express from "express";
import {
  createFavorite,
  deleteFavorite,
  getMyFavorite,
} from "../controllers/favoriteController";
import { attachUser, jwtCheck } from "../controllers/hotelController";

const favoriteRouter = express.Router();
// Apply jwtCheck to all routes with "/"
favoriteRouter.use("/", jwtCheck, attachUser);
favoriteRouter
  .route("/")
  .get(getMyFavorite)
  .post(createFavorite)
  .delete(deleteFavorite);

export default favoriteRouter;
