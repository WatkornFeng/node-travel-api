import express from "express";
import {
  attachUser,
  createHotel,
  deleteHotel,
  getAllHotels,
  getHotel,
  getHotelsOnUser,
  getHotelStatsOnUser,
  getHotelWithin,
  getMyHotels,
  imageBufferToString,
  jwtCheck,
  resizeHotelImages,
  updateHotel,
} from "../controllers/hotelController";
import { multerUploadHotelImages } from "../utils/multer";
import reviewRouter from "./reviewRoutes";
const hotelRouter = express.Router({ mergeParams: true });

hotelRouter.use("/:hotelId/reviews", reviewRouter);

hotelRouter.route("/hotel-stats").get(getHotelStatsOnUser);

hotelRouter
  .route("/hotels-within/:distance/center/:latlng/unit/:unit")
  .get(getHotelWithin);

// for admin app
hotelRouter
  .route("/myHotels/:hotelId")
  .get(jwtCheck, getMyHotels)
  .patch(jwtCheck, updateHotel)
  .delete(jwtCheck, deleteHotel);
hotelRouter
  .route("/")
  .get(jwtCheck, getHotelsOnUser)
  .post(
    jwtCheck,
    attachUser,
    multerUploadHotelImages,
    resizeHotelImages,
    imageBufferToString,
    createHotel
  );

// for client app
hotelRouter.route("/:provinceName/:hotelID").get(getHotel);
hotelRouter.route("/:province").get(getAllHotels);

export default hotelRouter;
