import multer from "multer";
import { MAX_UPLOAD_PICTURE_SIZE } from "./constants";
const storage = multer.memoryStorage();
const multerUploadProperty = multer({ storage }).single("image");
const multerUploadsProvinces = multer({
  storage,
  limits: { fileSize: MAX_UPLOAD_PICTURE_SIZE },
}).fields([
  { name: "name", maxCount: 1 },
  { name: "picture", maxCount: 1 },
  { name: "cover", maxCount: 1 },
]);
export { multerUploadsProvinces, multerUploadProperty };
