import express from "express";
import reviewRouter from "./reviewRoutes";
import {
  getHotel,
  getAllHotels,
  updateHotel,
  getHotelStats,
  getHotelWithin,
  // createNewHotel,
  createHotel,
  resizeHotelImages,
  uploadHotelImagesToCloud,
  // uploadIHotelImagesToDB,
} from "../controllers/hotelController";
import { multerUploadHotelImages } from "../utils/multer";
const hotelRouter = express.Router();

hotelRouter.use("/:hotelId/reviews", reviewRouter);

hotelRouter.route("/hotel-stats").get(getHotelStats);
// hotelRouter
//   .route("/upload-image")
//   .post(multerUploadProperty, resizeHotelImages, uploadIHotelImagesToDB);
hotelRouter
  .route("/hotels-within/:distance/center/:latlng/unit/:unit")
  .get(getHotelWithin);

// hotelRouter.route("/become-host").post(createNewHotel);

hotelRouter
  .route("/")
  .post(
    multerUploadHotelImages,
    resizeHotelImages,
    uploadHotelImagesToCloud,
    createHotel
  );
hotelRouter.route("/:place").get(getAllHotels);
hotelRouter.route("/:place/:id").get(getHotel).patch(updateHotel);

export default hotelRouter;
