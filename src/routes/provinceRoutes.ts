import express from "express";
import {
  getAllProvinces,
  resizeProvincesImage,
  uploadImageProvinces,
} from "../controllers/provinceController";
import { uploadImageHotel } from "../controllers/hotelController";
import { multerUploadsProvinces } from "../utils/multer";
const provincecRouter = express.Router();

provincecRouter
  .route("/")
  .get(getAllProvinces)
  .post(multerUploadsProvinces, resizeProvincesImage, uploadImageProvinces);

export default provincecRouter;
