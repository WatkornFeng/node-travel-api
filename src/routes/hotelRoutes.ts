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
import { multerUploadProperty } from "../utils/multer";
const hotelRouter = express.Router();

hotelRouter.route("/hotel-stats").get(getHotelStats);

hotelRouter.route("/").post(createHotel);
hotelRouter
  .route("/upload-image")
  .post(multerUploadProperty, resizeImageHotel, uploadImageHotel);
hotelRouter.route("/:place").get(getAllHotels);
hotelRouter.route("/:place/:id").get(getHotel).patch(updateHotel);

export default hotelRouter;
