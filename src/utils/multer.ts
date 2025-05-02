import multer from "multer";
import { MAX_UPLOAD_PICTURE_SIZE } from "./constants";

const storage = multer.memoryStorage();

const multerUploadHotelImages = multer({
  storage,
  limits: { fileSize: MAX_UPLOAD_PICTURE_SIZE },
}).fields([{ name: "pictures" }]);

const multerUploadsProvinceImages = multer({
  storage,
  limits: { fileSize: MAX_UPLOAD_PICTURE_SIZE },
}).fields([
  { name: "picture", maxCount: 1 },
  { name: "cover", maxCount: 1 },
]);
export { multerUploadsProvinceImages, multerUploadHotelImages };
