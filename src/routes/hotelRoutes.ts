import express from "express";
import {
  attachUser,
  createHotel,
  getAllHotels,
  getHotel,
  getHotelsOnUser,
  getHotelStatsOnUser,
  getHotelWithin,
  getMyHotels,
  jwtCheck,
  resizeHotelImages,
  updateHotel,
  uploadHotelImagesToCloud,
} from "../controllers/hotelController";
import { multerUploadHotelImages } from "../utils/multer";
import reviewRouter from "./reviewRoutes";
const hotelRouter = express.Router({ mergeParams: true });

hotelRouter.use("/:hotelId/reviews", reviewRouter);

hotelRouter.route("/hotel-stats").get(getHotelStatsOnUser);

hotelRouter
  .route("/hotels-within/:distance/center/:latlng/unit/:unit")
  .get(getHotelWithin);

hotelRouter.route("/myHotels/:hotelId").get(getMyHotels).patch(updateHotel);

hotelRouter
  .route("/")
  .get(getHotelsOnUser)
  .post(
    jwtCheck,
    attachUser,
    multerUploadHotelImages,
    resizeHotelImages,
    uploadHotelImagesToCloud,
    createHotel
  );

hotelRouter.route("/:provinceName/:hotelID").get(getHotel);
hotelRouter.route("/:province").get(getAllHotels);

export default hotelRouter;
