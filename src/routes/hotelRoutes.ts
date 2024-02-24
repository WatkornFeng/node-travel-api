import express from "express";
import {
  getHotel,
  getAllHotels,
  createHotel,
  updateHotel,
  getHotelStats,
  uploadImageHotel,
  resizeImageHotel,
} from "../controllers/hotelController";
import { multerUploads } from "../utils/multer";
const hotelRouter = express.Router();

hotelRouter.route("/hotel-stats").get(getHotelStats);

hotelRouter.route("/").post(createHotel);
hotelRouter
  .route("/upload-image")
  .post(multerUploads, resizeImageHotel, uploadImageHotel);
hotelRouter.route("/:place").get(getAllHotels);
hotelRouter.route("/:place/:slug").get(getHotel).patch(updateHotel);

export default hotelRouter;
