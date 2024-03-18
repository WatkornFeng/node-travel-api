import express from "express";
import reviewRouter from "./reviewRoutes";
import {
  getHotel,
  getAllHotels,
  updateHotel,
  getHotelStats,
  uploadImageHotel,
  resizeImageHotel,
  getHotelWithin,
  createNewHotel,
  createHotel,
} from "../controllers/hotelController";
import { multerCreateProperty, multerUploadProperty } from "../utils/multer";
const hotelRouter = express.Router();

hotelRouter.use("/:hotelId/reviews", reviewRouter);

hotelRouter.route("/hotel-stats").get(getHotelStats);
hotelRouter
  .route("/upload-image")
  .post(multerUploadProperty, resizeImageHotel, uploadImageHotel);
hotelRouter
  .route("/hotels-within/:distance/center/:latlng/unit/:unit")
  .get(getHotelWithin);

// hotelRouter.route("/become-host").post(createNewHotel);

hotelRouter.route("/").post(multerCreateProperty, createHotel);
hotelRouter.route("/:place").get(getAllHotels);
hotelRouter.route("/:place/:id").get(getHotel).patch(updateHotel);

export default hotelRouter;
