import express from "express";
import {
  getAllProvinces,
  getProvince,
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

provincecRouter.route("/:provinceId").get(getProvince);

export default provincecRouter;
