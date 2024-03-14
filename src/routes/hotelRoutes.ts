import express from "express";
import reviewRouter from "./reviewRoutes";
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

hotelRouter.use("/:hotelId/reviews", reviewRouter);

hotelRouter.route("/hotel-stats").get(getHotelStats);
hotelRouter
  .route("/upload-image")
  .post(multerUploadProperty, resizeImageHotel, uploadImageHotel);

hotelRouter.route("/").post(createHotel);
hotelRouter.route("/:place").get(getAllHotels);
hotelRouter.route("/:place/:id").get(getHotel).patch(updateHotel);

export default hotelRouter;
