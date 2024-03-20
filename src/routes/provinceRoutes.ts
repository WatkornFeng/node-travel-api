import express from "express";
import {
  getAllProvinces,
  resizeProvincesImage,
  uploadProvinceImageToDB,
} from "../controllers/provinceController";

import { multerUploadsProvinceImages } from "../utils/multer";
const provincecRouter = express.Router();

provincecRouter
  .route("/")
  .get(getAllProvinces)
  .post(
    multerUploadsProvinceImages,
    resizeProvincesImage,
    uploadProvinceImageToDB
  );

export default provincecRouter;
