import express from "express";
import {
  getAllProvinces,
  getProvince,
  getSixProvinces,
  resizeProvincesImage,
  uploadProvinceImageToDB,
} from "../controllers/provinceController";

import { multerUploadsProvinceImages } from "../utils/multer";
const provincecRouter = express.Router();

provincecRouter.route("/province/:provinceName").get(getProvince);
provincecRouter.route("/sixProvinces").get(getSixProvinces);
provincecRouter
  .route("/")
  .get(getAllProvinces)
  .post(
    multerUploadsProvinceImages,
    resizeProvincesImage,
    uploadProvinceImageToDB
  );

export default provincecRouter;
