import multer from "multer";
import { MAX_UPLOAD_PICTURE_SIZE } from "./constants";
import PropertyType from "../models/propertyTypeModel";
const storage = multer.memoryStorage();
const multerUploadProperty = multer({ storage }).single("image");
const multerCreateProperty = multer({
  storage,
  limits: { fileSize: MAX_UPLOAD_PICTURE_SIZE },
}).fields([{ name: "pictures" }]);

const multerUploadsProvinces = multer({
  storage,
  limits: { fileSize: MAX_UPLOAD_PICTURE_SIZE },
}).fields([
  { name: "picture", maxCount: 1 },
  { name: "cover", maxCount: 1 },
]);
export { multerUploadsProvinces, multerUploadProperty, multerCreateProperty };
